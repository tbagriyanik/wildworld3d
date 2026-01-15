import { useGameStore } from '@/game/gameState';
import { t } from '@/game/localization';
import { motion, AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react';

export function Inventory() {
  const { inventory, language } = useGameStore();
  
  if (inventory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel p-3 w-40"
      >
        <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
          <Package className="w-4 h-4" />
          {t('inventory', language)}
        </div>
        <p className="text-xs text-muted-foreground text-center py-4">
          Empty
        </p>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel p-3 w-40"
    >
      <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
        <Package className="w-4 h-4" />
        {t('inventory', language)}
      </div>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        <AnimatePresence>
          {inventory.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inventory-item"
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {t(item.nameKey, language)}
                </p>
                {item.durability !== undefined && (
                  <div className="h-1 bg-muted rounded-full mt-1">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(item.durability / (item.maxDurability || 1)) * 100}%` }}
                    />
                  </div>
                )}
              </div>
              <span className="text-xs font-bold tabular-nums">
                {item.quantity}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
