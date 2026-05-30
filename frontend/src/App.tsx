import React, { useState, useRef, useCallback } from 'react';
import './App.css';
import api from './services/api';
import type { AskResponse } from './types';

const SUGGESTIONS = [
  'How can Ayurveda help with managing chronic pain?',
  'What are effective Ayurvedic remedies for boosting energy?',
  'How can I determine my dosha type?',
  'What herbs help with stress and anxiety?',
];

const FEATURES = [
  {
    icon: '🌿',
    title: 'Herbal Guidance',
    desc: 'Personalized herb suggestions with safety info and interaction warnings.',
  },
  {
    icon: '🧭',
    title: 'Dosha Insights',
    desc: 'Understand Vata, Pitta, Kapha — and get lifestyle tips for your type.',
  },
  {
    icon: '✨',
    title: 'Daily Wellness',
    desc: 'Practical routines for sleep, digestion, stress relief, and energy.',
  },
];

interface AnswerState {
  text: string;
  model?: string;
  mode?: string;
  sources?: string[];
  durationMs?: number;
  error?: boolean;
}

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<AnswerState | null>(null);
  const [loading, setLoading] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const focusInput = useCallback((text = '') => {
    setQuestion(text);
    requestAnimationFrame(() => textAreaRef.current?.focus());
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setAnswer(null);

    try {
      const data: AskResponse = await api.askQuestion(question);
      setAnswer({
        text: data.answer || data.result || 'No answer returned.',
        model: data.model,
        mode: data.mode,
        sources: data.sources,
        durationMs: data.durationMs,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not reach backend.';
      setAnswer({ text: `Error: ${msg}`, error: true });
    } finally {
      setLoading(false);
    }
  }, [question, loading]);

  const handleClear = useCallback(() => {
    setQuestion('');
    setAnswer(null);
    textAreaRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className="app">
      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      <main className="app-main">
        {/* Hero */}
        <section className="hero">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI-Powered Ayurveda Assistant
          </div>
          <h1>HerbiGPT</h1>
          <p className="hero-sub">
            Ask about herbs, dosha balancing, diet, and lifestyle.
            Get fast, evidence-based Ayurvedic guidance.
          </p>
          <div className="hero-actions">
            <button
              id="hero-ask-btn"
              className="btn-primary"
              onClick={() => focusInput('')}
            >
              ✨ Ask HerbiGPT
            </button>
            <a
              id="hero-github-btn"
              className="btn-secondary"
              href="https://github.com/Gosling-dude/HerbiGPT-AI-Powered-Ayurveda-Chatbot"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </section>

        {/* Chat Section */}
        <section className="chat-section">
          <div className="chat-card">
            {/* Answer Area */}
            <div className={`answer-box${answer && !answer.error ? ' has-answer' : ''}`}>
              {loading && (
                <div className="loading-container">
                  <div className="loading-dots">
                    <div className="loading-dot" />
                    <div className="loading-dot" />
                    <div className="loading-dot" />
                  </div>
                  <span className="loading-text">Consulting ancient wisdom...</span>
                </div>
              )}

              {!loading && answer && answer.error && (
                <div className="error-banner">
                  ⚠️ {answer.text}
                </div>
              )}

              {!loading && answer && !answer.error && (
                <>
                  <div className="answer-text">{answer.text}</div>
                  {(answer.model || answer.mode || answer.durationMs) && (
                    <div className="answer-meta">
                      {answer.mode && (
                        <span className="answer-meta-tag">
                          {answer.mode === 'rag' ? '📚 RAG' : '🤖 LLM'}
                        </span>
                      )}
                      {answer.model && (
                        <span className="answer-meta-tag">
                          {answer.model}
                        </span>
                      )}
                      {answer.durationMs && (
                        <span>{answer.durationMs}ms</span>
                      )}
                      {answer.sources && answer.sources.length > 0 && (
                        <span>Sources: {answer.sources.join(', ')}</span>
                      )}
                    </div>
                  )}
                </>
              )}

              {!loading && !answer && (
                <div className="answer-placeholder">
                  🌿 Your answer will appear here
                </div>
              )}
            </div>

            {/* Input */}
            <form className="chat-form" onSubmit={handleSubmit}>
              <textarea
                id="chat-input"
                ref={textAreaRef}
                className="chat-input"
                placeholder="Ask about herbs, doshas, remedies, or wellness routines..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <div className="chat-controls">
                <button
                  id="send-btn"
                  type="submit"
                  className="btn-send"
                  disabled={loading || !question.trim()}
                >
                  {loading ? 'Thinking...' : '↑ Send'}
                </button>
                <button
                  id="clear-btn"
                  type="button"
                  className="btn-clear"
                  onClick={handleClear}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* Suggestions */}
          <div className="suggestions">
            <div className="suggestions-label">Try asking</div>
            <div className="chips">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="chip"
                  onClick={() => focusInput(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="features">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          🌱 HerbiGPT — Powered by AI & Ancient Wellness Wisdom ·{' '}
          <a
            href="https://github.com/Gosling-dude/HerbiGPT-AI-Powered-Ayurveda-Chatbot"
            target="_blank"
            rel="noreferrer"
          >
            Open Source
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
