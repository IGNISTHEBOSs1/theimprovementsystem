import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PomodoroTimerProps {
  onComplete?: () => void;
}

export const PomodoroTimer = ({ onComplete }: PomodoroTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(50 * 60); // 50 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime] = useState(50 * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onComplete]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(50 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
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
              isRunning ? "text-secondary" : "text-foreground"
            )}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-muted-foreground mt-2">
              {isRunning ? 'Focus Mode' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTimer}
            className="w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
              isRunning
                ? "bg-destructive text-destructive-foreground glow-primary"
                : "bg-secondary text-secondary-foreground glow-secondary"
            )}
          >
            {isRunning ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTimeLeft(25 * 60)}
            className="w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80 transition-colors text-sm font-display font-bold"
          >
            25m
          </motion.button>
        </div>

        {/* XP Reward info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Complete for <span className="text-primary font-display font-bold">+50 XP</span>
        </div>
      </div>
    </motion.div>
  );
};
