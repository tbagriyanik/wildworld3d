import { useGameStore } from '@/game/gameState';
import { t } from '@/game/localization';
import { motion } from 'framer-motion';

interface StatusBarProps {
  label: string;
  value: number;
  colorClass: string;
}

function StatusBar({ label, value, colorClass }: StatusBarProps) {
  const percentage = Math.round(value);
  
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide min-w-[70px]">
        {label}
      </span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums w-10 text-right">
        {percentage}%
      </span>
    </div>
  );
}

export function StatusBars() {
  const { player, language, dayTime } = useGameStore();
  
  // Calculate day number and time
  const dayNumber = Math.floor(dayTime * 10) + 1;
  const hours = Math.floor(dayTime * 24);
  const minutes = Math.floor((dayTime * 24 * 60) % 60);
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel p-4 w-52"
    >
      {/* Day and Time Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <span className="font-display font-bold text-sm">
          {language === 'tr' ? 'GÜN' : 'DAY'} {dayNumber}
        </span>
        <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono font-bold">
          {timeString}
        </span>
      </div>
      
      <div className="space-y-2">
        <StatusBar
          label={language === 'tr' ? 'SAĞLIK' : 'HEALTH'}
          value={player.health}
          colorClass="bg-game-health"
        />
        <StatusBar
          label={language === 'tr' ? 'AÇLIK' : 'HUNGER'}
          value={player.hunger}
          colorClass="bg-game-hunger"
        />
        <StatusBar
          label={language === 'tr' ? 'SUSUZLUK' : 'THIRST'}
          value={player.thirst}
          colorClass="bg-game-thirst"
        />
        <StatusBar
          label={language === 'tr' ? 'SICAKLIK' : 'TEMP'}
          value={player.temperature}
          colorClass="bg-game-temperature"
        />
      </div>
    </motion.div>
  );
}
