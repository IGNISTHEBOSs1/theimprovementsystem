import { motion } from 'framer-motion';
import { Achievement } from '@/hooks/useAchievements';
import { Lock, Sparkles, Crown } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

const rarityColors = {
  common: 'from-slate-400/30 to-slate-500/20 border-slate-400/50',
  uncommon: 'from-green-500/30 to-emerald-500/20 border-green-400/60',
  rare: 'from-blue-500/30 to-cyan-500/20 border-blue-400/60',
  epic: 'from-purple-500/30 to-pink-500/20 border-purple-400/60',
  legendary: 'from-amber-400/40 to-orange-500/20 border-yellow-400/70',
  mythic: 'from-rose-500/40 to-red-600/20 border-rose-400/70',
  godly: 'from-cyan-300/50 via-white/30 to-yellow-300/50 border-cyan-300/80',
};

const rarityGlow = {
  common: '',
  uncommon: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
  rare: 'shadow-[0_0_20px_rgba(59,130,246,0.4)] animate-pulse',
  epic: 'shadow-[0_0_25px_rgba(168,85,247,0.5)]',
  legendary: 'shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-[pulse_2s_ease-in-out_infinite]',
  mythic: 'shadow-[0_0_35px_rgba(244,63,94,0.7)] animate-[pulse_1.5s_ease-in-out_infinite]',
  godly: 'shadow-[0_0_50px_rgba(103,232,249,0.8)] animate-[pulse_1s_ease-in-out_infinite]',
};

const rarityRing = {
  common: '',
  uncommon: 'ring-2 ring-green-400/30',
  rare: 'ring-2 ring-blue-400/30',
  epic: 'ring-2 ring-purple-400/40',
  legendary: 'ring-4 ring-yellow-400/50',
  mythic: 'ring-4 ring-rose-400/60',
  godly: 'ring-4 ring-cyan-300/70',
};

const rarityTextColor = {
  common: 'text-slate-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
  mythic: 'text-rose-400',
  godly: 'text-cyan-300',
};

const sizeClasses = {
  sm: 'w-14 h-14 text-xl',
  md: 'w-18 h-18 text-2xl',
  lg: 'w-24 h-24 text-4xl',
};

export const AchievementBadge = ({ achievement, size = 'md' }: AchievementBadgeProps) => {
  const isUnlocked = achievement.unlocked;
  const isGodly = achievement.rarity === 'godly';
  const isMythic = achievement.rarity === 'mythic';
  const isLegendary = achievement.rarity === 'legendary';

  return (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.1, rotate: (isUnlocked && (isLegendary || isMythic || isGodly)) ? [0, -2, 2, 0] : 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Outer glow for legendary+ */}
      {isUnlocked && isLegendary && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/30 via-amber-500/30 to-orange-400/30 blur-xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      {/* Mythic glow */}
      {isUnlocked && isMythic && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-500/40 via-pink-500/40 to-red-500/40 blur-xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      
      {/* Godly glow - rainbow effect */}
      {isUnlocked && isGodly && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/50 via-white/40 to-yellow-400/50 blur-2xl"
          animate={{ 
            scale: [1, 1.4, 1], 
            opacity: [0.7, 1, 0.7],
            rotate: [0, 360]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
      
      <div
        className={`
          ${sizeClasses[size]}
          rounded-2xl border-2 flex items-center justify-center relative overflow-hidden
          bg-gradient-to-br transition-all duration-300
          ${isUnlocked ? rarityColors[achievement.rarity] : 'from-muted/30 to-muted/10 border-muted/20'}
          ${isUnlocked ? rarityGlow[achievement.rarity] : ''}
          ${isUnlocked ? rarityRing[achievement.rarity] : ''}
          ${!isUnlocked ? 'grayscale opacity-40' : ''}
        `}
      >
        {/* Shimmer effect for epic+ */}
        {isUnlocked && (achievement.rarity === 'epic' || isLegendary || isMythic || isGodly) && (
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r from-transparent ${isGodly ? 'via-cyan-200/40' : isMythic ? 'via-rose-200/30' : 'via-white/20'} to-transparent`}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: isGodly ? 1.5 : 3, repeat: Infinity, repeatDelay: isGodly ? 0.5 : 2 }}
          />
        )}
        
        {isUnlocked ? (
          <span className="drop-shadow-lg relative z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            {achievement.icon}
          </span>
        ) : (
          <Lock className="w-1/3 h-1/3 text-muted-foreground/40" />
        )}
        
        {/* Sparkle for legendary */}
        {isUnlocked && isLegendary && (
          <Sparkles className="absolute top-1 right-1 w-3 h-3 text-yellow-300 animate-pulse" />
        )}
        
        {/* Crown for mythic */}
        {isUnlocked && isMythic && (
          <Crown className="absolute top-0.5 right-0.5 w-3.5 h-3.5 text-rose-300 animate-pulse" />
        )}
        
        {/* Double sparkle for godly */}
        {isUnlocked && isGodly && (
          <>
            <Sparkles className="absolute top-0 left-1 w-3 h-3 text-cyan-200 animate-pulse" />
            <Sparkles className="absolute bottom-1 right-1 w-3 h-3 text-yellow-200 animate-pulse" />
          </>
        )}
      </div>

      {/* Enhanced Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 
        bg-card/95 backdrop-blur-md border border-border rounded-xl
        opacity-0 group-hover:opacity-100 transition-all duration-200 scale-95 group-hover:scale-100
        pointer-events-none z-50 w-52 text-center shadow-xl">
        
        {/* Rarity indicator */}
        <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${rarityTextColor[achievement.rarity]}`}>
          {achievement.rarity}
        </div>
        
        <p className={`font-bold text-sm ${rarityTextColor[achievement.rarity]}`}>
          {achievement.name}
        </p>
        <p className="text-xs text-muted-foreground mt-1.5">{achievement.description}</p>
        {isUnlocked && achievement.unlockedAt && (
          <p className="text-[10px] text-primary/70 mt-2 font-medium">
            ✨ Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>
        )}
        {!isUnlocked && (
          <p className="text-[10px] text-muted-foreground/60 mt-2">🔒 Locked</p>
        )}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
          <div className="border-8 border-transparent border-t-card/95" />
        </div>
      </div>
    </motion.div>
  );
};
