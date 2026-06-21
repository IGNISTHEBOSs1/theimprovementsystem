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
  // Telemetry: how many sessions awarded XP today vs were capped.
  // Resets with todaySessions each midnight.
  todayXpSessions: number;   // sessions that actually granted player XP today
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
  /** How many more sessions will earn player XP today. 0 = cap reached. */
  xpSessionsRemaining: number;
  /** True when today's XP-earning sessions have been exhausted. */
  isXpCapped: boolean;
}

const PomodoroContext = createContext<PomodoroContextType | null>(null);

const STATS_STORAGE_KEY = 'pomodoro-stats';

/**
 * Maximum number of completed sessions that award player XP per calendar day.
 * Sessions beyond this cap still count toward totalSessions and todaySessions
 * (stats, achievements, display) but do NOT call onComplete (which triggers addXp).
 *
 * Set to 5 based on the economy audit: 5 × 50 XP = 250 XP/day from Pomodoro.
 * Beyond 5 sessions (2+ hrs of focused work) the player is either in flow or exploiting.
 * Attribute XP and credits are NOT affected by this cap — only player level XP.
 *
 * Beta note: expose todayXpSessions in UI so players can see their cap usage.
 */
const DAILY_XP_SESSION_CAP = 5;

const getDefaultStats = (): PomodoroStats => ({
  totalSessions: 0,
  totalMinutes: 0,
  todaySessions: 0,
  todayMinutes: 0,
  lastSessionDate: '',
  todayXpSessions: 0,
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
            todayXpSessions: 0,
            lastSessionDate: getTodayDateString(),
          };
        }
        // Backfill todayXpSessions if loading from older localStorage (migration)
        return { ...parsed, todayXpSessions: parsed.todayXpSessions ?? 0 };
      } catch {
        return getDefaultStats();
      }
    }
    return getDefaultStats();
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
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
            // Session completed — always increment session counts for stats/achievements.
            // Only fire onComplete (which triggers addXp) when under the daily XP cap.
            setStats(prevStats => {
              const isNewDay = prevStats.lastSessionDate !== getTodayDateString();
              const todaySessions  = isNewDay ? 1 : prevStats.todaySessions + 1;
              const todayXpSessions = isNewDay ? 0 : prevStats.todayXpSessions;
              const willEarnXp = todayXpSessions < DAILY_XP_SESSION_CAP;

              // Fire XP callback only when under cap.
              // Deferred via setTimeout(0) to avoid React state update during render.
              if (willEarnXp) {
                setTimeout(() => onCompleteRef.current?.(), 0);
              }

              return {
                ...prevStats,
                totalSessions: prevStats.totalSessions + 1,
                todaySessions,
                totalMinutes: prevStats.totalMinutes + Math.floor(prev.totalTime / 60),
                todayMinutes: (isNewDay ? 0 : prevStats.todayMinutes) + Math.floor(prev.totalTime / 60),
                todayXpSessions: isNewDay ? (willEarnXp ? 1 : 0) : prevStats.todayXpSessions + (willEarnXp ? 1 : 0),
                lastSessionDate: getTodayDateString(),
              };
            });
            sessionStartTimeRef.current = null;
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

  const xpSessionsRemaining = Math.max(0, DAILY_XP_SESSION_CAP - (stats.todayXpSessions ?? 0));
  const isXpCapped = xpSessionsRemaining === 0;

  return (
    <PomodoroContext.Provider value={{ state, stats, toggleTimer, resetTimer, setTime, addTime, formatTime, progress, xpSessionsRemaining, isXpCapped }}>
      {children}
    </PomodoroContext.Provider>
  );
};
