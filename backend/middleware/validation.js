// middleware/validation.js - Request validation schemas and middleware
const Joi = require('joi');
const logger = require('../config/logger');

// Validation schemas
const schemas = {
  // Auth
  register: Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().min(8).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Conversations
  createConversation: Joi.object({
    title: Joi.string().max(200).optional(),
    controls: Joi.object({
      role: Joi.string().valid('unbiased-assistant', 'legal-advisor', 'therapist', 'technical', 'casual'),
      tone: Joi.string().valid('neutral', 'assertive', 'empathetic', 'authoritative', 'friendly'),
      audience: Joi.string().valid('general', 'expert', 'layperson', 'academic', 'professional'),
      model: Joi.string(),
      temperature: Joi.number().min(0).max(1),
      top_p: Joi.number().min(0).max(1),
    }).optional(),
  }),

  updateConversation: Joi.object({
    title: Joi.string().max(200).optional(),
    controls: Joi.object({
      role: Joi.string().valid('unbiased-assistant', 'legal-advisor', 'therapist', 'technical', 'casual'),
      tone: Joi.string().valid('neutral', 'assertive', 'empathetic', 'authoritative', 'friendly'),
      audience: Joi.string().valid('general', 'expert', 'layperson', 'academic', 'professional'),
      model: Joi.string(),
      temperature: Joi.number().min(0).max(1),
      top_p: Joi.number().min(0).max(1),
    }).optional(),
  }),

  // Messages
  sendMessage: Joi.object({
    userMessage: Joi.string().min(1).max(5000).required(),
    isStream: Joi.boolean().optional(),
  }),

  // Analysis
  analyzeText: Joi.object({
    text: Joi.string().min(1).max(10000).required(),
  }),

  compareText: Joi.object({
    original: Joi.string().min(1).max(10000).required(),
    modified: Joi.string().min(1).max(10000).required(),
  }),
};

// Validation middleware factory
const validate = (schemaKey) => {
  return (req, res, next) => {
    if (!schemas[schemaKey]) {
      logger.warn(`Validation schema not found: ${schemaKey}`);
      return next();
    }

    const { error, value } = schemas[schemaKey].validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map(detail => detail.message);
      logger.warn(`Validation failed: ${messages.join(', ')}`);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: messages,
      });
    }

    // Replace body with validated value
    req.body = value;
    next();
  };
};

module.exports = { validate, schemas };
