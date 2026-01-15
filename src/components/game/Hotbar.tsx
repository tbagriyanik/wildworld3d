import { useGameStore } from '@/game/gameState';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Hotbar() {
  const { hotbar, selectedSlot, selectSlot, inventory } = useGameStore();
  
  // Auto-populate hotbar with first 8 inventory items
  const displayItems = hotbar.map((slot, index) => {
    if (slot) return slot;
    return inventory[index] || null;
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-1"
    >
      {displayItems.map((item, index) => (
        <motion.button
          key={index}
          onClick={() => selectSlot(index)}
          className={cn(
            'hotbar-slot',
            selectedSlot === index && 'active'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {item ? (
            <div className="relative">
              <span className="text-2xl">{item.icon}</span>
              {item.quantity > 1 && (
                <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-background/80 px-1 rounded">
                  {item.quantity}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">{index + 1}</span>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}
