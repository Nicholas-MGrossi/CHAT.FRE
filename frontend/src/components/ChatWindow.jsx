import React, { useState, useRef, useEffect } from 'react';
import { useConversation } from '../contexts/ConversationContext';
import MessageBubble from './MessageBubble';
import { FiSend, FiRefreshCw } from 'react-icons/fi';
import '../styles/chatwindow.css';

function ChatWindow() {
  const {
    currentConversation,
    messages,
    isLoading,
    error,
    sendMessage,
    resetConversation,
  } = useConversation();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !currentConversation) return;

    const message = inputValue;
    setInputValue('');

    try {
      await sendMessage(message);
    } catch (err) {
      setInputValue(message); // Restore message on error
    }
  };

  if (!currentConversation) {
    return (
      <div className="chat-window empty-state-main">
        <div className="welcome-section">
          <h1>Welcome to ChatFree</h1>
          <p>Local LLM with unbiased communication tools</p>
          
          <div className="welcome-features">
            <div className="feature">
              <h3>💬 Conversation Memory</h3>
              <p>Full chat history with persistent storage</p>
            </div>
            <div className="feature">
              <h3>🎯 Intent Controls</h3>
              <p>Configure tone, role, and audience</p>
            </div>
            <div className="feature">
              <h3>⚠️ Bias Detection</h3>
              <p>Analyze framing and gaslighting patterns</p>
            </div>
            <div className="feature">
              <h3>✏️ Formatting Tools</h3>
              <p>Rephrase, simplify, and refine responses</p>
            </div>
          </div>

          <p className="hint">👈 Start a new conversation from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-title">
          <h2>{currentConversation.title}</h2>
          <span className="message-count">{messages.length} messages</span>
        </div>
        <button
          className="reset-btn"
          onClick={resetConversation}
          title="Start fresh conversation"
        >
          <FiRefreshCw /> Reset
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <p>Start a conversation below 👇</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        {isLoading && (
          <div className="loading-indicator">
            <div className="thinking-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Thinking...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          ref={inputRef}
          type="text"
          className="message-input"
          placeholder="Type your message... (Shift+Enter for newline)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSendMessage(e);
            }
          }}
          disabled={isLoading || !currentConversation}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={isLoading || !inputValue.trim() || !currentConversation}
          title="Send message (Ctrl+Enter)"
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
