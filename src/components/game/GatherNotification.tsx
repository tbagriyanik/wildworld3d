import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/game/gameState';
import { Package } from 'lucide-react';

interface GatherNotificationProps {
  message: string | null;
  icon: string | null;
}

export function GatherNotification({ message, icon }: GatherNotificationProps) {
  const { language } = useGameStore();
  
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.9 }}
          className="glass-panel px-4 py-3 flex items-center gap-3"
        >
          <span className="text-2xl">{icon || '📦'}</span>
          <span className="font-semibold text-sm uppercase tracking-wide">
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
