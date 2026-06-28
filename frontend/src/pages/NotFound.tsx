import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="notfound">
      <motion.div
        className="notfound-card glass"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="notfound-mark">🌿</div>
        <div className="notfound-code">404</div>
        <h1>This path is overgrown</h1>
        <p>The page you were looking for isn’t here. Let’s find your way back.</p>
        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary">Return home</Link>
          <Link to="/chat" className="btn btn-ghost">Open chat</Link>
        </div>
      </motion.div>
    </div>
  );
}
