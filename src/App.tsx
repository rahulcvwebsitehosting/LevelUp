import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import { Dashboard } from './components/Dashboard';
import { WorkoutLogger } from './components/WorkoutLogger';
import { Analytics } from './components/Analytics';
import { SplitManager } from './components/SplitManager';
import { Settings } from './components/Settings';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy } from 'lucide-react';
import { useAnimatedFavicon } from './hooks/useAnimatedFavicon';

function AppContent() {
  const { activeSession, user } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showLevelUp, setShowLevelUp] = useState(false);

  useAnimatedFavicon();

  React.useEffect(() => {
    if (user.totalXP > 0 && user.totalXP % 1000 === 0) {
      setShowLevelUp(true);
    }
  }, [user.totalXP]);

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-bg-primary relative px-4 pt-8 text-text-primary overflow-x-hidden">
      {/* Global HUD Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-accent-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-accent-tertiary/5 to-transparent" />
      </div>

      <AnimatePresence mode="wait">
        {activeSession ? (
          <WorkoutLogger key="logger" />
        ) : (
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10"
          >
            {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
            {currentPage === 'analytics' && <Analytics onBack={() => setCurrentPage('dashboard')} />}
            {currentPage === 'splits' && <SplitManager onBack={() => setCurrentPage('dashboard')} />}
            {currentPage === 'settings' && <Settings onBack={() => setCurrentPage('dashboard')} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Modal */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50, rotateX: 45 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              className="text-center space-y-10 max-w-sm w-full relative"
            >
              <div className="absolute inset-0 bg-accent-primary/20 blur-[100px] rounded-full animate-pulse" />
              
              <div className="flex justify-center relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-accent-primary/30 rounded-full scale-150"
                />
                <div className="w-32 h-32 rounded-2xl bg-bg-secondary border-2 border-accent-primary flex items-center justify-center shadow-[0_0_50px_rgba(0,255,136,0.5)] rotate-45">
                  <Trophy className="w-16 h-16 text-accent-primary -rotate-45" />
                </div>
              </div>

              <div className="space-y-2 relative">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-[10px] uppercase tracking-[0.5em] font-black text-accent-primary">Promotion Achieved</span>
                  <h1 className="text-5xl font-mono font-black tracking-tighter uppercase italic mt-2">Rank Up</h1>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-text-secondary font-mono text-xs uppercase tracking-widest"
                >
                  New Tier Unlocked: {user.currentRank}
                </motion.p>
              </div>

              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={() => setShowLevelUp(false)}
                className="btn-primary w-full py-5 text-xl font-mono italic"
              >
                Acknowledge
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
