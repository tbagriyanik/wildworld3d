import { useGameStore } from '@/game/gameState';
import { t } from '@/game/localization';
import { craftingRecipes } from '@/game/recipes';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CraftingMenu() {
  const { isCraftingOpen, toggleCrafting, inventory, addItem, removeItem, language } = useGameStore();
  
  const canCraft = (recipeId: string) => {
    const recipe = craftingRecipes.find((r) => r.id === recipeId);
    if (!recipe) return false;
    
    return recipe.ingredients.every((ingredient) => {
      const item = inventory.find((i) => i.id === ingredient.itemId);
      return item && item.quantity >= ingredient.quantity;
    });
  };
  
  const craft = (recipeId: string) => {
    const recipe = craftingRecipes.find((r) => r.id === recipeId);
    if (!recipe || !canCraft(recipeId)) return;
    
    // Remove ingredients
    recipe.ingredients.forEach((ingredient) => {
      removeItem(ingredient.itemId, ingredient.quantity);
    });
    
    // Add result
    addItem(recipe.result, recipe.resultQuantity);
  };
  
  const getItemCount = (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    return item?.quantity || 0;
  };
  
  return (
    <AnimatePresence>
      {isCraftingOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={toggleCrafting}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-panel p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Hammer className="w-5 h-5" />
                {t('crafting', language)}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCrafting}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {craftingRecipes.map((recipe) => {
                const craftable = canCraft(recipe.id);
                
                return (
                  <motion.div
                    key={recipe.id}
                    className={`glass-panel p-4 transition-opacity ${
                      craftable ? '' : 'opacity-50'
                    }`}
                    whileHover={craftable ? { scale: 1.02 } : {}}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{recipe.result.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {t(recipe.nameKey, language)}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          {recipe.ingredients.map((ingredient) => {
                            const count = getItemCount(ingredient.itemId);
                            const hasEnough = count >= ingredient.quantity;
                            
                            return (
                              <span
                                key={ingredient.itemId}
                                className={`text-xs ${
                                  hasEnough ? 'text-primary' : 'text-destructive'
                                }`}
                              >
                                {t(ingredient.itemId, language)}: {count}/{ingredient.quantity}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <Button
                        onClick={() => craft(recipe.id)}
                        disabled={!craftable}
                        size="sm"
                      >
                        {t('craft', language)}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
