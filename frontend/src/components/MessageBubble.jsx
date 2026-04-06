import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FiCopy, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import '../styles/messagebubble.css';

function MessageBubble({ message }) {
  const [showExpanded, setShowExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const truncatedContent =
    message.content.length > 500
      ? message.content.substring(0, 500) + '...'
      : message.content;

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-header">
        <span className="message-role">{isUser ? 'You' : 'Assistant'}</span>
        <span className="message-time">
          {formatDistanceToNow(new Date(message.timestamp), {
            addSuffix: true,
          })}
        </span>
      </div>

      <div className="message-content">
        <p>
          {showExpanded ? message.content : truncatedContent}
        </p>
      </div>

      <div className="message-actions">
        {message.content.length > 500 && (
          <button
            className="action-btn expand-btn"
            onClick={() => setShowExpanded(!showExpanded)}
            title={showExpanded ? 'Collapse' : 'Expand'}
          >
            {showExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        )}

        <button
          className="action-btn copy-btn"
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          <FiCopy /> {copied ? 'Copied!' : 'Copy'}
        </button>

        {!isUser && (
          <>
            <button className="action-btn style-btn" title="Shorter version">
              Shorter
            </button>
            <button className="action-btn style-btn" title="More formal">
              Formal
            </button>
            <button className="action-btn style-btn" title="Simplify">
              Simplify
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
