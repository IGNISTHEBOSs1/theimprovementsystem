import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from './useAchievements';
import { Trophy, X } from 'lucide-react';

interface AchievementUnlockNotificationProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

const rarityLabels = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const rarityColors = {
  common: 'text-muted-foreground',
  rare: 'text-blue-400',
  epic: 'text-primary',
  legendary: 'text-yellow-400',
};

const rarityBg = {
  common: 'from-muted/20 to-transparent',
  rare: 'from-blue-500/20 to-transparent',
  epic: 'from-primary/20 to-transparent',
  legendary: 'from-yellow-500/20 to-transparent',
};

export const AchievementUnlockNotification = ({ 
  achievement, 
  onDismiss 
}: AchievementUnlockNotificationProps) => {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
        >
          <motion.div
            className={`
              relative overflow-hidden
              bg-card/95 backdrop-blur-md border-2 
              ${achievement.rarity === 'legendary' ? 'border-yellow-500/60' :
                achievement.rarity === 'epic' ? 'border-primary/60' :
                achievement.rarity === 'rare' ? 'border-blue-500/60' :
                'border-border'}
              rounded-xl shadow-2xl
              ${achievement.rarity === 'legendary' ? 'shadow-yellow-500/30' :
                achievement.rarity === 'epic' ? 'shadow-primary/30' :
                achievement.rarity === 'rare' ? 'shadow-blue-500/30' :
                'shadow-black/50'}
            `}
          >
            {/* Animated background gradient */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${rarityBg[achievement.rarity]}`}
              animate={{ 
                x: ['-100%', '100%'],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            <div className="relative flex items-center gap-4 p-4 pr-12">
              {/* Trophy icon with pulse */}
              <div className="relative">
                <motion.div
                  className={`
                    w-14 h-14 rounded-xl flex items-center justify-center
                    bg-gradient-to-br ${rarityBg[achievement.rarity]}
                    border ${achievement.rarity === 'legendary' ? 'border-yellow-500/40' :
                      achievement.rarity === 'epic' ? 'border-primary/40' :
                      achievement.rarity === 'rare' ? 'border-blue-500/40' :
                      'border-border'}
                  `}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <span className="text-3xl">{achievement.icon}</span>
                </motion.div>
                
                {/* Sparkle particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-1 h-1 rounded-full ${
                      achievement.rarity === 'legendary' ? 'bg-yellow-400' :
                      achievement.rarity === 'epic' ? 'bg-primary' :
                      'bg-blue-400'
                    }`}
                    initial={{ 
                      opacity: 0, 
                      scale: 0,
                      x: 28,
                      y: 28,
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      x: 28 + Math.cos(i * 60 * Math.PI / 180) * 30,
                      y: 28 + Math.sin(i * 60 * Math.PI / 180) * 30,
                    }}
                    transition={{ 
                      duration: 0.8,
                      delay: i * 0.1,
                      repeat: 2,
                    }}
                  />
                ))}
              </div>

              {/* Text content */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Trophy className={`w-4 h-4 ${rarityColors[achievement.rarity]}`} />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Achievement Unlocked
                  </span>
                </div>
                <h3 className={`font-display font-bold text-lg ${rarityColors[achievement.rarity]}`}>
                  {achievement.name}
                </h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                <span className={`text-xs mt-1 ${rarityColors[achievement.rarity]}`}>
                  {rarityLabels[achievement.rarity]}
                </span>
              </div>

              {/* Close button */}
              <button
                onClick={onDismiss}
                className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
