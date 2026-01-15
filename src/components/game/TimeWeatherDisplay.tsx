import { useGameStore } from '@/game/gameState';
import { t } from '@/game/localization';
import { motion } from 'framer-motion';
import { Sun, Moon, Sunrise, Sunset, Cloud, CloudRain, CloudSnow } from 'lucide-react';

export function TimeWeatherDisplay() {
  const { timeOfDay, weather, language } = useGameStore();
  
  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'dawn':
        return <Sunrise className="w-4 h-4 text-secondary" />;
      case 'day':
        return <Sun className="w-4 h-4 text-game-temperature" />;
      case 'dusk':
        return <Sunset className="w-4 h-4 text-secondary" />;
      case 'night':
        return <Moon className="w-4 h-4 text-accent" />;
    }
  };
  
  const getWeatherIcon = () => {
    switch (weather) {
      case 'clear':
        return <Cloud className="w-4 h-4" />;
      case 'rain':
        return <CloudRain className="w-4 h-4 text-game-thirst" />;
      case 'snow':
        return <CloudSnow className="w-4 h-4 text-accent" />;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel px-3 py-2 flex items-center gap-3"
    >
      <div className="flex items-center gap-1.5">
        {getTimeIcon()}
        <span className="text-xs font-medium">{t(timeOfDay, language)}</span>
      </div>
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-1.5">
        {getWeatherIcon()}
        <span className="text-xs font-medium">{t(weather, language)}</span>
      </div>
    </motion.div>
  );
}
