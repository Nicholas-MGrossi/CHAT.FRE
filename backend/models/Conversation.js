// models/Conversation.js - Conversation model
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  id: String,
  role: { type: String, enum: ['user', 'assistant', 'system'] },
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const ConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Conversation title is required'],
    maxlength: 200,
  },
  messages: [MessageSchema],
  controls: {
    role: {
      type: String,
      enum: ['unbiased-assistant', 'legal-advisor', 'therapist', 'technical', 'casual'],
      default: 'unbiased-assistant',
    },
    tone: {
      type: String,
      enum: ['neutral', 'assertive', 'empathetic', 'authoritative', 'friendly'],
      default: 'neutral',
    },
    audience: {
      type: String,
      enum: ['general', 'expert', 'layperson', 'academic', 'professional'],
      default: 'general',
    },
    model: {
      type: String,
      default: 'llama2',
    },
    temperature: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.7,
    },
    top_p: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.9,
    },
  },
  metadata: {
    tokenCount: { type: Number, default: 0 },
    analysisCount: { type: Number, default: 0 },
    lastAnalyzedAt: Date,
  },
  isArchived: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-update timestamp
ConversationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for queries
ConversationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
