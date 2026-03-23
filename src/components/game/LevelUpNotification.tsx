import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Sparkles } from 'lucide-react';

interface LevelUpNotificationProps {
  show: boolean;
  level: number;
}

const PARTICLE_COUNT = 12;

export const LevelUpNotification = ({ show, level }: LevelUpNotificationProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex-center pointer-events-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Particles burst */}
          <div className="absolute inset-0 flex-center pointer-events-none">
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
              const angle = (i / PARTICLE_COUNT) * 360;
              const distance = 120 + Math.random() * 80;
              const tx = Math.cos((angle * Math.PI) / 180) * distance;
              const ty = Math.sin((angle * Math.PI) / 180) * distance;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], x: tx, y: ty }}
                  transition={{ duration: 1.2, delay: i * 0.04, ease: 'easeOut' }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: i % 3 === 0 ? 'hsl(var(--primary))' : i % 3 === 1 ? 'hsl(var(--accent))' : 'hsl(var(--secondary))',
                  }}
                />
              );
            })}
          </div>

          {/* Main card */}
          <motion.div
            initial={{ scale: 0.5, rotateZ: -8, y: 40 }}
            animate={{ scale: 1, rotateZ: 0, y: 0 }}
            exit={{ scale: 0.8, rotateZ: 8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative glass-strong rounded-3xl p-8 md:p-12 border-2 border-accent/60 text-center max-w-sm w-full mx-4"
            style={{ boxShadow: '0 0 60px hsl(var(--accent)/0.4), var(--shadow-elevated)' }}
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
              />
            </div>

            <div className="relative z-10">
              {/* Stars */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <Star className="w-6 h-6 text-accent" />
                <span className="font-display font-black text-xl text-accent tracking-widest">LEVEL UP</span>
                <Star className="w-6 h-6 text-accent" />
              </div>

              {/* Big level number */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-display-xl text-gradient-gold mb-4 leading-none"
              >
                {level}
              </motion.div>

              <p className="font-jp text-label text-muted-foreground mb-5 tracking-widest">レベルアップ</p>

              {/* Stats unlocked */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-5 text-body-sm text-muted-foreground"
              >
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Stats Increased</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Skills Unlocked</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
