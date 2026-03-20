import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, Plus } from 'lucide-react';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';
import { cn } from '@/lib/utils';

export const PomodoroTimerFull = () => {
  const { state, toggleTimer, resetTimer, setTime, addTime, formatTime, progress } = usePomodoroTimer();
  
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-6 border-glow-secondary"
    >
      <div className="flex items-center gap-2 mb-6">
        <Timer className="w-5 h-5 text-secondary" />
        <h3 className="font-display text-lg font-bold text-foreground">Focus Timer</h3>
        <span className="text-sm text-muted-foreground font-jp">ポモドーロ</span>
      </div>

      <div className="flex flex-col items-center">
        {/* Circular Progress */}
        <div className="relative w-52 h-52 mb-6">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Glow effect */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Track */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            
            {/* Progress */}
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              filter="url(#glow)"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--secondary))" />
                <stop offset="100%" stopColor="hsl(var(--primary))" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn(
              "font-display text-5xl font-bold transition-colors",
              state.isRunning ? "text-secondary" : "text-foreground"
            )}>
              {formatTime(state.timeLeft)}
            </span>
            <span className="text-sm text-muted-foreground mt-2">
              {state.isRunning ? 'Focus Mode' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Reset to zero button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTimer}
            disabled={state.isRunning}
            className={cn(
              "w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center transition-colors",
              state.isRunning ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/80"
            )}
            title="Reset to zero"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>

          {/* Play/Pause button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
              state.isRunning
                ? "bg-destructive text-destructive-foreground glow-primary"
                : "bg-secondary text-secondary-foreground glow-secondary"
            )}
          >
            {state.isRunning ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
            )}
          </motion.button>

          {/* Add 25 minutes button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addTime(25 * 60)}
            disabled={state.isRunning}
            className={cn(
              "w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center transition-colors",
              state.isRunning ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/80"
            )}
            title="Add 25 minutes"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Quick time presets */}
        <div className="flex gap-2 mt-4">
          {[15, 25, 50].map((mins) => (
            <motion.button
              key={mins}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTime(mins * 60)}
              disabled={state.isRunning}
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-display font-bold transition-colors",
                state.isRunning
                  ? "bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed"
                  : state.totalTime === mins * 60
                    ? "bg-secondary/20 text-secondary border border-secondary/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {mins}m
            </motion.button>
          ))}
        </div>

        {/* XP Reward info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Complete for <span className="text-primary font-display font-bold">+50 XP</span>
        </div>
      </div>
    </motion.div>
  );
};
