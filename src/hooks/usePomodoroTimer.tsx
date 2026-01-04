import { useState, useEffect, useRef, useCallback, createContext, useContext, ReactNode } from 'react';

interface PomodoroState {
  timeLeft: number;
  isRunning: boolean;
  totalTime: number;
}

interface PomodoroContextType {
  state: PomodoroState;
  toggleTimer: () => void;
  resetTimer: () => void;
  setTime: (seconds: number) => void;
  formatTime: (seconds: number) => string;
  progress: number;
}

const PomodoroContext = createContext<PomodoroContextType | null>(null);

export const usePomodoroTimer = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoroTimer must be used within PomodoroProvider');
  }
  return context;
};

interface PomodoroProviderProps {
  children: ReactNode;
  onComplete?: () => void;
}

export const PomodoroProvider = ({ children, onComplete }: PomodoroProviderProps) => {
  const [state, setState] = useState<PomodoroState>(() => {
    const saved = localStorage.getItem('pomodoro-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          timeLeft: parsed.timeLeft ?? 50 * 60,
          isRunning: false, // Always start paused on reload
          totalTime: parsed.totalTime ?? 50 * 60
        };
      } catch {
        return { timeLeft: 50 * 60, isRunning: false, totalTime: 50 * 60 };
      }
    }
    return { timeLeft: 50 * 60, isRunning: false, totalTime: 50 * 60 };
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-state', JSON.stringify(state));
  }, [state]);

  // Timer logic
  useEffect(() => {
    if (state.isRunning && state.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 1) {
            onCompleteRef.current?.();
            return { ...prev, timeLeft: 0, isRunning: false };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning]);

  const toggleTimer = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  const resetTimer = useCallback(() => {
    setState(prev => ({ ...prev, timeLeft: prev.totalTime, isRunning: false }));
  }, []);

  const setTime = useCallback((seconds: number) => {
    setState({ timeLeft: seconds, isRunning: false, totalTime: seconds });
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const progress = ((state.totalTime - state.timeLeft) / state.totalTime) * 100;

  return (
    <PomodoroContext.Provider value={{ state, toggleTimer, resetTimer, setTime, formatTime, progress }}>
      {children}
    </PomodoroContext.Provider>
  );
};
