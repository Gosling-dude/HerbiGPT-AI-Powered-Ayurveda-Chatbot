import { motion } from 'framer-motion';
import { useMouseParallax } from '../../hooks/useMouseParallax';

/**
 * Ambient background: a gradient mesh, three slow aurora blobs, and a fine
 * grain overlay. The blobs drift on their own and lean gently toward the
 * pointer for depth. Fixed + pointer-events:none so it never blocks UI.
 */
export default function AuroraBackground() {
  const { x, y } = useMouseParallax();

  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora-mesh" />

      <motion.div
        className="aurora-blob aurora-blob-1"
        animate={{ x: x * 28, y: y * 28 }}
        transition={{ type: 'spring', stiffness: 40, damping: 20 }}
      />
      <motion.div
        className="aurora-blob aurora-blob-2"
        animate={{ x: x * -36, y: y * -24 }}
        transition={{ type: 'spring', stiffness: 35, damping: 22 }}
      />
      <motion.div
        className="aurora-blob aurora-blob-3"
        animate={{ x: x * 20, y: y * -30 }}
        transition={{ type: 'spring', stiffness: 30, damping: 24 }}
      />

      <div className="aurora-grain" />
    </div>
  );
}
