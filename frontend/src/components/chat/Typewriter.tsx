import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface TypewriterProps {
  text: string;
  /** When false, render immediately (e.g. for history / reduced motion). */
  animate: boolean;
  onUpdate?: () => void;
  onDone?: () => void;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Reveals an answer with a smooth typewriter effect, then renders it as
 * markdown. This is a client-side reveal for feel — the answer arrives in
 * full from the API, it is not token streaming.
 */
export default function Typewriter({ text, animate, onUpdate, onDone }: TypewriterProps) {
  const [count, setCount] = useState(animate && !prefersReducedMotion() ? 0 : text.length);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!animate || prefersReducedMotion()) {
      setCount(text.length);
      onDone?.();
      return;
    }

    let i = 0;
    let last = performance.now();
    // Reveal faster for longer answers so nothing feels slow.
    const perTick = Math.max(2, Math.round(text.length / 140));

    const step = (now: number) => {
      if (now - last >= 16) {
        last = now;
        i = Math.min(text.length, i + perTick);
        setCount(i);
        onUpdate?.();
      }
      if (i < text.length) {
        raf.current = requestAnimationFrame(step);
      } else {
        onDone?.();
      }
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, animate]);

  const visible = text.slice(0, count);
  const typing = count < text.length;

  return (
    <div className="markdown">
      <ReactMarkdown>{visible}</ReactMarkdown>
      {typing && <span className="type-caret" aria-hidden="true" />}
    </div>
  );
}
