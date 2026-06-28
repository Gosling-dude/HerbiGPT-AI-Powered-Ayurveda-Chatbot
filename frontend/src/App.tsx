import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
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

type Role = 'user' | 'assistant';

interface Message {
  id: string;
  role: Role;
  text: string;
  model?: string;
  mode?: string;
  sources?: string[];
  durationMs?: number;
  error?: boolean;
}

type Theme = 'dark' | 'light';

const newId = () => Math.random().toString(36).slice(2);

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('herbigpt-theme');
    return stored === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('herbigpt-theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return [theme, toggle];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }, [text]);

  return (
    <button className="copy-btn" onClick={handleCopy} title="Copy answer" aria-label="Copy answer">
      {copied ? '✓ Copied' : '⧉ Copy'}
    </button>
  );
}

function App() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [theme, toggleTheme] = useTheme();

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const hasConversation = messages.length > 0;

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-grow the composer textarea
  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [question]);

  const ask = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed || loading) return;

    setMessages(prev => [...prev, { id: newId(), role: 'user', text: trimmed }]);
    setQuestion('');
    setLoading(true);

    try {
      const data: AskResponse = await api.askQuestion(trimmed);
      setMessages(prev => [
        ...prev,
        {
          id: newId(),
          role: 'assistant',
          text: data.answer || data.result || 'No answer returned.',
          model: data.model,
          mode: data.mode,
          sources: data.sources,
          durationMs: data.durationMs,
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not reach the backend.';
      setMessages(prev => [
        ...prev,
        { id: newId(), role: 'assistant', text: msg, error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    ask(question);
  }, [ask, question]);

  const handleRetry = useCallback(() => {
    // Re-ask the most recent user question
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser) ask(lastUser.text);
  }, [ask, messages]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setQuestion('');
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

      {/* Top Bar */}
      <header className="topbar">
        <button className="brand" onClick={handleNewChat} title="New chat">
          <span className="brand-leaf">🌿</span> HerbiGPT
        </button>
        <div className="topbar-actions">
          {hasConversation && (
            <button className="topbar-btn" onClick={handleNewChat}>
              + New chat
            </button>
          )}
          <button
            className="topbar-btn icon-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* Hero + suggestions only on a fresh screen */}
        {!hasConversation && (
          <>
            <section className="hero">
              <div className="hero-emblem">
                <div className="hero-emblem-ring" />
                <span className="hero-emblem-leaf">🌿</span>
              </div>
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                AI-Powered Ayurveda Assistant
              </div>
              <h1>
                Your Holistic
                <br />
                Wellness Guide
              </h1>
              <p className="hero-sub">
                Ask about herbs, dosha balancing, diet, and lifestyle.
                Get fast, evidence-based Ayurvedic guidance — grounded in
                classical texts and powered by modern AI.
              </p>
              <div className="hero-trust">
                <span className="hero-trust-item">⚡ Llama&nbsp;3.1 Fast</span>
                <span className="hero-trust-dot" />
                <span className="hero-trust-item">📚 RAG over Charaka Samhita</span>
                <span className="hero-trust-dot" />
                <span className="hero-trust-item">🔒 No data stored</span>
              </div>
            </section>

            <div className="suggestions">
              <div className="suggestions-label">Try asking</div>
              <div className="chips">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="chip" onClick={() => ask(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <section className="features">
              {FEATURES.map((f, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-title">{f.title}</div>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              ))}
            </section>
          </>
        )}

        {/* Conversation */}
        {hasConversation && (
          <section className="conversation">
            {messages.map(m => (
              <div key={m.id} className={`msg msg-${m.role}${m.error ? ' msg-error' : ''}`}>
                <div className="msg-avatar">{m.role === 'user' ? '🧑' : '🌿'}</div>
                <div className="msg-body">
                  {m.error ? (
                    <div className="error-banner">
                      <span>⚠️ {m.text}</span>
                      <button className="retry-btn" onClick={handleRetry} disabled={loading}>
                        ↻ Retry
                      </button>
                    </div>
                  ) : m.role === 'assistant' ? (
                    <>
                      <div className="markdown">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                      </div>
                      <div className="msg-footer">
                        <div className="answer-meta">
                          {m.mode && (
                            <span className="answer-meta-tag">
                              {m.mode === 'rag' ? '📚 RAG' : '🤖 LLM'}
                            </span>
                          )}
                          {m.model && <span className="answer-meta-tag">{m.model}</span>}
                          {typeof m.durationMs === 'number' && <span>{m.durationMs}ms</span>}
                          {m.sources && m.sources.length > 0 && (
                            <span>Sources: {m.sources.join(', ')}</span>
                          )}
                        </div>
                        <CopyButton text={m.text} />
                      </div>
                    </>
                  ) : (
                    <div className="msg-text">{m.text}</div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="msg msg-assistant">
                <div className="msg-avatar">🌿</div>
                <div className="msg-body">
                  <div className="loading-container loading-inline">
                    <div className="loading-dots">
                      <div className="loading-dot" />
                      <div className="loading-dot" />
                      <div className="loading-dot" />
                    </div>
                    <span className="loading-text">Consulting ancient wisdom...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </section>
        )}
      </main>

      {/* Floating Input */}
      <div className="composer-wrap">
        <form className="composer" onSubmit={handleSubmit}>
          <textarea
            id="chat-input"
            ref={textAreaRef}
            className="chat-input"
            placeholder="Ask about herbs, doshas, remedies, or wellness routines..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            id="send-btn"
            type="submit"
            className="btn-send"
            disabled={loading || !question.trim()}
            aria-label="Send"
          >
            {loading ? '…' : '↑'}
          </button>
        </form>
        <p className="composer-hint">
          HerbiGPT can make mistakes. For medical concerns, consult a qualified practitioner.
        </p>
      </div>
    </div>
  );
}

export default App;
