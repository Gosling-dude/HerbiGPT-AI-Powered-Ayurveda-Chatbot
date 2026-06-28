import { Link } from 'react-router-dom';
import { GITHUB_URL } from '../../data/content';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">🌿 HerbiGPT</div>
          <p className="footer-tagline">
            A calm place to learn the everyday wisdom of Ayurveda — herbs, routine,
            and balance, explained plainly.
          </p>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/chat">Chat</Link>
          <Link to="/library">Library</Link>
          <Link to="/about">About</Link>
        </div>

        <div className="footer-col">
          <h4>Project</h4>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
          <a href={`${GITHUB_URL}/blob/main/README.md`} target="_blank" rel="noreferrer">Documentation</a>
          <a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer">License (MIT)</a>
          <Link to="/about#research">Research</Link>
        </div>

        <div className="footer-col">
          <h4>More</h4>
          <Link to="/about#faq">FAQ</Link>
          <Link to="/about#acknowledgements">Acknowledgements</Link>
          <a href="mailto:hello@herbigpt.app">Contact</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {year} HerbiGPT · MIT License</span>
        <span className="footer-note">
          For learning and general wellness only — not medical advice.
        </span>
      </div>
    </footer>
  );
}
