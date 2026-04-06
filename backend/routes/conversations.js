const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const Conversation = require('../models/Conversation');
const ollamaClient = require('../utils/ollamaClient');
const conversationManager = require('../utils/conversationManager');
const biasAnalyzer = require('../utils/biasAnalyzer');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// Middleware to check conversation ownership
const checkConversationOwnership = asyncHandler(async (req, res, next) => {
  const conv = await Conversation.findById(req.params.id);
  if (!conv) {
    return next(new AppError('Conversation not found', 404));
  }
  if (conv.userId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }
  req.conversation = conv;
  next();
});

/**
 * GET /api/conversations
 * List all conversations for the user
 */
router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const conversations = await Conversation.find({ userId: req.user._id })
      .select('_id title controls createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      conversations: conversations.map(conv => ({
        id: conv._id,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messageCount: conv.messages.length,
        persona: conv.controls?.role || 'default',
      })),
    });
  })
);

/**
 * POST /api/conversations
 * Create a new conversation
 */
router.post(
  '/',
  auth,
  validate('createConversation'),
  asyncHandler(async (req, res) => {
    const { title, controls = {} } = req.body;

    const conversation = new Conversation({
      userId: req.user._id,
      title: title || `Conversation ${new Date().toLocaleDateString()}`,
      messages: [],
      controls: {
        role: controls.role || 'unbiased-assistant',
        tone: controls.tone || 'neutral',
        audience: controls.audience || 'general',
        model: controls.model || 'llama2',
        temperature: controls.temperature || 0.7,
        top_p: controls.top_p || 0.9,
      },
    });

    await conversation.save();
    logger.info(`Conversation created: ${conversation._id}`);

    res.status(201).json({
      success: true,
      conversation: {
        id: conversation._id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        messages: conversation.messages,
        controls: conversation.controls,
      },
    });
  })
);

/**
 * GET /api/conversations/:id
 * Get a specific conversation
 */
router.get(
  '/:id',
  auth,
  checkConversationOwnership,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      conversation: req.conversation,
    });
  })
);

/**
 * PUT /api/conversations/:id
 * Update conversation controls or title
 */
router.put(
  '/:id',
  auth,
  checkConversationOwnership,
  validate('updateConversation'),
  asyncHandler(async (req, res) => {
    const { title, controls } = req.body;

    if (title) {
      req.conversation.title = title;
    }

    if (controls) {
      req.conversation.controls = {
        ...req.conversation.controls,
        ...controls,
      };
    }

    await req.conversation.save();

    res.json({
      success: true,
      conversation: req.conversation,
    });
  })
);

/**
 * DELETE /api/conversations/:id
 * Delete a conversation
 */
router.delete(
  '/:id',
  auth,
  checkConversationOwnership,
  asyncHandler(async (req, res) => {
    await Conversation.findByIdAndDelete(req.params.id);
    logger.info(`Conversation deleted: ${req.params.id}`);
    res.json({ success: true });
  })
);

/**
 * POST /api/conversations/:id/messages
 * Send a message and get AI response
 */
router.post(
  '/:id/messages',
  auth,
  checkConversationOwnership,
  validate('sendMessage'),
  asyncHandler(async (req, res) => {
    const { userMessage, isStream = false } = req.body;

    // Add user message
    const userMsg = {
      id: uuidv4(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    req.conversation.messages.push(userMsg);

    // Build system prompt
    const systemPrompt = conversationManager.buildSystemPrompt(req.conversation.controls);
    const systemMsg = { role: 'system', content: systemPrompt };
    const messagesToSend = conversationManager.compressConversation(
      [systemMsg, ...req.conversation.messages],
      3000
    );

    if (isStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const aiResponse = await ollamaClient.generateResponseStream(
        messagesToSend,
        {
          model: req.conversation.controls.model,
          temperature: req.conversation.controls.temperature,
          top_p: req.conversation.controls.top_p,
          num_predict: 2000,
        },
        (chunk) => {
          res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
        }
      );

      // Save after streaming completes
      const assistantMsg = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      req.conversation.messages.push(assistantMsg);
      req.conversation.metadata.tokenCount += conversationManager.estimateTokens(aiResponse);
      await req.conversation.save();

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } else {
      // Non-streaming response
      const aiResponse = await ollamaClient.generateResponse(
        messagesToSend,
        {
          model: req.conversation.controls.model,
          temperature: req.conversation.controls.temperature,
          top_p: req.conversation.controls.top_p,
          num_predict: 2000,
        }
      );

      const assistantMsg = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      req.conversation.messages.push(assistantMsg);
      req.conversation.metadata.tokenCount += conversationManager.estimateTokens(aiResponse);
      await req.conversation.save();

      res.json({
        success: true,
        userMessage: userMsg,
        assistantMessage: assistantMsg,
        conversationLength: req.conversation.messages.length,
      });
    }
  })
);

/**
 * POST /api/conversations/:id/analyze
 * Analyze the latest response
 */
router.post(
  '/:id/analyze',
  auth,
  checkConversationOwnership,
  asyncHandler(async (req, res) => {
    const latestAssistant = [...req.conversation.messages]
      .reverse()
      .find(m => m.role === 'assistant');

    if (!latestAssistant) {
      return res.status(400).json({
        success: false,
        error: 'No assistant message to analyze',
      });
    }

    const analysis = biasAnalyzer.analyze(latestAssistant.content);
    const suggestions = biasAnalyzer.suggestAlternatives(latestAssistant.content, analysis.issues);

    req.conversation.metadata.analysisCount += 1;
    req.conversation.metadata.lastAnalyzedAt = new Date();
    await req.conversation.save();

    res.json({
      success: true,
      messageId: latestAssistant.id,
      analysis,
      suggestions,
    });
  })
);

module.exports = router;
