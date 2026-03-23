import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, Plus } from 'lucide-react';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const PomodoroTimerFull = () => {
  const { state, toggleTimer, resetTimer, setTime, addTime, formatTime, progress } = usePomodoroTimer();

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-6 border border-secondary/30"
      style={{ boxShadow: '0 0 0 1px hsl(var(--secondary)/0.15), 0 0 24px hsl(var(--secondary)/0.15)' }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Timer className="w-5 h-5 text-secondary" />
        <h3 className="font-display font-bold text-lg text-foreground">Focus Timer</h3>
        <span className="text-caption text-muted-foreground font-jp ml-1">ポモドーロ</span>
      </div>

      <div className="flex flex-col items-center">
        {/* Circular timer ring */}
        <div className="relative w-52 h-52 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <defs>
              <filter id="timer-glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--secondary))" />
                <stop offset="100%" stopColor="hsl(var(--primary))" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            {/* Progress */}
            <motion.circle
              cx="100" cy="100" r="90" fill="none"
              stroke="url(#timerGradient)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              filter="url(#timer-glow)"
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)/0.7))' }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn(
              'font-display font-bold text-5xl md:text-6xl transition-colors leading-none',
              state.isRunning ? 'text-secondary' : 'text-foreground'
            )}>
              {formatTime(state.timeLeft)}
            </span>
            <span className="text-caption text-muted-foreground mt-2">
              {state.isRunning ? 'FOCUS MODE' : 'READY'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
            onClick={resetTimer} disabled={state.isRunning}
            className={cn(
              'w-12 h-12 rounded-xl border flex-center transition-all touch-target',
              state.isRunning
                ? 'opacity-40 cursor-not-allowed bg-muted border-transparent'
                : 'bg-white/5 border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10'
            )}
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>

          {/* Main play/pause — neon style */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className={cn(
              'w-16 h-16 rounded-2xl flex-center transition-all font-bold',
              state.isRunning
                ? 'bg-gradient-to-br from-destructive to-red-600 shadow-[0_0_20px_hsl(var(--destructive)/0.5)]'
                : 'bg-gradient-to-br from-secondary to-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]'
            )}
            aria-label={state.isRunning ? 'Pause timer' : 'Start timer'}
          >
            {state.isRunning ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-1" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
            onClick={() => addTime(25 * 60)} disabled={state.isRunning}
            className={cn(
              'w-12 h-12 rounded-xl border flex-center transition-all touch-target',
              state.isRunning
                ? 'opacity-40 cursor-not-allowed bg-muted border-transparent'
                : 'bg-white/5 border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10'
            )}
            aria-label="Add 25 minutes"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Quick presets */}
        <div className="flex gap-2 mt-4">
          {[15, 25, 50].map((mins) => (
            <motion.button
              key={mins}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setTime(mins * 60)} disabled={state.isRunning}
              className={cn(
                'px-3 py-1.5 rounded-lg text-caption font-display font-bold transition-all',
                state.isRunning
                  ? 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground'
                  : state.totalTime === mins * 60
                    ? 'bg-secondary/20 text-secondary border border-secondary/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              )}
            >
              {mins}m
            </motion.button>
          ))}
        </div>

        <p className="mt-4 text-caption text-muted-foreground">
          Complete for <span className="text-primary font-display font-bold">+50 XP</span>
        </p>
      </div>
    </motion.div>
  );
};
