import { motion } from 'framer-motion';
import { Achievement } from '@/hooks/useAchievements';
import { Lock } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

const rarityColors = {
  common: 'from-muted to-muted-foreground/20 border-muted-foreground/30',
  rare: 'from-blue-500/20 to-blue-600/10 border-blue-500/50',
  epic: 'from-primary/20 to-primary/10 border-primary/50',
  legendary: 'from-yellow-500/20 to-amber-600/10 border-yellow-500/50',
};

const rarityGlow = {
  common: '',
  rare: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
  epic: 'shadow-[0_0_15px_hsl(var(--primary)/0.4)]',
  legendary: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]',
};

const sizeClasses = {
  sm: 'w-12 h-12 text-lg',
  md: 'w-16 h-16 text-2xl',
  lg: 'w-20 h-20 text-3xl',
};

export const AchievementBadge = ({ achievement, size = 'md' }: AchievementBadgeProps) => {
  const isUnlocked = achievement.unlocked;

  return (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <div
        className={`
          ${sizeClasses[size]}
          rounded-xl border-2 flex items-center justify-center
          bg-gradient-to-br transition-all duration-300
          ${isUnlocked ? rarityColors[achievement.rarity] : 'from-muted/50 to-muted/20 border-muted/30'}
          ${isUnlocked ? rarityGlow[achievement.rarity] : ''}
          ${!isUnlocked ? 'grayscale opacity-50' : ''}
        `}
      >
        {isUnlocked ? (
          <span className="drop-shadow-lg">{achievement.icon}</span>
        ) : (
          <Lock className="w-1/2 h-1/2 text-muted-foreground/50" />
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 
        bg-card/95 backdrop-blur-sm border border-border rounded-lg
        opacity-0 group-hover:opacity-100 transition-opacity duration-200
        pointer-events-none z-50 w-48 text-center">
        <p className={`font-semibold text-sm ${
          achievement.rarity === 'legendary' ? 'text-yellow-400' :
          achievement.rarity === 'epic' ? 'text-primary' :
          achievement.rarity === 'rare' ? 'text-blue-400' :
          'text-foreground'
        }`}>
          {achievement.name}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
        {isUnlocked && achievement.unlockedAt && (
          <p className="text-xs text-muted-foreground/70 mt-1">
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>
        )}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
          <div className="border-8 border-transparent border-t-card/95" />
        </div>
      </div>
    </motion.div>
  );
};
