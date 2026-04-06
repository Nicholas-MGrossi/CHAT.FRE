import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loadConversations, saveConversation, loadConversationDetails } from '../utils/localStorage';
import * as api from '../utils/api';

const ConversationContext = createContext();

export function ConversationProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [controls, setControls] = useState({
    role: 'unbiased-assistant',
    tone: 'neutral',
    audience: 'general',
    model: 'llama2',
    temperature: 0.7,
    top_p: 0.9,
  });

  // Load conversations on mount
  useEffect(() => {
    loadInitialConversations();
  }, []);

  const loadInitialConversations = async () => {
    try {
      const convs = await api.getConversations();
      setConversations(convs);
      
      // Load from localStorage as fallback
      const saved = loadConversations();
      if (convs.length === 0 && saved.length > 0) {
        setConversations(saved);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      const saved = loadConversations();
      setConversations(saved);
    }
  };

  const createNewConversation = useCallback(async (title = null) => {
    try {
      const conv = await api.createConversation(title, controls);
      setConversations(prev => [conv, ...prev]);
      switchConversation(conv);
      return conv;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [controls]);

  const switchConversation = useCallback(async (conversation) => {
    try {
      setCurrentConversation(conversation);
      const details = conversation.messages 
        ? conversation 
        : await api.getConversation(conversation.id);
      setMessages(details.messages || []);
      setControls(details.controls || {
        role: 'unbiased-assistant',
        tone: 'neutral',
        audience: 'general',
        model: 'llama2',
        temperature: 0.7,
        top_p: 0.9,
      });
      setAnalysisResult(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId) => {
    try {
      await api.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [currentConversation]);

  const sendMessage = useCallback(async (userMessage) => {
    if (!currentConversation) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.sendMessage(currentConversation.id, userMessage, false);

      // Update messages
      setMessages(prev => [...prev, response.userMessage, response.assistantMessage]);

      // Save to localStorage
      saveConversation({
        ...currentConversation,
        messages: [...messages, response.userMessage, response.assistantMessage],
      });

      // Update conversation in list
      setConversations(prev =>
        prev.map(c =>
          c.id === currentConversation.id
            ? { ...c, updatedAt: new Date().toISOString() }
            : c
        )
      );

      // Auto-analyze the response
      analyzeLatestResponse();

      return response.assistantMessage;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, messages]);

  const analyzeLatestResponse = useCallback(async () => {
    if (!currentConversation) return;

    try {
      const analysis = await api.analyzeConversation(currentConversation.id);
      setAnalysisResult(analysis);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  }, [currentConversation]);

  const updateControls = useCallback(async (newControls) => {
    if (!currentConversation) return;

    try {
      const updated = await api.updateConversation(currentConversation.id, {
        controls: { ...controls, ...newControls }
      });
      setControls(updated.controls);
      setCurrentConversation(updated);
    } catch (err) {
      setError(err.message);
    }
  }, [currentConversation, controls]);

  const resetConversation = useCallback(async () => {
    if (!currentConversation) return;

    try {
      const conv = await api.createConversation(`${currentConversation.title} (Reset)`, controls);
      setConversations(prev => [conv, ...prev]);
      switchConversation(conv);
    } catch (err) {
      setError(err.message);
    }
  }, [currentConversation, controls, switchConversation]);

  const value = {
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    analysisResult,
    controls,
    createNewConversation,
    switchConversation,
    deleteConversation,
    sendMessage,
    analyzeLatestResponse,
    updateControls,
    resetConversation,
    setError,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within ConversationProvider');
  }
  return context;
}
