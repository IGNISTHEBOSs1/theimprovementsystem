import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Timer, X, Move } from 'lucide-react';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';
import { cn } from '@/lib/utils';

interface PomodoroMiniPlayerProps {
  isVisible: boolean;
  onClose: () => void;
  onExpand: () => void;
}

type Corner = 'top-left' | 'top-right' | 'bottom-left';

const CORNER_STORAGE_KEY = 'pomodoro-corner';

const cornerClasses: Record<Corner, string> = {
  'top-left':    'top-6 left-6',
  'top-right':   'top-6 right-6',
  'bottom-left': 'bottom-6 left-6',
};

const nextCorner: Record<Corner, Corner> = {
  'top-left':    'top-right',
  'top-right':   'bottom-left',
  'bottom-left': 'top-left',
};

const cornerLabels: Record<Corner, string> = {
  'top-left':    'Top Left',
  'top-right':   'Top Right',
  'bottom-left': 'Bottom Left',
};

export const PomodoroMiniPlayer = ({ isVisible, onClose, onExpand }: PomodoroMiniPlayerProps) => {
  const { state, toggleTimer, formatTime, progress } = usePomodoroTimer();
  const [corner, setCorner] = useState<Corner>(() => {
    return (localStorage.getItem(CORNER_STORAGE_KEY) as Corner) || 'bottom-left';
  });
  const [showMoveHint, setShowMoveHint] = useState(false);

  const cycleCorner = () => {
    const next = nextCorner[corner];
    setCorner(next);
    localStorage.setItem(CORNER_STORAGE_KEY, next);
    setShowMoveHint(true);
    setTimeout(() => setShowMoveHint(false), 1500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={corner}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={cn('fixed z-50', cornerClasses[corner])}
        >
          <div className="glass-strong rounded-2xl p-4 border border-secondary/30 glow-secondary flex items-center gap-3 min-w-[200px] relative">

            {/* Move hint toast */}
            <AnimatePresence>
              {showMoveHint && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: -40 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 top-0 bg-background/90 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-muted-foreground whitespace-nowrap pointer-events-none z-10"
                >
                  Moved to {cornerLabels[corner]}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress circle */}
            <div className="relative w-12 h-12 cursor-pointer flex-shrink-0" onClick={onExpand}>
              <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle
                  cx="24" cy="24" r="20" fill="none"
                  stroke="hsl(var(--secondary))" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 * (1 - progress / 100)}
                  className="transition-all duration-500"
                />
              </svg>
              <Timer className="w-5 h-5 text-secondary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Time display */}
            <div className="flex-1 cursor-pointer min-w-0" onClick={onExpand}>
              <p className={cn('font-display text-xl font-bold leading-none', state.isRunning ? 'text-secondary' : 'text-foreground')}>
                {formatTime(state.timeLeft)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{state.isRunning ? 'Focus Mode' : 'Paused'}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Move button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={cycleCorner}
                title="Move timer"
                className="w-8 h-8 rounded-lg bg-muted/40 text-muted-foreground flex items-center justify-center hover:bg-muted hover:text-foreground transition-colors"
              >
                <Move className="w-3.5 h-3.5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={toggleTimer}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                  state.isRunning ? 'bg-destructive/80 text-destructive-foreground' : 'bg-secondary text-secondary-foreground'
                )}
              >
                {state.isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-muted/50 text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
