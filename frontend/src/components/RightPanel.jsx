import React, { useState } from 'react';
import { useConversation } from '../contexts/ConversationContext';
import { FiChevronDown } from 'react-icons/fi';
import '../styles/rightpanel.css';

function RightPanel() {
  const { controls, updateControls, analysisResult, currentConversation } =
    useConversation();
  const [expandedSection, setExpandedSection] = useState('intent');

  if (!currentConversation) {
    return (
      <aside className="right-panel empty">
        <p>Select a conversation to configure</p>
      </aside>
    );
  }

  const handleControlChange = async (key, value) => {
    await updateControls({ [key]: value });
  };

  return (
    <aside className="right-panel">
      {/* Intent & Tone Controls */}
      <section className="control-section">
        <button
          className="section-header"
          onClick={() =>
            setExpandedSection(expandedSection === 'intent' ? null : 'intent')
          }
        >
          <h3>🎯 Intent & Tone</h3>
          <FiChevronDown
            className={`${expandedSection === 'intent' ? 'expanded' : ''}`}
          />
        </button>

        {expandedSection === 'intent' && (
          <div className="section-content">
            <div className="control-group">
              <label>Role</label>
              <select
                value={controls.role}
                onChange={(e) => handleControlChange('role', e.target.value)}
              >
                <option value="unbiased-assistant">Unbiased Assistant</option>
                <option value="legal-advisor">Legal Tone</option>
                <option value="therapist">Empathetic</option>
                <option value="technical">Technical</option>
                <option value="casual">Casual</option>
              </select>
            </div>

            <div className="control-group">
              <label>Tone</label>
              <select
                value={controls.tone}
                onChange={(e) => handleControlChange('tone', e.target.value)}
              >
                <option value="neutral">Neutral</option>
                <option value="assertive">Assertive</option>
                <option value="empathetic">Empathetic</option>
                <option value="authoritative">Authoritative</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>

            <div className="control-group">
              <label>Audience</label>
              <select
                value={controls.audience}
                onChange={(e) => handleControlChange('audience', e.target.value)}
              >
                <option value="general">General Public</option>
                <option value="expert">Expert/Technical</option>
                <option value="layperson">Layperson</option>
                <option value="academic">Academic</option>
                <option value="professional">Professional</option>
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Model Configuration */}
      <section className="control-section">
        <button
          className="section-header"
          onClick={() =>
            setExpandedSection(
              expandedSection === 'model' ? null : 'model'
            )
          }
        >
          <h3>⚙️ Model Config</h3>
          <FiChevronDown
            className={`${expandedSection === 'model' ? 'expanded' : ''}`}
          />
        </button>

        {expandedSection === 'model' && (
          <div className="section-content">
            <div className="control-group">
              <label>Model</label>
              <select
                value={controls.model}
                onChange={(e) => handleControlChange('model', e.target.value)}
              >
                <option value="llama2">llama2</option>
                <option value="llama3">llama3</option>
                <option value="phi3">phi3</option>
                <option value="gemma2">gemma2</option>
                <option value="mistral">mistral</option>
              </select>
              <p className="help-text">Installed models available via Ollama</p>
            </div>

            <div className="control-group">
              <label>
                Temperature: <span className="value">{controls.temperature.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={controls.temperature}
                onChange={(e) =>
                  handleControlChange('temperature', parseFloat(e.target.value))
                }
              />
              <p className="help-text">Lower = more focused, Higher = more creative</p>
            </div>

            <div className="control-group">
              <label>
                Top P: <span className="value">{controls.top_p.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={controls.top_p}
                onChange={(e) =>
                  handleControlChange('top_p', parseFloat(e.target.value))
                }
              />
              <p className="help-text">Nucleus sampling diversity</p>
            </div>
          </div>
        )}
      </section>

      {/* Analysis Results */}
      {analysisResult && (
        <section className="control-section analysis-section">
          <button
            className="section-header"
            onClick={() =>
              setExpandedSection(
                expandedSection === 'analysis' ? null : 'analysis'
              )
            }
          >
            <h3>
              ⚠️ Analysis {analysisResult.analysis.score > 0 && (
                <span className="risk-badge" title={`Risk score: ${analysisResult.analysis.score}/10`}>
                  {analysisResult.analysis.score > 6 ? '🔴' : analysisResult.analysis.score > 3 ? '🟡' : '🟢'}
                </span>
              )}
            </h3>
            <FiChevronDown
              className={`${expandedSection === 'analysis' ? 'expanded' : ''}`}
            />
          </button>

          {expandedSection === 'analysis' && (
            <div className="section-content analysis-content">
              <p className="analysis-summary">{analysisResult.analysis.summary}</p>

              {analysisResult.analysis.issues.length > 0 && (
                <div className="issues-list">
                  <h4>Issues Found:</h4>
                  {analysisResult.analysis.issues.map((issue, idx) => (
                    <div key={idx} className={`issue ${issue.risk}`}>
                      <span className="issue-type">{issue.type}</span>
                      <span className="issue-risk">({issue.risk})</span>
                      <p className="issue-explanation">{issue.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              {analysisResult.suggestions.length > 0 && (
                <div className="suggestions-list">
                  <h4>Suggestions:</h4>
                  {analysisResult.suggestions.map((sugg, idx) => (
                    <div key={idx} className="suggestion">
                      <p className="sugg-issue">
                        <strong>Issue:</strong> {sugg.problematic}
                      </p>
                      <p className="sugg-alt">
                        <strong>Alternative:</strong> {sugg.alternative}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </aside>
  );
}

export default RightPanel;
