import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../../theme';
import { GITHUB_URL } from '../../data/content';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/chat', label: 'Chat' },
  { to: '/library', label: 'Library' },
  { to: '/about', label: 'About' },
];

function LeafMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path
          d="M12 21c-5 0-9-3.5-9-9 0-.4 0-.8.1-1.2 4.9.3 8.9 4.3 9.2 9.2.4.1.8 0 1.2 0 4 0 6.5-3 6.5-7C20 8 17 4 11 3 7.5 7 6 10 6 13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function NavBar() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <LeafMark />
          <span className="brand-name">HerbiGPT</span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
            >
              {l.label}
              {location.pathname === l.to && (
                <motion.span layoutId="nav-underline" className="nav-underline" />
              )}
            </NavLink>
          ))}
          <a className="nav-link nav-link-ext" href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </nav>

        <div className="nav-actions">
          <button
            className="icon-button"
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <Link to="/chat" className="btn btn-primary nav-cta">
            Open chat
          </Link>
          <button
            className="icon-button nav-burger"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="nav-mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            aria-label="Mobile"
          >
            {LINKS.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => `nav-mobile-link${isActive ? ' is-active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
            <a className="nav-mobile-link" href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
