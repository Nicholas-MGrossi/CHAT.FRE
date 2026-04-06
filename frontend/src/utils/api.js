import axios from 'axios';
import { getToken } from './auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Add JWT token to every request
api.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Handle 401 responses (token expired/invalid)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, clear auth and redirect to login
      localStorage.removeItem('chatfree_token');
      localStorage.removeItem('chatfree_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Conversations API
export async function getConversations() {
  const response = await api.get('/conversations');
  return response.data.conversations;
}

export async function createConversation(title, controls = {}) {
  const response = await api.post('/conversations', { title, controls });
  return response.data;
}

export async function getConversation(id) {
  const response = await api.get(`/conversations/${id}`);
  return response.data;
}

export async function updateConversation(id, updates) {
  const response = await api.put(`/conversations/${id}`, updates);
  return response.data;
}

export async function deleteConversation(id) {
  await api.delete(`/conversations/${id}`);
}

// Messages API
export async function sendMessage(conversationId, userMessage, isStream = false) {
  const response = await api.post(`/conversations/${conversationId}/messages`, {
    userMessage,
    isStream,
  });
  return response.data;
}

export async function streamMessage(conversationId, userMessage, onChunk) {
  const response = await api.post(
    `/conversations/${conversationId}/messages`,
    {
      userMessage,
      isStream: true,
    },
    {
      responseType: 'text',
    }
  );

  // Parse server-sent events
  const lines = response.data.split('\n');
  let fullResponse = '';

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const data = JSON.parse(line.slice(6));
        if (data.token) {
          fullResponse += data.token;
          if (onChunk) onChunk(data.token);
        }
        if (data.done) {
          return { content: fullResponse };
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }

  return { content: fullResponse };
}

// Analysis API
export async function analyzeConversation(conversationId) {
  const response = await api.post(`/conversations/${conversationId}/analyze`);
  return response.data;
}

export async function analyzeText(text) {
  const response = await api.post('/analyze/text', { text });
  return response.data;
}

export async function compareText(original, modified) {
  const response = await api.post('/analyze/compare', { original, modified });
  return response.data;
}

export async function listModels() {
  try {
    const response = await api.get('/conversations/status/models');
    return response.data.models || [];
  } catch (error) {
    console.error('Failed to list models:', error);
    return [];
  }
}

// Health check
export async function healthCheck() {
  const response = await axios.get('http://localhost:3001/api/health');
  return response.data;
}

// Authentication API
export async function register(email, username, password) {
  const response = await api.post('/auth/register', {
    email,
    username,
    password,
  });
  return response.data;
}

export async function login(email, password) {
  const response = await api.post('/auth/login', {
    email,
    password,
  });
  return response.data;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Even if logout fails on backend, we clear local storage
    console.error('Logout error:', error);
  }
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data.user;
}

export async function updateProfile(updates) {
  const response = await api.put('/auth/update-profile', updates);
  return response.data.user;
}
