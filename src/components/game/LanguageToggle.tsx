import { useGameStore } from '@/game/gameState';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useGameStore();
  
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
      className="glass-panel px-3 py-2 flex items-center gap-2 hover:bg-muted/50 transition-colors"
    >
      <Globe className="w-4 h-4" />
      <span className="text-xs font-medium uppercase">{language}</span>
    </motion.button>
  );
}
