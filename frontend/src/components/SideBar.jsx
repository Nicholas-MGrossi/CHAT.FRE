import React, { useState } from 'react';
import { useConversation } from '../contexts/ConversationContext';
import { formatDistanceToNow } from 'date-fns';
import { FiPlus, FiTrash2, FiMenu, FiX } from 'react-icons/fi';
import '../styles/sidebar.css';

function SideBar() {
  const {
    conversations,
    currentConversation,
    createNewConversation,
    switchConversation,
    deleteConversation,
  } = useConversation();

  const [showMenu, setShowMenu] = useState(false);

  const handleNewConversation = async () => {
    try {
      await createNewConversation();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      await deleteConversation(id);
    }
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setShowMenu(!showMenu)}>
        {showMenu ? <FiX /> : <FiMenu />}
      </button>
      
      <aside className={`sidebar ${showMenu ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">ChatFree</h1>
          <p className="sidebar-subtitle">Local LLM, Unbiased</p>
        </div>

        <button className="new-conversation-btn" onClick={handleNewConversation}>
          <FiPlus /> New Conversation
        </button>

        <div className="conversations-list">
          {conversations.length === 0 ? (
            <div className="empty-state">
              <p>No conversations yet</p>
              <p className="hint">Start one above 👆</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                className={`conversation-item ${
                  currentConversation?.id === conv.id ? 'active' : ''
                }`}
                onClick={() => {
                  switchConversation(conv);
                  setShowMenu(false);
                }}
              >
                <div className="conversation-info">
                  <h3 className="conversation-title">{conv.title}</h3>
                  <p className="conversation-time">
                    {formatDistanceToNow(new Date(conv.updatedAt), {
                      addSuffix: true,
                    })}
                  </p>
                  {conv.persona && conv.persona !== 'default' && (
                    <span className="persona-tag">{conv.persona}</span>
                  )}
                </div>
                <button
                  className="delete-btn"
                  onClick={(e) => handleDeleteConversation(e, conv.id)}
                  title="Delete conversation"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <div className="footer-info">
            <p className="server-status">
              <span className="status-dot">●</span> Backend: Running
            </p>
            <p className="version">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default SideBar;
