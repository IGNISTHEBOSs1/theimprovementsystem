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
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  winXp: number;
  loseXp: number;
  streak: number;
  completedDays: boolean[];
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
}

const defaultState: GameState = {
  username: 'Adam',
  level: 11,
  rank: 'C-Rank Hunter',
  currentXp: 790,
  maxXp: 1500,
  credits: 245,
  stats: {
    FIT: 72,
    SOC: 45,
    INT: 88,
    DIS: 65,
    FOC: 78,
    FIN: 52,
  },
  quests: [
    { id: '1', title: 'Complete morning routine', difficulty: 'Easy', xpReward: 25, creditReward: 5, timeFrame: '6:00 - 8:00 AM', completed: false, failed: false },
    { id: '2', title: 'Deep work session (2h)', difficulty: 'Normal', xpReward: 75, creditReward: 15, timeFrame: '9:00 - 11:00 AM', completed: false, failed: false },
    { id: '3', title: 'Study new skill', difficulty: 'Normal', xpReward: 50, creditReward: 10, timeFrame: '2:00 - 3:30 PM', completed: true, failed: false },
    { id: '4', title: 'Workout session', difficulty: 'Hard', xpReward: 100, creditReward: 20, timeFrame: '5:00 - 6:30 PM', completed: false, failed: false },
    { id: '5', title: 'Read 30 pages', difficulty: 'Easy', xpReward: 30, creditReward: 5, timeFrame: 'Evening', completed: false, failed: false },
  ],
  habits: [
    { id: '1', name: 'Touch Grass', icon: '🌿', winXp: 15, loseXp: 10, streak: 7, completedDays: [true, true, true, false, true, true, true, true, false, true, true, true, true, true, false, true, true, true, true, true, true, false, true, true, true, true, true, true, false, true] },
    { id: '2', name: 'Workout', icon: '💪', winXp: 25, loseXp: 20, streak: 12, completedDays: [true, true, true, true, true, true, false, true, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, true, true, true, true, true, true] },
    { id: '3', name: 'Cold Shower', icon: '🧊', winXp: 20, loseXp: 15, streak: 5, completedDays: [false, true, true, false, true, true, true, false, false, true, true, true, true, false, true, true, true, false, true, true, true, true, true, false, true, true, true, true, true, true] },
    { id: '4', name: 'No Social Media', icon: '📵', winXp: 30, loseXp: 25, streak: 3, completedDays: [true, false, true, false, true, false, true, true, false, true, false, true, true, false, true, true, false, true, true, true, false, true, true, false, true, true, true, false, true, true] },
  ],
  systemMessages: [
    { id: '1', type: 'streak', message: '🔥 7-day streak on Touch Grass!', timestamp: new Date() },
    { id: '2', type: 'boost', message: '⚡ System Gift: 1.2x XP boost active', timestamp: new Date() },
    { id: '3', type: 'warning', message: '⚠️ 2 quests incomplete today', timestamp: new Date() },
  ],
  totalQuestsCompleted: 847,
};

const STORAGE_KEY = 'the-system-game-state';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultState, ...parsed };
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });

  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const addXp = useCallback((amount: number) => {
    setGameState(prev => {
      let newXp = prev.currentXp + amount;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;

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
      credits: prev.credits + amount,
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
    setGameState(prev => ({
      ...prev,
      habits: prev.habits.map(h => {
        if (h.id === habitId) {
          const newCompletedDays = [...h.completedDays];
          newCompletedDays[dayIndex] = !newCompletedDays[dayIndex];
          return { ...h, completedDays: newCompletedDays };
        }
        return h;
      }),
    }));
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
  };
};
