import { useGameStore } from '@/game/gameState';
import { motion } from 'framer-motion';

export function LanguageToggle() {
  const { language, setLanguage } = useGameStore();
  
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
      className="glass-panel px-3 py-2 hover:bg-muted/50 transition-colors font-bold text-sm"
    >
      {language.toUpperCase()}
    </motion.button>
  );
}
