const axios = require('axios');

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';

class OllamaClient {
  /**
   * Call Ollama API with conversation messages
   * @param {Array} messages - Array of {role, content} objects
   * @param {Object} options - { model, temperature, top_p, num_predict }
   * @returns {Promise<string>} - The model's response
   */
  async generateResponse(messages, options = {}) {
    const {
      model = 'llama2',
      temperature = 0.7,
      top_p = 0.9,
      num_predict = 2000,
    } = options;

    try {
      // Convert message array to a single prompt string
      let prompt = '';
      for (const msg of messages) {
        if (msg.role === 'system') {
          prompt += `${msg.content}\n\n`;
        } else if (msg.role === 'user') {
          prompt += `User: ${msg.content}\n\n`;
        } else if (msg.role === 'assistant') {
          prompt += `Assistant: ${msg.content}\n\n`;
        }
      }

      // Add prompt for next response
      prompt += 'Assistant:';

      const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
        model,
        prompt,
        stream: false,
        temperature,
        top_p,
        num_predict,
      });

      return response.data.response || '';
    } catch (error) {
      console.error('Ollama API error:', error.message);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Stream response from Ollama (for real-time updates)
   * @param {Array} messages - Array of {role, content} objects
   * @param {Object} options - { model, temperature, top_p, num_predict }
   * @param {Function} onChunk - Callback for each chunk
   * @returns {Promise<string>} - Full accumulated response
   */
  async generateResponseStream(messages, options = {}, onChunk) {
    const {
      model = 'llama2',
      temperature = 0.7,
      top_p = 0.9,
      num_predict = 2000,
    } = options;

    let prompt = '';
    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += `${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.content}\n\n`;
      }
    }
    prompt += 'Assistant:';

    try {
      const response = await axios.post(
        `${OLLAMA_API_URL}/api/generate`,
        {
          model,
          prompt,
          stream: true,
          temperature,
          top_p,
          num_predict,
        },
        { responseType: 'stream' }
      );

      let fullResponse = '';
      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(Boolean);
          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              if (json.response) {
                fullResponse += json.response;
                if (onChunk) onChunk(json.response);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        });

        response.data.on('error', reject);
        response.data.on('end', () => resolve(fullResponse));
      });
    } catch (error) {
      console.error('Ollama streaming error:', error.message);
      throw new Error(`Failed to stream response: ${error.message}`);
    }
  }

  /**
   * Check if Ollama is available
   */
  async isAvailable() {
    try {
      const response = await axios.get(`${OLLAMA_API_URL}/api/tags`, { timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Ollama not available:', error.message);
      return false;
    }
  }

  /**
   * List available models
   */
  async listModels() {
    try {
      const response = await axios.get(`${OLLAMA_API_URL}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      console.error('Failed to list models:', error.message);
      return [];
    }
  }
}

module.exports = new OllamaClient();
