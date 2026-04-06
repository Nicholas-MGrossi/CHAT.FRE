const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const ollamaClient = require('../utils/ollamaClient');
const conversationManager = require('../utils/conversationManager');
const biasAnalyzer = require('../utils/biasAnalyzer');

// In-memory conversation storage (in production, use a database)
const conversations = new Map();

/**
 * GET /api/conversations
 * List all conversations
 */
router.get('/', (req, res) => {
  const convList = Array.from(conversations.values()).map(conv => ({
    id: conv.id,
    title: conv.title,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
    messageCount: conv.messages.length,
    persona: conv.controls?.role || 'default',
  }));

  res.json({
    conversations: convList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
  });
});

/**
 * POST /api/conversations
 * Create a new conversation
 */
router.post('/', (req, res) => {
  const { title, controls = {} } = req.body;

  const conversation = {
    id: uuidv4(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  conversations.set(conversation.id, conversation);

  res.status(201).json(conversation);
});

/**
 * GET /api/conversations/:id
 * Get a specific conversation
 */
router.get('/:id', (req, res) => {
  const conv = conversations.get(req.params.id);

  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  res.json(conv);
});

/**
 * PUT /api/conversations/:id
 * Update conversation controls or title
 */
router.put('/:id', (req, res) => {
  const conv = conversations.get(req.params.id);

  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  if (req.body.title) {
    conv.title = req.body.title;
  }

  if (req.body.controls) {
    conv.controls = { ...conv.controls, ...req.body.controls };
  }

  conv.updatedAt = new Date().toISOString();

  res.json(conv);
});

/**
 * DELETE /api/conversations/:id
 * Delete a conversation
 */
router.delete('/:id', (req, res) => {
  const deleted = conversations.delete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  res.json({ success: true });
});

/**
 * POST /api/conversations/:id/messages
 * Send a message and get AI response
 */
router.post('/:id/messages', async (req, res) => {
  try {
    const { userMessage, isStream = false } = req.body;
    const conv = conversations.get(req.params.id);

    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!userMessage) {
      return res.status(400).json({ error: 'User message is required' });
    }

    // Add user message to history
    const userMsg = {
      id: uuidv4(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    conv.messages.push(userMsg);

    // Build system prompt from controls
    const systemPrompt = conversationManager.buildSystemPrompt(conv.controls);

    // Compile conversation for the model
    const systemMsg = { role: 'system', content: systemPrompt };
    const messagesToSend = conversationManager.compressConversation(
      [systemMsg, ...conv.messages],
      3000 // Token limit
    );

    // Get AI response
    let aiResponse = '';

    if (isStream) {
      // Return streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        aiResponse = await ollamaClient.generateResponseStream(
          messagesToSend,
          {
            model: conv.controls.model || 'llama2',
            temperature: conv.controls.temperature,
            top_p: conv.controls.top_p,
            num_predict: 2000,
          },
          (chunk) => {
            res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
          }
        );

        res.write(`data: ${JSON.stringify({ done: true, response: aiResponse })}\n\n`);
      } catch (error) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      } finally {
        res.end();
      }
    } else {
      // Get full response at once
      aiResponse = await ollamaClient.generateResponse(
        messagesToSend,
        {
          model: conv.controls.model || 'llama2',
          temperature: conv.controls.temperature,
          top_p: conv.controls.top_p,
          num_predict: 2000,
        }
      );

      // Add AI response to history
      const assistantMsg = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      conv.messages.push(assistantMsg);
      conv.updatedAt = new Date().toISOString();

      res.json({
        userMessage: userMsg,
        assistantMessage: assistantMsg,
        conversationLength: conv.messages.length,
      });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/conversations/:id/analyze
 * Analyze the latest AI response for bias/framing
 */
router.post('/:id/analyze', (req, res) => {
  const conv = conversations.get(req.params.id);

  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  // Get the latest assistant message
  const latestAssistant = [...conv.messages]
    .reverse()
    .find(m => m.role === 'assistant');

  if (!latestAssistant) {
    return res.status(400).json({ error: 'No assistant message to analyze' });
  }

  const analysis = biasAnalyzer.analyze(latestAssistant.content);
  const suggestions = biasAnalyzer.suggestAlternatives(latestAssistant.content, analysis.issues);

  res.json({
    messageId: latestAssistant.id,
    analysis,
    suggestions,
  });
});

/**
 * GET /api/conversations/:id/models
 * List available Ollama models
 */
router.get('/status/models', async (req, res) => {
  try {
    const models = await ollamaClient.listModels();
    res.json({ models });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
