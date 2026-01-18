import { StatusBars } from './StatusBars';
import { Inventory } from './Inventory';
import { Hotbar } from './Hotbar';
import { Compass } from './Compass';
import { CraftingMenu } from './CraftingMenu';
import { LanguageToggle } from './LanguageToggle';
import { GatherNotification } from './GatherNotification';
import { useGameStore } from '@/game/gameState';
import { t } from '@/game/localization';
import { soundSystem } from '@/game/soundSystem';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface StartScreenProps {
  onStart: (loadSave: boolean) => void;
}

function StartScreen({ onStart }: StartScreenProps) {
  const { language, hasSavedGame } = useGameStore();
  const [isMobile, setIsMobile] = useState(false);
  const hasSave = hasSavedGame();
  
  useEffect(() => {
    setIsMobile('ontouchstart' in window);
  }, []);
  
  const handleContinue = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundSystem.play('menu_open');
    onStart(true);
  };
  
  const handleNewGame = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundSystem.play('menu_open');
    onStart(false);
  };
  
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
          className="flex flex-col gap-3 items-center mb-6"
        >
          {hasSave && (
            <button
              onClick={handleContinue}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors min-w-[200px]"
            >
              {t('continue_game', language)}
            </button>
          )}
          <button
            onClick={handleNewGame}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-colors min-w-[200px] ${
              hasSave 
                ? 'bg-muted text-muted-foreground hover:bg-muted/80' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {t('new_game', language)}
          </button>
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

function PauseMenu({ onResume, onMainMenu }: { onResume: () => void; onMainMenu: () => void }) {
  const { language } = useGameStore();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel p-8 text-center"
      >
        <h2 className="text-4xl font-display font-bold text-primary mb-8">
          {t('paused', language)}
        </h2>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              soundSystem.play('menu_close');
              onResume();
            }}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors min-w-[200px]"
          >
            {t('resume', language)}
          </button>
          <button
            onClick={() => {
              soundSystem.play('menu_open');
              onMainMenu();
            }}
            className="px-8 py-3 bg-muted text-muted-foreground rounded-lg font-bold text-lg hover:bg-muted/80 transition-colors min-w-[200px]"
          >
            {t('main_menu', language)}
          </button>
        </div>
      </motion.div>
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
  const [showPause, setShowPause] = useState(false);
  const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);
  const [saveNotification, setSaveNotification] = useState(false);
  const { loadGame, deleteSave, language, isCraftingOpen, toggleCrafting, isPaused, setPaused } = useGameStore();
  
  const handleStart = async (loadSave: boolean) => {
    // Initialize sound system
    await soundSystem.init();
    
    if (loadSave) {
      loadGame();
      window.dispatchEvent(new CustomEvent('loadGame'));
    } else {
      deleteSave();
      window.dispatchEvent(new CustomEvent('newGame'));
    }
    setShowStart(false);
  };

  const handleResume = () => {
    setShowPause(false);
    setPaused(false);
    window.dispatchEvent(new CustomEvent('resumeGame'));
  };

  const handleMainMenu = () => {
    setShowPause(false);
    setPaused(false);
    setShowStart(true);
    soundSystem.stopAmbient();
  };

  // Listen for events
  useEffect(() => {
    const handleGather = (e: CustomEvent) => {
      const { language } = useGameStore.getState();
      const resourceName = e.detail.resourceKey;
      const icon = e.detail.icon;
      const message = language === 'tr' 
        ? `${t(resourceName, language).toUpperCase()} TOPLANDI`
        : `${t(resourceName, language).toUpperCase()} GATHERED`;
      
      soundSystem.play('gather');
      setNotification({ message, icon });
      
      setTimeout(() => {
        setNotification(null);
      }, 2000);
    };
    
    const handleSave = () => {
      setSaveNotification(true);
      setTimeout(() => setSaveNotification(false), 2000);
    };

    const handleAction = (e: CustomEvent) => {
      const { language } = useGameStore.getState();
      const { action, icon } = e.detail;
      const message = t(action, language).toUpperCase();
      
      setNotification({ message, icon });
      setTimeout(() => setNotification(null), 2000);
    };

    const handlePause = () => {
      setShowPause(true);
      setPaused(true);
      soundSystem.play('menu_open');
    };
    
    window.addEventListener('gather' as any, handleGather);
    window.addEventListener('gameSaved' as any, handleSave);
    window.addEventListener('gameAction' as any, handleAction);
    window.addEventListener('pauseGame' as any, handlePause);
    
    return () => {
      window.removeEventListener('gather' as any, handleGather);
      window.removeEventListener('gameSaved' as any, handleSave);
      window.removeEventListener('gameAction' as any, handleAction);
      window.removeEventListener('pauseGame' as any, handlePause);
    };
  }, [setPaused]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        
        // If crafting menu is open, close it
        if (isCraftingOpen) {
          toggleCrafting();
          soundSystem.play('menu_close');
          return;
        }
        
        // If pause menu is showing, resume
        if (showPause) {
          handleResume();
          return;
        }
        
        // Otherwise, show pause menu (if game started)
        if (!showStart) {
          window.dispatchEvent(new CustomEvent('pauseGame'));
        }
      }
      
      // C or Tab for crafting
      if ((e.key.toLowerCase() === 'c' || e.key === 'Tab') && !showStart && !showPause) {
        e.preventDefault();
        toggleCrafting();
        soundSystem.play(isCraftingOpen ? 'menu_close' : 'menu_open');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showStart, showPause, isCraftingOpen, toggleCrafting]);
  
  return (
    <>
      <AnimatePresence>
        {showStart && <StartScreen onStart={handleStart} />}
      </AnimatePresence>

      <AnimatePresence>
        {showPause && !showStart && (
          <PauseMenu onResume={handleResume} onMainMenu={handleMainMenu} />
        )}
      </AnimatePresence>
      
      {/* Save Notification */}
      <AnimatePresence>
        {saveNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-bold text-lg"
          >
            💾 {t('game_saved', language)}
          </motion.div>
        )}
      </AnimatePresence>
      
      {!showStart && !showPause && (
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
