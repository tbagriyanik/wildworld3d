import { useGameStore } from '@/game/gameState';
import { motion, AnimatePresence } from 'framer-motion';

export function Inventory() {
  const { inventory } = useGameStore();
  
  if (inventory.length === 0) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-2"
    >
      <AnimatePresence>
        {inventory.slice(0, 6).map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="glass-panel px-4 py-3 flex items-center gap-3 min-w-[100px]"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-lg font-bold tabular-nums">
              {item.quantity}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
