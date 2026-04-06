/**
 * Conversation Manager
 * Handles conversation history, compression, and prompt building
 */

class ConversationManager {
  /**
   * Build system prompt based on intent/tone controls
   */
  buildSystemPrompt(controls = {}) {
    const {
      role = 'unbiased-assistant',
      tone = 'neutral',
      audience = 'general',
    } = controls;

    let systemPrompt = `You are a helpful assistant focused on clear, unbiased communication.

Your role is: ${role}
Your tone should be: ${tone}
Your audience is: ${audience}

CRITICAL INSTRUCTION: You are specifically designed to:
1. Identify framing, loaded language, and potential manipulation in text
2. Provide alternative framings that reduce bias and emotional escalation
3. Flag gaslighting patterns: identity inflation, definition shifts, confusion of condition vs. identity, tone aggression
4. Always remain neutral and human-controlled - you amplify human intent, never push your own agenda
5. When analyzing text, be explicit about WHY a particular wording might gaslight or manipulate
6. Present your analysis clearly so the human can review and decide

Remember: The human makes the final decision. Your job is to illuminate options and risks.`;

    return systemPrompt;
  }

  /**
   * Compile conversation into prompt string
   * Takes last N messages to fit within token limits
   */
  compileConversationPrompt(messages, maxMessages = 10, systemPrompt = '') {
    // Keep system message + last N user/assistant pairs
    const systemMessages = messages.filter(m => m.role === 'system');
    const otherMessages = messages.filter(m => m.role !== 'system');
    
    // Trim old messages if over limit
    const trimmedMessages = otherMessages.slice(-maxMessages);
    
    const allMessages = [...systemMessages, ...trimmedMessages];
    
    return allMessages;
  }

  /**
   * Estimate token count (rough approximation)
   * English: ~1 token per 4 chars; code ~1 token per 3 chars
   */
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  /**
   * Compress old turns into a summary if too long
   * For now, just trim - in production, could use extractive summarization
   */
  compressConversation(messages, maxTokens = 2000) {
    let totalTokens = 0;
    const compressed = [];

    // Always keep system messages
    const systemMsgs = messages.filter(m => m.role === 'system');
    systemMsgs.forEach(m => compressed.push(m));

    // Add recent messages up to token limit
    const otherMsgs = messages.filter(m => m.role !== 'system').reverse();
    for (const msg of otherMsgs) {
      const msgTokens = this.estimateTokens(msg.content);
      if (totalTokens + msgTokens > maxTokens && compressed.length > 2) {
        // Stop adding messages if we exceed limit
        break;
      }
      compressed.unshift(msg);
      totalTokens += msgTokens;
    }

    return compressed.reverse();
  }

  /**
   * Format conversation for display (with timestamps, etc.)
   */
  formatForDisplay(messages) {
    return messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp || new Date().toISOString(),
    }));
  }
}

module.exports = new ConversationManager();
