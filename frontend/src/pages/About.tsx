import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Reveal from '../components/ui/Reveal';
import { FAQS, CONTRIBUTORS, GITHUB_URL } from '../data/content';

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq${open ? ' is-open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{q}</span>
        <span className="faq-icon" aria-hidden="true">{open ? '–' : '+'}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="faq-a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <p>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const TECH = [
  { k: 'Interface', v: 'React + TypeScript, with motion for the small details' },
  { k: 'Answers', v: 'A language model, prompted with retrieved reference notes' },
  { k: 'Retrieval', v: 'A curated knowledge base matched to your question' },
  { k: 'Service', v: 'A typed Node API with health checks and sensible limits' },
];

export default function About() {
  return (
    <div className="page about">
      <header className="page-head">
        <Reveal>
          <span className="eyebrow"><span className="eyebrow-dot" />Our approach</span>
          <h1>Old knowledge, treated with care</h1>
          <p className="page-lead">
            HerbiGPT began with a simple frustration: the wisdom of Ayurveda is everywhere,
            but it’s scattered, inconsistent, and often buried in jargon. We wanted a calmer
            way to ask a question and get an answer you can actually trust and trace.
          </p>
        </Reveal>
      </header>

      {/* Mission / Philosophy */}
      <section className="section about-split">
        <Reveal className="about-block glass">
          <h2>Mission</h2>
          <p>
            Make the everyday side of Ayurveda — food, routine, herbs, balance — clear and
            approachable, without overstating what it can do.
          </p>
        </Reveal>
        <Reveal className="about-block glass" delay={0.06}>
          <h2>Philosophy</h2>
          <p>
            Be honest about sources. Stay practical. Never pretend to be a doctor. When in
            doubt, point toward a qualified practitioner and the original tradition.
          </p>
        </Reveal>
      </section>

      {/* Research process */}
      <section className="section" id="research">
        <Reveal className="section-head">
          <h2>The research process</h2>
          <p>How reference material becomes a grounded answer.</p>
        </Reveal>
        <div className="timeline">
          {[
            ['Gather', 'Summarize widely-taught principles from the classical tradition into concise, attributable notes.'],
            ['Curate', 'Organize those notes into a small knowledge base by topic — herbs, dosha, diet, routine, practice.'],
            ['Retrieve', 'For each question, surface the most relevant notes to ground the response.'],
            ['Compose', 'Write a clear answer from that context and show which references informed it.'],
          ].map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.06} className="timeline-item">
              <div className="timeline-dot" />
              <h3>{t}</h3>
              <p>{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Technology */}
      <section className="section">
        <Reveal className="section-head">
          <h2>How it’s built</h2>
          <p>Boring on purpose — readable, typed, and easy to maintain.</p>
        </Reveal>
        <div className="tech-list">
          {TECH.map((t, i) => (
            <Reveal key={t.k} delay={i * 0.05} className="tech-row glass">
              <span className="tech-k">{t.k}</span>
              <span className="tech-v">{t.v}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <Reveal className="section-head">
          <h2>Questions, answered</h2>
          <p>The things people ask before they start.</p>
        </Reveal>
        <div className="faq-list">
          {FAQS.map(f => (
            <FaqRow key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* Contributors */}
      <section className="section">
        <Reveal className="section-head">
          <h2>The people</h2>
        </Reveal>
        <div className="people people-wide">
          {CONTRIBUTORS.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.06}>
              <div className="person person-detailed glass">
                <div className="person-avatar" style={{ background: c.accent }}>{c.initials}</div>
                <div>
                  <div className="person-name">{c.name}</div>
                  <div className="person-role">{c.role}</div>
                  <ul className="person-points">
                    {c.points.map(p => <li key={p}>{p}</li>)}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Acknowledgements + Contact */}
      <section className="section about-split" id="acknowledgements">
        <Reveal className="about-block glass">
          <h2>Acknowledgements</h2>
          <p>
            With gratitude to the lineage of teachers, translators, and practitioners who
            have kept this knowledge alive — and to the open-source community whose tools
            make a project like this possible.
          </p>
          <a className="btn btn-ghost" href={GITHUB_URL} target="_blank" rel="noreferrer">
            View the source ↗
          </a>
        </Reveal>
        <Reveal className="about-block glass" delay={0.06} >
          <h2 id="contact-anchor">Contact</h2>
          <p>
            Questions, corrections, or ideas are welcome. Open an issue on GitHub, or reach
            out directly.
          </p>
          <a className="btn btn-ghost" href="mailto:hello@herbigpt.app">Say hello →</a>
        </Reveal>
      </section>

      <Reveal>
        <div className="closing glass">
          <h2>Ready when you are</h2>
          <p>The best way to understand it is to ask something.</p>
          <Link to="/chat" className="btn btn-primary btn-lg">Open the chat</Link>
        </div>
      </Reveal>
    </div>
  );
}
