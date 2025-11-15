import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      setAnswer(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setQuestion('');
    setAnswer('');
    setShowResources(false);
    setShowContact(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <nav className="navbar">
          <div className="brand">
            <h1 className="brand-title">🌿 HerbiGPT</h1>
            <p className="brand-subtitle">Your Holistic Wellness Guide</p>
          </div>
          <div className="nav-buttons">
            <a href="https://github.com/Gosling-dude/HerbiGPT-AI-Powered-Ayurveda-Chatbot" target="_blank" rel="noopener noreferrer" className="nav-btn github-btn">
              <span>GitHub</span>
            </a>
            <button className="nav-btn contact-btn" onClick={() => {
              setShowContact(!showContact);
              setShowResources(false);
            }}>
              <span>Contact</span>
            </button>
            <button className="nav-btn resources-btn" onClick={() => {
              setShowResources(!showResources);
              setShowContact(false);
            }}>
              <span>Resources</span>
            </button>
          </div>
        </nav>
      </header>
      
      <main className="App-main">
        <section className="hero">
          <div className="hero-inner">
            <img className="cloud-img" src="/Cloud.svg" alt="cloud" />
            <img className="mascot-img" src="/mascot.svg" alt="Herbi mascot" />
            <img className="moon-img" src="/Moon.svg" alt="moon" />
            <div className="hero-content">
              <h1>HerbiGPT — Your Holistic Wellness Guide</h1>
              <p className="hero-sub">Ask about Ayurveda, herbs, natural remedies, and healthy living. Quick, friendly, and evidence-oriented answers.</p>
              <div className="hero-ctas">
                <button className="submit-btn hero-ask" onClick={() => textareaRef.current && textareaRef.current.focus()}>✨ Ask HerbiGPT</button>
                <a className="nav-btn hero-github" href="https://github.com/Gosling-dude/HerbiGPT-AI-Powered-Ayurveda-Chatbot" target="_blank" rel="noreferrer">GitHub</a>
              </div>
            </div>
          </div>
        </section>
        {!showResources && !showContact && (
          <>
            <div className="input-section">
              <form onSubmit={handleSubmit} className="question-form">
                <div className="input-wrapper">
                  <textarea
                    ref={textareaRef}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask me about Ayurveda, wellness, herbs, diets, remedies..."
                    disabled={loading}
                    rows="4"
                    className="question-input"
                  />
                  <button type="submit" disabled={loading || !question.trim()} className="submit-btn">
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span>
                        Thinking...
                      </>
                    ) : (
                      <>
                        ✨ Ask HerbiGPT
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="suggestions">
              <strong>Popular prompts:</strong>
              <div className="chips">
                <button className="chip" onClick={() => { setQuestion('How can Ayurveda help with managing chronic pain?'); textareaRef.current && textareaRef.current.focus(); }}>Ayurveda & chronic pain</button>
                <button className="chip" onClick={() => { setQuestion('What are some effective Ayurvedic remedies for boosting energy levels?'); textareaRef.current && textareaRef.current.focus(); }}>Boost energy</button>
                <button className="chip" onClick={() => { setQuestion('How can I determine my dosha type?'); textareaRef.current && textareaRef.current.focus(); }}>Find my dosha</button>
              </div>
            </div>

            <div className="features" aria-hidden>
              <div className="feature-card">
                <h4>🌿 Herbal guidance</h4>
                <p>Personalized herb suggestions, safe usage, and interactions.</p>
              </div>
              <div className="feature-card">
                <h4>🧭 Dosha insights</h4>
                <p>Learn about Vata, Pitta, Kapha and lifestyle tips for each.</p>
              </div>
              <div className="feature-card">
                <h4>✨ Daily wellness</h4>
                <p>Simple practices for sleep, digestion, stress and energy.</p>
              </div>
            </div>

            {answer && (
              <div className="answer-container">
                <div className="answer-box">
                  <div className="answer-header">
                    <h2>💡 Wellness Insight</h2>
                    <button className="clear-btn" onClick={handleClearAll}>×</button>
                  </div>
                  <div className="answer-content">
                    <p>{answer}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {showResources && (
          <div className="modal-content resources-modal">
            <button className="close-modal" onClick={() => setShowResources(false)}>×</button>
            <h2>📚 Resources & Sources</h2>
            <div className="resources-grid">
              <div className="resource-card">
                <h3>📖 Books</h3>
                <ul>
                  <li>The Complete Ayurveda Handbook</li>
                  <li>Ayurveda: The Science of Self-Healing</li>
                  <li>The Art of Ayurvedic Nutrition</li>
                  <li>Yoga and Ayurveda: Self-Healing and Self-Realization</li>
                </ul>
              </div>
              <div className="resource-card">
                <h3>🌐 Websites</h3>
                <ul>
                  <li><a href="https://www.ayurveda.com" target="_blank" rel="noopener noreferrer">Ayurveda.com</a></li>
                  <li><a href="https://www.banyanbotanicals.com" target="_blank" rel="noopener noreferrer">Banyan Botanicals</a></li>
                  <li><a href="https://www.chopra.com" target="_blank" rel="noopener noreferrer">Chopra Center</a></li>
                  <li><a href="https://www.nccih.nih.gov" target="_blank" rel="noopener noreferrer">NIH - Complementary Health</a></li>
                </ul>
              </div>
              <div className="resource-card">
                <h3>🎓 Courses</h3>
                <ul>
                  <li>Ayurveda Fundamentals (Online)</li>
                  <li>Herbal Medicine Certification</li>
                  <li>Nutrition & Wellness Coaching</li>
                  <li>Traditional Healing Practices</li>
                </ul>
              </div>
            </div>
            <button className="back-btn" onClick={() => setShowResources(false)}>← Back to Chat</button>
          </div>
        )}

        {showContact && (
          <div className="modal-content contact-modal">
            <button className="close-modal" onClick={() => setShowContact(false)}>×</button>
            <h2>📬 Contact Information</h2>
            <div className="contact-card">
              <div className="contact-item">
                <h3>📧 Email</h3>
                <p>herbiGPT@example.com</p>
              </div>
              <div className="contact-item">
                <h3>💬 Social Media</h3>
                <p>
                  <a href="https://github.com/Gosling-dude" target="_blank" rel="noopener noreferrer">GitHub: @Gosling-dude</a>
                </p>
              </div>
              <div className="contact-item">
                <h3>🔗 Project</h3>
                <p>
                  <a href="https://github.com/Gosling-dude/HerbiGPT-AI-Powered-Ayurveda-Chatbot" target="_blank" rel="noopener noreferrer">HerbiGPT Repository</a>
                </p>
              </div>
              <div className="contact-item">
                <h3>📍 Location</h3>
                <p>Open Source Community</p>
              </div>
            </div>
            <button className="back-btn" onClick={() => setShowContact(false)}>← Back to Chat</button>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>🌱 HerbiGPT - Powered by AI & Ancient Wellness Wisdom</p>
      </footer>
    </div>
  );
}

export default App;