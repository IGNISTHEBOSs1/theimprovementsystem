import { useState, useEffect, useCallback } from 'react';

export interface Quest {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Urgent';
  xpReward: number;
  creditReward: number;
  timeFrame: string;
  completed: boolean;
  failed: boolean;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  winXp: number;
  loseXp: number;
  streak: number;
  completedDays: boolean[];
  deletionDeniedUntil?: string;
}

export interface PlayerStats {
  FIT: number;
  SOC: number;
  INT: number;
  DIS: number;
  FOC: number;
  FIN: number;
}

export interface SystemMessage {
  id: string;
  type: 'streak' | 'boost' | 'warning' | 'achievement';
  message: string;
  timestamp: Date;
}

export interface GameState {
  username: string;
  level: number;
  rank: string;
  currentXp: number;
  maxXp: number;
  credits: number;
  stats: PlayerStats;
  quests: Quest[];
  habits: Habit[];
  systemMessages: SystemMessage[];
  totalQuestsCompleted: number;
  lastQuestResetDate: string;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// Fresh account state for new users
const freshAccountState: GameState = {
  username: 'Hunter',
  level: 1,
  rank: 'E-Rank Hunter',
  currentXp: 0,
  maxXp: 1000,
  credits: 100,
  stats: {
    FIT: 50,
    SOC: 50,
    INT: 50,
    DIS: 50,
    FOC: 50,
    FIN: 50,
  },
  quests: [],
  habits: [],
  systemMessages: [
    { id: '1', type: 'achievement', message: '🎉 Welcome to The System, Hunter!', timestamp: new Date() },
  ],
  totalQuestsCompleted: 0,
  lastQuestResetDate: getTodayDateString(),
};

const STORAGE_KEY = 'the-system-game-state';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check if quests need to be reset (new day)
        const today = getTodayDateString();
        if (parsed.lastQuestResetDate !== today) {
          // Reset quest completion status for new day
          return {
            ...freshAccountState,
            ...parsed,
            quests: parsed.quests?.map((q: Quest) => ({ ...q, completed: false, failed: false })) || [],
            lastQuestResetDate: today,
          };
        }
        return { ...freshAccountState, ...parsed };
      } catch {
        return freshAccountState;
      }
    }
    return freshAccountState;
  });

  const [showLevelUp, setShowLevelUp] = useState(false);

  // Check for daily reset
  useEffect(() => {
    const today = getTodayDateString();
    if (gameState.lastQuestResetDate !== today) {
      setGameState(prev => ({
        ...prev,
        quests: prev.quests.map(q => ({ ...q, completed: false, failed: false })),
        lastQuestResetDate: today,
      }));
    }
  }, [gameState.lastQuestResetDate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const addXp = useCallback((amount: number) => {
    setGameState(prev => {
      let newXp = prev.currentXp + amount;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;

      // Handle negative XP
      if (newXp < 0) {
        newXp = 0;
      }

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel++;
        newMaxXp = Math.floor(newMaxXp * 1.2);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }

      // Update rank based on level
      let newRank = prev.rank;
      if (newLevel >= 50) newRank = 'S-Rank Hunter';
      else if (newLevel >= 40) newRank = 'A-Rank Hunter';
      else if (newLevel >= 30) newRank = 'B-Rank Hunter';
      else if (newLevel >= 20) newRank = 'C-Rank Hunter';
      else if (newLevel >= 10) newRank = 'D-Rank Hunter';
      else newRank = 'E-Rank Hunter';

      return {
        ...prev,
        currentXp: newXp,
        level: newLevel,
        maxXp: newMaxXp,
        rank: newRank,
      };
    });
  }, []);

  const addCredits = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      credits: Math.max(0, prev.credits + amount),
    }));
  }, []);

  const completeQuest = useCallback((questId: string) => {
    setGameState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest || quest.completed) return prev;

      return {
        ...prev,
        quests: prev.quests.map(q =>
          q.id === questId ? { ...q, completed: true } : q
        ),
        totalQuestsCompleted: prev.totalQuestsCompleted + 1,
      };
    });

    const quest = gameState.quests.find(q => q.id === questId);
    if (quest) {
      addXp(quest.xpReward);
      addCredits(quest.creditReward);
    }
  }, [gameState.quests, addXp, addCredits]);

  const failQuest = useCallback((questId: string) => {
    setGameState(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.id === questId ? { ...q, failed: true } : q
      ),
    }));
  }, []);

  const toggleHabitDay = useCallback((habitId: string, dayIndex: number) => {
    setGameState(prev => {
      const habit = prev.habits.find(h => h.id === habitId);
      if (!habit) return prev;

      const wasCompleted = habit.completedDays[dayIndex];
      const xpChange = wasCompleted ? -habit.winXp : habit.winXp;

      return {
        ...prev,
        habits: prev.habits.map(h => {
          if (h.id === habitId) {
            const newCompletedDays = [...h.completedDays];
            newCompletedDays[dayIndex] = !newCompletedDays[dayIndex];
            
            // Calculate streak
            let streak = 0;
            for (let i = newCompletedDays.length - 1; i >= 0; i--) {
              if (newCompletedDays[i]) streak++;
              else break;
            }
            
            return { ...h, completedDays: newCompletedDays, streak };
          }
          return h;
        }),
        currentXp: Math.max(0, prev.currentXp + xpChange),
      };
    });
  }, []);

  const spendCredits = useCallback((amount: number) => {
    setGameState(prev => {
      if (prev.credits < amount) return prev;
      return {
        ...prev,
        credits: prev.credits - amount,
      };
    });
  }, []);

  const updateStat = useCallback((stat: keyof PlayerStats, value: number) => {
    setGameState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: Math.min(100, Math.max(0, value)),
      },
    }));
  }, []);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'streak' | 'completedDays'>) => {
    setGameState(prev => ({
      ...prev,
      habits: [
        ...prev.habits,
        {
          ...habit,
          id: Date.now().toString(),
          streak: 0,
          completedDays: Array(30).fill(false),
        },
      ],
    }));
  }, []);

  const deleteHabit = useCallback((habitId: string) => {
    setGameState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== habitId),
    }));
  }, []);

  const addQuest = useCallback((quest: Omit<Quest, 'id' | 'completed' | 'failed' | 'createdAt'>) => {
    setGameState(prev => ({
      ...prev,
      quests: [
        ...prev.quests,
        {
          ...quest,
          id: Date.now().toString(),
          completed: false,
          failed: false,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  }, []);

  const deleteQuest = useCallback((questId: string) => {
    setGameState(prev => ({
      ...prev,
      quests: prev.quests.filter(q => q.id !== questId),
    }));
  }, []);

  const addSystemMessage = useCallback((message: Omit<SystemMessage, 'id' | 'timestamp'>) => {
    setGameState(prev => ({
      ...prev,
      systemMessages: [
        { ...message, id: Date.now().toString(), timestamp: new Date() },
        ...prev.systemMessages.slice(0, 9),
      ],
    }));
  }, []);

  // Calculate if all today's tasks and habits are complete (for streak fire)
  const isTodayComplete = useCallback(() => {
    const allQuestsComplete = gameState.quests.length > 0 && 
      gameState.quests.every(q => q.completed || q.failed);
    const todayIndex = gameState.habits[0]?.completedDays.length - 1 || 29;
    const allHabitsComplete = gameState.habits.length > 0 &&
      gameState.habits.every(h => h.completedDays[todayIndex]);
    return allQuestsComplete && allHabitsComplete;
  }, [gameState.quests, gameState.habits]);

  // Get current streak (consecutive days with all tasks complete)
  const getCurrentStreak = useCallback(() => {
    // Simplified: just return the longest habit streak
    return Math.max(0, ...gameState.habits.map(h => h.streak));
  }, [gameState.habits]);

  return {
    gameState,
    setGameState,
    addXp,
    addCredits,
    completeQuest,
    failQuest,
    toggleHabitDay,
    spendCredits,
    updateStat,
    showLevelUp,
    addHabit,
    deleteHabit,
    addQuest,
    deleteQuest,
    addSystemMessage,
    isTodayComplete,
    getCurrentStreak,
  };
};
