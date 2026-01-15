import { Heart, Drumstick, Droplets, Thermometer } from 'lucide-react';
import { useGameStore } from '@/game/gameState';
import { t } from '@/game/localization';
import { motion } from 'framer-motion';

interface StatusBarProps {
  label: string;
  value: number;
  max: number;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}

function StatusBar({ label, value, max, icon, colorClass, bgClass }: StatusBarProps) {
  const percentage = (value / max) * 100;
  const isLow = percentage < 25;
  
  return (
    <div className="flex items-center gap-2">
      <div className={`${isLow ? 'animate-pulse-glow' : ''}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className={`status-bar ${bgClass}`}>
          <motion.div
            className={`status-bar-fill ${colorClass}`}
            initial={{ width: '100%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>
      <span className="text-xs font-medium w-8 text-right tabular-nums">
        {Math.round(value)}
      </span>
    </div>
  );
}

export function StatusBars() {
  const { player, language } = useGameStore();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel p-3 space-y-2 w-48"
    >
      <StatusBar
        label={t('health', language)}
        value={player.health}
        max={100}
        icon={<Heart className="w-4 h-4 text-game-health" fill="currentColor" />}
        colorClass="bg-game-health"
        bgClass="bg-game-health-bg"
      />
      <StatusBar
        label={t('hunger', language)}
        value={player.hunger}
        max={100}
        icon={<Drumstick className="w-4 h-4 text-game-hunger" />}
        colorClass="bg-game-hunger"
        bgClass="bg-game-hunger-bg"
      />
      <StatusBar
        label={t('thirst', language)}
        value={player.thirst}
        max={100}
        icon={<Droplets className="w-4 h-4 text-game-thirst" fill="currentColor" />}
        colorClass="bg-game-thirst"
        bgClass="bg-game-thirst-bg"
      />
      <StatusBar
        label={t('temperature', language)}
        value={player.temperature}
        max={100}
        icon={<Thermometer className="w-4 h-4 text-game-temperature" />}
        colorClass="bg-game-temperature"
        bgClass="bg-game-temperature-bg"
      />
    </motion.div>
  );
}
