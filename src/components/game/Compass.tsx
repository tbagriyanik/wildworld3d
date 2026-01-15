import { useGameStore } from '@/game/gameState';
import { t } from '@/game/localization';
import { motion } from 'framer-motion';

export function Compass() {
  const { playerRotation, language } = useGameStore();
  
  // Convert rotation to degrees (0-360)
  const degrees = ((playerRotation * 180) / Math.PI + 360) % 360;
  
  // Direction labels at specific angles
  const directions = [
    { angle: 0, label: t('north', language), primary: true },
    { angle: 45, label: 'NE', primary: false },
    { angle: 90, label: t('east', language), primary: true },
    { angle: 135, label: 'SE', primary: false },
    { angle: 180, label: t('south', language), primary: true },
    { angle: 225, label: 'SW', primary: false },
    { angle: 270, label: t('west', language), primary: true },
    { angle: 315, label: 'NW', primary: false },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel px-4 py-2 w-64 h-10 overflow-hidden relative"
    >
      {/* Center marker */}
      <div className="absolute left-1/2 top-0 w-0.5 h-2 bg-primary -translate-x-1/2 z-10" />
      <div className="absolute left-1/2 bottom-0 w-0.5 h-2 bg-primary -translate-x-1/2 z-10" />
      
      {/* Compass strip */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translateX(${degrees * 0.7}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Render ticks */}
        {Array.from({ length: 72 }).map((_, i) => {
          const tickAngle = i * 5;
          const offset = (tickAngle - 180) * 0.7;
          const isMajor = tickAngle % 45 === 0;
          const direction = directions.find((d) => d.angle === tickAngle);
          
          return (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{ left: `calc(50% + ${offset}px)` }}
            >
              <div
                className={cn(
                  'w-0.5 bg-foreground/50',
                  isMajor ? 'h-3' : 'h-1.5'
                )}
              />
              {direction && (
                <span
                  className={cn(
                    'text-xs mt-0.5',
                    direction.primary ? 'font-bold text-primary' : 'text-muted-foreground'
                  )}
                >
                  {direction.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
