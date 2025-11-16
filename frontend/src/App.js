import React, { useState, useRef } from 'react';
import './App.css';

const defaultSuggestions = [
  'How can Ayurveda help with managing chronic pain?',
  'What are some effective Ayurvedic remedies for boosting energy levels?',
  'How can I determine my dosha type?',
];

const defaultFeatures = [
  { title: ' Herbal guidance', desc: 'Personalized herb suggestions, safe usage, and interactions.' },
  { title: ' Dosha insights', desc: 'Learn about Vata, Pitta, Kapha and lifestyle tips for each.' },
  { title: ' Daily wellness', desc: 'Simple practices for sleep, digestion, stress and energy.' },
];

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const textAreaRef = useRef(null);

  const focusInput = (q = '') => {
    setQuestion(q);
    requestAnimationFrame(() => textAreaRef.current && textAreaRef.current.focus());
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    try {
      const API_BASE = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setAnswer(data.answer || (data.result || 'No answer returned'));
    } catch (err) {
      setAnswer('Error: could not reach backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => { setQuestion(''); setAnswer(''); };

  return (
    <div className="App">
      <main className="App-main">
        <div className="big-chat-bar">
          <form className="ask-form big" onSubmit={handleSubmit}>
            <textarea
              ref={textAreaRef}
              className="question-input big-input"
              placeholder="Type your wellness question here — herbs, dosha tips, diet, or routines..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="chat-controls">
              <button type="submit" className="hero-ask big-send">Send</button>
              <button type="button" className="cta-gh" onClick={() => { setQuestion(''); setAnswer(''); }}>Clear</button>
            </div>
          </form>

          <div className="answer-box big-answer">
            {loading && <div className="loader">Thinking...</div>}
            {!loading && answer && <div className="answer-text">{answer}</div>}
            {!loading && !answer && <div className="placeholder">Your answer will appear here. Try: "Best morning herbs for Vata"</div>}
          </div>
        </div>

        <div className="content-grid">
          <div className="left-panel">
            <div className="hero-inner">
              <div className="hero-content">
                <h1>HerbiGPT — Your Holistic Wellness Guide</h1>
                <p className="hero-sub">Ask about herbs, dosha balancing, diet, and lifestyle. Fast, concise Ayurvedic guidance.</p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button className="hero-ask" onClick={() => focusInput('')}>Ask HerbiGPT</button>
                  <a className="cta-gh" href="https://github.com/Gosling-dude/HerbiGPT-AI-Powered-Ayurveda-Chatbot" target="_blank" rel="noreferrer">View on GitHub</a>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  {defaultSuggestions.map((s, i) => (
                    <button key={i} className="chip" onClick={() => focusInput(s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="mascot-wrap">
                <img src="/mascot.svg" alt="mascot" className="mascot-img" />
              </div>
            </div>

            <div className="features">
              {defaultFeatures.map((f, i) => (
                <div key={i} className="feature-card">
                  <h4>{f.title}</h4>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="right-panel">
            {/* Intentionally left for secondary content or suggestions */}
            <div style={{ opacity: 0.9, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              Quick tips and context appear here.
            </div>
          </div>
        </div>
      </main>

      <footer className="App-footer">
        <p> HerbiGPT - Powered by AI & Ancient Wellness Wisdom</p>
      </footer>
    </div>
  );
}

export default App;
