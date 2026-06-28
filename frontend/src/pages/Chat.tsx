import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import type { AskResponse } from '../types';
import Typewriter from '../components/chat/Typewriter';
import { STARTER_PROMPTS, FOLLOW_UPS } from '../data/content';

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
  animate?: boolean;
}

const newId = () => Math.random().toString(36).slice(2);

function ActionButton({
  onClick,
  label,
  done,
  doneLabel,
  icon,
}: {
  onClick: () => void;
  label: string;
  done?: boolean;
  doneLabel?: string;
  icon: string;
}) {
  return (
    <button className="msg-action" onClick={onClick} title={label} aria-label={label}>
      <span aria-hidden="true">{done ? '✓' : icon}</span>
      {done ? doneLabel ?? 'Done' : label}
    </button>
  );
}

function AssistantMessage({
  m,
  onFollowUp,
  isLast,
}: {
  m: Message;
  onFollowUp: (q: string) => void;
  isLast: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(m.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  }, [m.text]);

  const share = useCallback(async () => {
    const data = { title: 'HerbiGPT', text: m.text };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(m.text);
      }
      setShared(true);
      setTimeout(() => setShared(false), 1400);
    } catch {
      /* dismissed */
    }
  }, [m.text]);

  return (
    <div className="bubble bubble-assistant">
      <Typewriter text={m.text} animate={!!m.animate} />

      {m.sources && m.sources.length > 0 && (
        <div className="source-cards">
          <div className="source-cards-label">Grounded in</div>
          <div className="source-cards-row">
            {m.sources.map((s, i) => (
              <span className="source-card" key={i}>
                <span className="source-card-dot" />
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bubble-foot">
        <div className="bubble-meta">
          {m.mode && (
            <span className="meta-tag">{m.mode === 'rag' ? 'Reference-grounded' : 'General'}</span>
          )}
          {typeof m.durationMs === 'number' && <span className="meta-dim">{m.durationMs} ms</span>}
        </div>
        <div className="bubble-actions">
          <ActionButton onClick={copy} label="Copy" done={copied} doneLabel="Copied" icon="⧉" />
          <ActionButton onClick={share} label="Share" done={shared} doneLabel="Shared" icon="↗" />
        </div>
      </div>

      {isLast && (
        <div className="followups">
          {FOLLOW_UPS.map((f, i) => (
            <button key={i} className="followup" onClick={() => onFollowUp(f)}>
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Chat() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const hasConversation = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [question]);

  const ask = useCallback(
    async (raw: string) => {
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
            text: data.answer || data.result || 'No answer was returned.',
            model: data.model,
            mode: data.mode,
            sources: data.sources,
            durationMs: data.durationMs,
            animate: true,
          },
        ]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong reaching the service.';
        setMessages(prev => [...prev, { id: newId(), role: 'assistant', text: msg, error: true }]);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  // Allow other pages to deep-link a question via ?q=
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q');
    if (q) ask(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      ask(question);
    },
    [ask, question]
  );

  const retry = useCallback(() => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser) ask(lastUser.text);
  }, [ask, messages]);

  const newChat = useCallback(() => {
    setMessages([]);
    setQuestion('');
    taRef.current?.focus();
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit]
  );

  const lastAssistantId = [...messages].reverse().find(m => m.role === 'assistant' && !m.error)?.id;

  return (
    <div className="chat">
      <div className="chat-scroll">
        <div className="chat-width">
          {!hasConversation && (
            <div className="chat-empty">
              <div className="chat-empty-mark">🌿</div>
              <h1>What would you like to understand?</h1>
              <p>
                Ask about a herb, your constitution, daily routine, or what the tradition
                suggests for everyday balance.
              </p>
              <div className="chat-starters">
                {STARTER_PROMPTS.map((s, i) => (
                  <button key={i} className="starter" onClick={() => ask(s.prompt)}>
                    <span className="starter-label">{s.label}</span>
                    <span className="starter-text">{s.prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasConversation && (
            <div className="conversation">
              {messages.map(m => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`row row-${m.role}`}
                >
                  <div className="avatar">{m.role === 'user' ? '🧑' : '🌿'}</div>
                  <div className="row-body">
                    {m.error ? (
                      <div className="bubble bubble-error">
                        <span>⚠ {m.text}</span>
                        <button className="retry" onClick={retry} disabled={loading}>
                          ↻ Retry
                        </button>
                      </div>
                    ) : m.role === 'assistant' ? (
                      <AssistantMessage m={m} onFollowUp={ask} isLast={m.id === lastAssistantId} />
                    ) : (
                      <div className="bubble bubble-user">{m.text}</div>
                    )}
                  </div>
                </motion.div>
              ))}

              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="row row-assistant"
                  >
                    <div className="avatar">🌿</div>
                    <div className="row-body">
                      <div className="bubble bubble-assistant thinking">
                        <span className="dots"><i /><i /><i /></span>
                        <span className="thinking-text">Consulting the references…</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      <div className="composer-dock">
        <div className="chat-width">
          {hasConversation && (
            <div className="composer-bar">
              <button className="ghost-btn" onClick={newChat}>+ New conversation</button>
            </div>
          )}
          <form className="composer" onSubmit={submit}>
            <textarea
              ref={taRef}
              className="composer-input"
              placeholder="Ask about herbs, doshas, routine, or balance…"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              type="submit"
              className="composer-send"
              disabled={loading || !question.trim()}
              aria-label="Send"
            >
              {loading ? '…' : '↑'}
            </button>
          </form>
          <p className="composer-hint">
            A learning companion, not medical advice. For symptoms, see a qualified practitioner.
          </p>
        </div>
      </div>
    </div>
  );
}
