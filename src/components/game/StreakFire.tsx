import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakFireProps {
  isActive: boolean;
  streakCount: number;
}

export const StreakFire = ({ isActive, streakCount }: StreakFireProps) => {
  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30"
      >
        <motion.div
          animate={{
            y: [0, -3, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative"
        >
          <Flame className="w-6 h-6 text-orange-500" />
          {/* Fire glow effect */}
          <motion.div
            className="absolute inset-0 blur-md"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
            }}
          >
            <Flame className="w-6 h-6 text-orange-500" />
          </motion.div>
        </motion.div>
        
        <div className="flex flex-col">
          <span className="text-label text-orange-400/70">Today's Streak</span>
          <span className="font-display font-bold text-sm text-orange-400">
            {streakCount}d 🔥
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
