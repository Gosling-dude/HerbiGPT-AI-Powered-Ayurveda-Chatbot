import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Reveal from '../components/ui/Reveal';
import TiltCard from '../components/ui/TiltCard';
import { useMouseParallax } from '../hooks/useMouseParallax';
import { PILLARS, SOURCE_TEXTS, CONTRIBUTORS } from '../data/content';

function HeroEmblem() {
  const { x, y } = useMouseParallax();
  return (
    <motion.div
      className="hero-emblem"
      animate={{ x: x * 14, y: y * 14 }}
      transition={{ type: 'spring', stiffness: 50, damping: 18 }}
    >
      <div className="hero-emblem-glow" />
      <motion.div
        className="hero-emblem-disc"
        animate={{ rotate: 360 }}
        transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
      />
      <motion.span
        className="hero-emblem-leaf"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        🌿
      </motion.span>
      <span className="hero-orbit hero-orbit-a">🪷</span>
      <span className="hero-orbit hero-orbit-b">🍵</span>
      <span className="hero-orbit hero-orbit-c">🌱</span>
    </motion.div>
  );
}

const STEPS = [
  {
    n: '01',
    title: 'You ask in plain language',
    body: 'No jargon required. Ask about a herb, a habit, or how you’re feeling day to day.',
  },
  {
    n: '02',
    title: 'We find the relevant notes',
    body: 'Your question is matched against a curated knowledge base of summarized principles and the tradition behind them.',
  },
  {
    n: '03',
    title: 'A grounded answer, with its sources',
    body: 'The answer is written for clarity and shows which references informed it — so you can read further.',
  },
];

export default function Home() {
  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-grid">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Ayurveda, explained plainly
            </span>
            <h1 className="hero-title">
              The everyday wisdom of Ayurveda,
              <span className="hero-title-accent"> made clear.</span>
            </h1>
            <p className="hero-sub">
              HerbiGPT is a calm companion for learning about herbs, constitution,
              and daily balance — grounded in classical references and written for
              real life, not a textbook.
            </p>
            <div className="hero-cta">
              <Link to="/chat" className="btn btn-primary btn-lg">Start a conversation</Link>
              <Link to="/library" className="btn btn-ghost btn-lg">Explore the library</Link>
            </div>
            <div className="hero-trust">
              <span>Reference-grounded answers</span>
              <i />
              <span>No account needed</span>
              <i />
              <span>Nothing stored between visits</span>
            </div>
          </motion.div>

          <HeroEmblem />
        </div>
      </section>

      {/* ── Pillars ──────────────────────────────────────── */}
      <section className="section">
        <Reveal className="section-head">
          <h2>A companion for the fundamentals</h2>
          <p>Four areas the tradition keeps coming back to — and where most questions begin.</p>
        </Reveal>
        <div className="pillar-grid">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <TiltCard className="pillar glass">
                <div className="pillar-glyph">{p.glyph}</div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="section">
        <Reveal className="section-head">
          <h2>How an answer comes together</h2>
          <p>Honest about what’s happening behind the scenes.</p>
        </Reveal>
        <div className="steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08} className="step">
              <div className="step-n">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Library preview ──────────────────────────────── */}
      <section className="section">
        <Reveal className="section-head">
          <h2>Rooted in the classics</h2>
          <p>
            The guidance is informed by foundational texts. Read them as recommended
            background — the project summarizes principles rather than reproducing the works.
          </p>
        </Reveal>
        <div className="spine-row">
          {SOURCE_TEXTS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.05}>
              <Link to="/library" className="spine" style={{ background: s.accent }}>
                <span className="spine-title">{s.title}</span>
                <span className="spine-sanskrit">{s.sanskrit}</span>
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal className="section-cta">
          <Link to="/library" className="btn btn-ghost">Visit the library →</Link>
        </Reveal>
      </section>

      {/* ── Why Ayurveda ─────────────────────────────────── */}
      <section className="section">
        <Reveal>
          <div className="why glass">
            <div className="why-text">
              <h2>Why this, why now</h2>
              <p>
                Ayurveda is one of the world’s oldest continuous systems of wellbeing.
                Its strength is the ordinary: what you eat, how you sleep, the rhythm of
                your day. HerbiGPT keeps that spirit — practical, gentle, and grounded —
                while making it easy to ask a question and actually understand the answer.
              </p>
              <Link to="/about" className="btn btn-ghost">Read our approach</Link>
            </div>
            <div className="why-stats">
              <div className="stat">
                <span className="stat-num">5</span>
                <span className="stat-label">Foundational texts referenced</span>
              </div>
              <div className="stat">
                <span className="stat-num">4</span>
                <span className="stat-label">Everyday areas covered</span>
              </div>
              <div className="stat">
                <span className="stat-num">∞</span>
                <span className="stat-label">Questions, at your pace</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Contributors ─────────────────────────────────── */}
      <section className="section">
        <Reveal className="section-head">
          <h2>Built by</h2>
          <p>A small team that cares about getting the details right.</p>
        </Reveal>
        <div className="people">
          {CONTRIBUTORS.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.06}>
              <div className="person glass">
                <div className="person-avatar" style={{ background: c.accent }}>{c.initials}</div>
                <div className="person-name">{c.name}</div>
                <div className="person-role">{c.role}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────── */}
      <section className="section">
        <Reveal>
          <div className="closing glass">
            <h2>Have a question in mind?</h2>
            <p>Start anywhere. It’s an unhurried conversation.</p>
            <Link to="/chat" className="btn btn-primary btn-lg">Open the chat</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
