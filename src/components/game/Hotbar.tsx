import { useGameStore } from '@/game/gameState';
import { fixedHotbarItems } from '@/game/recipes';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Hotbar() {
  const { selectedSlot, selectSlot, inventory, getItemCount } = useGameStore();
  
  // Build display items with fixed slots and quantities
  const displayItems = fixedHotbarItems.map((fixedItem, index) => {
    if (!fixedItem) return null;
    
    // For consumables, check inventory quantity
    let quantity = 0;
    if (fixedItem.id === 'bow') {
      quantity = getItemCount('bow') > 0 ? 1 : 0;
    } else if (fixedItem.id === 'torch') {
      quantity = getItemCount('torch') > 0 ? 1 : 0;
    } else if (fixedItem.id === 'water_bottle') {
      quantity = getItemCount('water_bottle');
    } else if (fixedItem.id === 'fruit') {
      // Fruit slot shows apples + berries
      quantity = getItemCount('apple') + getItemCount('berry');
    } else if (fixedItem.id === 'meat') {
      quantity = getItemCount('meat');
    }
    
    return { ...fixedItem, quantity };
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
              : 'border-transparent hover:border-muted-foreground/30',
            item && item.quantity === 0 && 'opacity-50'
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
              {item.quantity > 0 && (
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
