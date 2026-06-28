import { useEffect, useState } from 'react';

interface ParallaxValue {
  // Normalized pointer position from -1 (left/top) to 1 (right/bottom).
  x: number;
  y: number;
}

const isCoarsePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(pointer: coarse)').matches;

/**
 * Tracks the pointer relative to the viewport center for subtle parallax.
 * No-ops on touch devices to avoid jank and save battery.
 */
export function useMouseParallax(): ParallaxValue {
  const [pos, setPos] = useState<ParallaxValue>({ x: 0, y: 0 });

  useEffect(() => {
    if (isCoarsePointer()) return;

    let frame = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        setPos({ x, y });
      });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return pos;
}
