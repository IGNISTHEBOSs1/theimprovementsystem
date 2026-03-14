import { useState, useEffect, useRef, useCallback, createContext, useContext, ReactNode } from 'react';

interface PomodoroState {
  timeLeft: number;
  isRunning: boolean;
  totalTime: number;
}

interface PomodoroStats {
  totalSessions: number;
  totalMinutes: number;
  todaySessions: number;
  todayMinutes: number;
  lastSessionDate: string;
}

interface PomodoroContextType {
  state: PomodoroState;
  stats: PomodoroStats;
  toggleTimer: () => void;
  resetTimer: () => void;
  setTime: (seconds: number) => void;
  addTime: (seconds: number) => void;
  formatTime: (seconds: number) => string;
  progress: number;
}

const PomodoroContext = createContext<PomodoroContextType | null>(null);

const STATS_STORAGE_KEY = 'pomodoro-stats';

const getDefaultStats = (): PomodoroStats => ({
  totalSessions: 0,
  totalMinutes: 0,
  todaySessions: 0,
  todayMinutes: 0,
  lastSessionDate: '',
});

const getTodayDateString = () => new Date().toISOString().split('T')[0];

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
          timeLeft: parsed.timeLeft ?? 25 * 60,
          isRunning: false,
          totalTime: parsed.totalTime ?? 25 * 60
        };
      } catch {
        return { timeLeft: 25 * 60, isRunning: false, totalTime: 25 * 60 };
      }
    }
    return { timeLeft: 25 * 60, isRunning: false, totalTime: 25 * 60 };
  });

  const [stats, setStats] = useState<PomodoroStats>(() => {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Reset today's stats if it's a new day
        if (parsed.lastSessionDate !== getTodayDateString()) {
          return {
            ...parsed,
            todaySessions: 0,
            todayMinutes: 0,
            lastSessionDate: getTodayDateString(),
          };
        }
        return parsed;
      } catch {
        return getDefaultStats();
      }
    }
    return getDefaultStats();
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  const sessionStartTimeRef = useRef<number | null>(null);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-state', JSON.stringify(state));
  }, [state]);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  // Track session start
  useEffect(() => {
    if (state.isRunning && sessionStartTimeRef.current === null) {
      sessionStartTimeRef.current = state.totalTime - state.timeLeft;
    } else if (!state.isRunning && sessionStartTimeRef.current !== null) {
      // Session paused or ended, calculate time spent
      const timeSpent = (state.totalTime - state.timeLeft) - sessionStartTimeRef.current;
      if (timeSpent > 0) {
        const minutesSpent = Math.floor(timeSpent / 60);
        if (minutesSpent > 0) {
          setStats(prev => ({
            ...prev,
            totalMinutes: prev.totalMinutes + minutesSpent,
            todayMinutes: prev.todayMinutes + minutesSpent,
            lastSessionDate: getTodayDateString(),
          }));
        }
      }
      sessionStartTimeRef.current = null;
    }
  }, [state.isRunning]);

  // Timer logic
  useEffect(() => {
    if (state.isRunning && state.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 1) {
            // Session completed
            setStats(prevStats => ({
              ...prevStats,
              totalSessions: prevStats.totalSessions + 1,
              todaySessions: prevStats.todaySessions + 1,
              totalMinutes: prevStats.totalMinutes + Math.floor(prev.totalTime / 60),
              todayMinutes: prevStats.todayMinutes + Math.floor(prev.totalTime / 60),
              lastSessionDate: getTodayDateString(),
            }));
            sessionStartTimeRef.current = null;
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
    setState(prev => ({ ...prev, timeLeft: 0, isRunning: false }));
    sessionStartTimeRef.current = null;
  }, []);

  const setTime = useCallback((seconds: number) => {
    setState({ timeLeft: seconds, isRunning: false, totalTime: seconds });
    sessionStartTimeRef.current = null;
  }, []);

  const addTime = useCallback((seconds: number) => {
    setState(prev => {
      if (prev.isRunning) return prev; // Don't add time while running
      const newTime = prev.timeLeft + seconds;
      return { ...prev, timeLeft: newTime, totalTime: newTime };
    });
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const progress = state.totalTime > 0 
    ? ((state.totalTime - state.timeLeft) / state.totalTime) * 100 
    : 0;

  return (
    <PomodoroContext.Provider value={{ state, stats, toggleTimer, resetTimer, setTime, addTime, formatTime, progress }}>
      {children}
    </PomodoroContext.Provider>
  );
};
