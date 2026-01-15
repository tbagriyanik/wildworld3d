import { StatusBars } from './StatusBars';
import { Inventory } from './Inventory';
import { Hotbar } from './Hotbar';
import { Compass } from './Compass';
import { CraftingMenu } from './CraftingMenu';
import { LanguageToggle } from './LanguageToggle';
import { GatherNotification } from './GatherNotification';
import { useGameStore } from '@/game/gameState';
import { t } from '@/game/localization';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

function StartScreen() {
  const { language } = useGameStore();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile('ontouchstart' in window);
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50"
    >
      <div className="text-center">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-display font-bold text-primary mb-4 text-shadow-game"
        >
          WILD LANDS
        </motion.h1>
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-muted-foreground mb-8"
        >
          Survival RPG
        </motion.p>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="animate-pulse-glow"
        >
          <p className="text-lg font-medium mb-4">{t('clickToStart', language)}</p>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-muted-foreground max-w-md"
        >
          {isMobile ? t('mobileControls', language) : t('controls', language)}
        </motion.p>
      </div>
    </motion.div>
  );
}

function Crosshair() {
  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-40">
      <div className="w-1.5 h-1.5 bg-foreground/70 rounded-full" />
    </div>
  );
}

export function GameUI() {
  const [showStart, setShowStart] = useState(true);
  const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);
  
  useEffect(() => {
    const handleClick = () => {
      if (showStart) {
        setShowStart(false);
      }
    };
    
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [showStart]);

  // Listen for gather events
  useEffect(() => {
    const handleGather = (e: CustomEvent) => {
      const { language } = useGameStore.getState();
      const resourceName = e.detail.resourceKey;
      const icon = e.detail.icon;
      const message = language === 'tr' 
        ? `${t(resourceName, language).toUpperCase()} TOPLANDI`
        : `${t(resourceName, language).toUpperCase()} GATHERED`;
      
      setNotification({ message, icon });
      
      setTimeout(() => {
        setNotification(null);
      }, 2000);
    };
    
    window.addEventListener('gather' as any, handleGather);
    return () => window.removeEventListener('gather' as any, handleGather);
  }, []);
  
  return (
    <>
      <AnimatePresence>
        {showStart && <StartScreen />}
      </AnimatePresence>
      
      {!showStart && (
        <>
          <Crosshair />
          
          {/* Top Left - Status Bars */}
          <div className="fixed top-4 left-4 z-30">
            <StatusBars />
          </div>
          
          {/* Top Right - Compass and Language */}
          <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
            <Compass />
            <LanguageToggle />
          </div>
          
          {/* Right Side - Inventory */}
          <div className="fixed top-1/2 -translate-y-1/2 right-4 z-30">
            <Inventory />
          </div>
          
          {/* Bottom Left - Gather Notification */}
          <div className="fixed bottom-24 left-4 z-30">
            <GatherNotification 
              message={notification?.message || null} 
              icon={notification?.icon || null} 
            />
          </div>
          
          {/* Bottom Center - Hotbar */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
            <Hotbar />
          </div>
          
          {/* Crafting Menu */}
          <CraftingMenu />
        </>
      )}
    </>
  );
}
