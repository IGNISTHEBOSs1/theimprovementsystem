import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Zap } from 'lucide-react';

interface LevelUpNotificationProps {
  show: boolean;
  level: number;
}

export const LevelUpNotification = ({ show, level }: LevelUpNotificationProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.5, rotateZ: -10 }}
            animate={{ scale: 1, rotateZ: 0 }}
            exit={{ scale: 0.5, rotateZ: 10 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative glass-strong rounded-3xl p-8 border-2 border-accent/50 glow-accent"
          >
            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: [0, (Math.random() - 0.5) * 200],
                  y: [0, (Math.random() - 0.5) * 200],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="absolute top-1/2 left-1/2 text-accent"
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
            ))}

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="flex items-center justify-center gap-2 mb-4"
              >
                <Star className="w-8 h-8 text-accent" />
                <h2 className="font-display text-2xl font-bold text-accent">LEVEL UP!</h2>
                <Star className="w-8 h-8 text-accent" />
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mb-6"
              >
                <div className="text-8xl font-display font-black text-gradient-gold">
                  {level}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-4 text-muted-foreground"
              >
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Stats Increased</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>New Skills Unlocked</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
