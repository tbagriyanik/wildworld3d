import { useGameStore } from '@/game/gameState';
import { t } from '@/game/localization';
import { motion } from 'framer-motion';

export function Compass() {
  const { playerRotation, language } = useGameStore();
  
  // Convert rotation to degrees (0-360)
  const degrees = ((playerRotation * 180) / Math.PI + 360) % 360;
  
  // Calculate which directions to show based on rotation
  const getVisibleDirections = () => {
    const directions = [
      { angle: 0, label: language === 'tr' ? 'K' : 'N', primary: true },
      { angle: 90, label: language === 'tr' ? 'D' : 'E', primary: true },
      { angle: 180, label: language === 'tr' ? 'G' : 'S', primary: true },
      { angle: 270, label: language === 'tr' ? 'B' : 'W', primary: true },
    ];
    
    return directions.map(dir => {
      // Calculate position relative to center
      let relativeAngle = dir.angle - degrees;
      // Normalize to -180 to 180
      while (relativeAngle > 180) relativeAngle -= 360;
      while (relativeAngle < -180) relativeAngle += 360;
      
      return {
        ...dir,
        position: relativeAngle,
        visible: Math.abs(relativeAngle) < 60,
      };
    });
  };
  
  const visibleDirections = getVisibleDirections();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel px-6 py-2 w-48 h-10 overflow-hidden relative flex items-center justify-center"
    >
      {/* Center marker */}
      <div className="absolute left-1/2 top-1 w-0.5 h-2 bg-primary -translate-x-1/2 z-10" />
      
      {/* Direction labels */}
      {visibleDirections.map((dir) => (
        dir.visible && (
          <motion.span
            key={dir.angle}
            className={`absolute text-sm font-bold ${dir.primary ? 'text-foreground' : 'text-muted-foreground'}`}
            style={{
              left: `calc(50% + ${dir.position * 1.2}px)`,
              transform: 'translateX(-50%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {dir.label}
          </motion.span>
        )
      ))}
      
      {/* Tick marks */}
      <div className="absolute inset-x-0 bottom-1 flex justify-center">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-muted-foreground/50 to-transparent" />
      </div>
    </motion.div>
  );
}
