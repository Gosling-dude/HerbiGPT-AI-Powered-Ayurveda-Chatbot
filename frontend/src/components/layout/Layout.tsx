import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, useEffect } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
import AuroraBackground from './AuroraBackground';
import PageLoader from '../ui/PageLoader';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function Layout() {
  const location = useLocation();
  const isChat = location.pathname.startsWith('/chat');

  // Scroll to top on route change (but not for in-page hash links).
  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  return (
    <div className={`shell${isChat ? ' shell-app' : ''}`}>
      <AuroraBackground />
      <NavBar />

      <main className="shell-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="route"
          >
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {!isChat && <Footer />}
    </div>
  );
}
