import { useGameStore } from '@/game/gameState';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Hotbar() {
  const { hotbar, selectedSlot, selectSlot, inventory } = useGameStore();
  
  // Auto-populate hotbar with first 8 inventory items
  const displayItems = Array(8).fill(null).map((_, index) => {
    if (hotbar[index]) return hotbar[index];
    return inventory[index] || null;
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-2 flex gap-1"
    >
      {displayItems.map((item, index) => (
        <motion.button
          key={index}
          onClick={() => selectSlot(index)}
          className={cn(
            'relative w-16 h-16 rounded-lg flex items-center justify-center transition-all duration-200',
            'bg-muted/50 hover:bg-muted border-2',
            selectedSlot === index 
              ? 'border-primary shadow-lg shadow-primary/20 scale-105' 
              : 'border-transparent hover:border-muted-foreground/30'
          )}
          whileHover={{ scale: selectedSlot === index ? 1.05 : 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Slot number */}
          <span className="absolute top-1 left-1.5 text-[10px] font-bold text-muted-foreground">
            {index + 1}
          </span>
          
          {item ? (
            <>
              <span className="text-3xl">{item.icon}</span>
              {item.quantity > 1 && (
                <span className="absolute bottom-1 right-1.5 text-xs font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                  {item.quantity}
                </span>
              )}
            </>
          ) : null}
        </motion.button>
      ))}
    </motion.div>
  );
}
