import { useState, useEffect, useCallback } from 'react';
import { getXpForLevel, applyXpDelta } from '@/lib/progression';
import { PlayerStats, inferStatCategory, getStatGainForDifficulty, applyStatGain } from '@/lib/attributes';

// Re-exported for backward compatibility — see @/lib/progression and
// @/lib/attributes for the canonical implementations (TIS-INFRA-003,
// TIS-INFRA-004).
export { getXpForLevel };
export type { PlayerStats };
export { inferStatCategory };

export interface Quest {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Urgent';
  xpReward: number;
  creditReward: number;
  timeFrame: string;
  scheduledFor?: string;
  statCategory?: keyof PlayerStats;
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
  statCategory?: keyof PlayerStats;
  deletionDeniedUntil?: string;
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
  xpMultiplier: number;
  xpMultiplierExpires?: string;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const freshAccountState: GameState = {
  username: 'Hunter',
  level: 1,
  rank: 'E-Rank Hunter',
  currentXp: 0,
  maxXp: getXpForLevel(1),
  credits: 0,
  stats: { FIT: 0, SOC: 0, INT: 0, DIS: 0, FOC: 0, FIN: 0 },
  quests: [
    { id: 'default_1', title: '🏃 Morning Exercise', difficulty: 'Easy', xpReward: 25, creditReward: 5, timeFrame: 'Today', statCategory: 'FIT', completed: false, failed: false, createdAt: new Date().toISOString() },
    { id: 'default_2', title: '📚 Read for 20 minutes', difficulty: 'Easy', xpReward: 20, creditReward: 5, timeFrame: 'Today', statCategory: 'INT', completed: false, failed: false, createdAt: new Date().toISOString() },
    { id: 'default_3', title: '💧 Drink 8 glasses of water', difficulty: 'Normal', xpReward: 15, creditReward: 3, timeFrame: 'Today', statCategory: 'DIS', completed: false, failed: false, createdAt: new Date().toISOString() },
  ],
  habits: [],
  systemMessages: [
    { id: '1', type: 'achievement', message: '🎉 Welcome to The System, Hunter! Your journey begins.', timestamp: new Date() },
  ],
  totalQuestsCompleted: 0,
  lastQuestResetDate: getTodayDateString(),
  xpMultiplier: 1,
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(freshAccountState);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Daily quest reset — checks every minute against real date
  useEffect(() => {
    const checkReset = () => {
      const today = getTodayDateString();
      setGameState(prev => {
        if (prev.lastQuestResetDate === today) return prev;
        // New day — reset quests, update habit arrays for new month if needed
        const todayDate = new Date(today);
        const daysInCurrentMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0).getDate();
        const dayOfMonth = todayDate.getDate(); // 1-based

        return {
          ...prev,
          quests: prev.quests
            .filter(q => !q.scheduledFor || q.scheduledFor <= today)
            .map(q => ({ ...q, completed: false, failed: false })),
          habits: prev.habits.map(h => {
            // If month changed, create fresh array for new month
            const lastDate = prev.lastQuestResetDate ? new Date(prev.lastQuestResetDate) : new Date();
            const monthChanged = lastDate.getMonth() !== todayDate.getMonth() || lastDate.getFullYear() !== todayDate.getFullYear();
            if (monthChanged) {
              return { ...h, completedDays: Array(daysInCurrentMonth).fill(false) };
            }
            // Same month - ensure array is sized to daysInCurrentMonth
            const newDays = Array(daysInCurrentMonth).fill(false);
            h.completedDays.forEach((v, i) => { if (i < daysInCurrentMonth) newDays[i] = v; });
            return { ...h, completedDays: newDays };
          }),
          lastQuestResetDate: today,
        };
      });
    };
    checkReset();
    const interval = setInterval(checkReset, 60000);
    return () => clearInterval(interval);
  }, []);

  // Expire xp multiplier
  useEffect(() => {
    if (gameState.xpMultiplierExpires) {
      const expires = new Date(gameState.xpMultiplierExpires);
      if (new Date() > expires) {
        setGameState(prev => ({ ...prev, xpMultiplier: 1, xpMultiplierExpires: undefined }));
      }
    }
  }, [gameState.xpMultiplierExpires]);

  const addXp = useCallback((amount: number) => {
    setGameState(prev => {
      const multiplied = Math.round(amount * (prev.xpMultiplier || 1));
      const result = applyXpDelta(prev, multiplied);

      if (result.leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 4000);
      }

      return {
        ...prev,
        currentXp: result.currentXp,
        level: result.level,
        maxXp: result.maxXp,
        rank: result.rank,
      };
    });
  }, []);

  const addCredits = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, credits: Math.max(0, prev.credits + amount) }));
  }, []);

  const completeQuest = useCallback((questId: string) => {
    setGameState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest || quest.completed) return prev;

      // Update stat based on quest category
      const cat = quest.statCategory || inferStatCategory(quest.title);
      const newStats = applyStatGain(prev.stats, cat, getStatGainForDifficulty(quest.difficulty));

      const multiplied = Math.round(quest.xpReward * (prev.xpMultiplier || 1));
      const result = applyXpDelta(prev, multiplied);

      if (result.leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 4000);
      }

      return {
        ...prev,
        quests: prev.quests.map(q => q.id === questId ? { ...q, completed: true } : q),
        totalQuestsCompleted: prev.totalQuestsCompleted + 1,
        currentXp: result.currentXp,
        maxXp: result.maxXp,
        level: result.level,
        rank: result.rank,
        credits: prev.credits + quest.creditReward,
        stats: newStats,
      };
    });
  }, []);

  const failQuest = useCallback((questId: string) => {
    setGameState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest) return prev;
      const cat = quest.statCategory || inferStatCategory(quest.title);
      const statLoss = 1;
      const newStats = { ...prev.stats, [cat]: Math.max(0, prev.stats[cat] - statLoss) };
      return {
        ...prev,
        quests: prev.quests.map(q => q.id === questId ? { ...q, failed: true } : q),
        stats: newStats,
      };
    });
  }, []);

  const toggleHabitDay = useCallback((habitId: string, dayIndex: number) => {
    setGameState(prev => {
      const habit = prev.habits.find(h => h.id === habitId);
      if (!habit) return prev;
      const wasCompleted = habit.completedDays[dayIndex];
      const xpChange = wasCompleted ? -habit.winXp : Math.round(habit.winXp * (prev.xpMultiplier || 1));

      // Update stat
      const cat = habit.statCategory || inferStatCategory(habit.name);
      const statChange = wasCompleted ? -1 : 2;
      const newStats = { ...prev.stats, [cat]: Math.min(100, Math.max(0, prev.stats[cat] + statChange)) };

      const result = applyXpDelta(prev, xpChange);
      if (result.leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 4000);
      }

      return {
        ...prev,
        habits: prev.habits.map(h => {
          if (h.id !== habitId) return h;
          const newDays = [...h.completedDays];
          newDays[dayIndex] = !newDays[dayIndex];
          let streak = 0;
          for (let i = newDays.length - 1; i >= 0; i--) {
            if (newDays[i]) streak++;
            else break;
          }
          return { ...h, completedDays: newDays, streak };
        }),
        currentXp: result.currentXp,
        maxXp: result.maxXp,
        level: result.level,
        rank: result.rank,
        stats: newStats,
      };
    });
  }, []);

  const spendCredits = useCallback((amount: number) => {
    setGameState(prev => {
      if (prev.credits < amount) return prev;
      return { ...prev, credits: prev.credits - amount };
    });
  }, []);

  const updateStat = useCallback((stat: keyof PlayerStats, value: number) => {
    setGameState(prev => ({
      ...prev,
      stats: { ...prev.stats, [stat]: Math.min(100, Math.max(0, value)) },
    }));
  }, []);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'streak' | 'completedDays'>) => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    setGameState(prev => ({
      ...prev,
      habits: [...prev.habits, {
        ...habit,
        id: Date.now().toString(),
        streak: 0,
        completedDays: Array(daysInMonth).fill(false),
        statCategory: habit.statCategory || inferStatCategory(habit.name),
      }],
    }));
  }, []);

  const deleteHabit = useCallback((habitId: string) => {
    setGameState(prev => ({ ...prev, habits: prev.habits.filter(h => h.id !== habitId) }));
  }, []);

  const addQuest = useCallback((quest: Omit<Quest, 'id' | 'completed' | 'failed' | 'createdAt'>) => {
    setGameState(prev => ({
      ...prev,
      quests: [...prev.quests, {
        ...quest,
        id: Date.now().toString(),
        completed: false,
        failed: false,
        createdAt: new Date().toISOString(),
        statCategory: quest.statCategory || inferStatCategory(quest.title),
      }],
    }));
  }, []);

  const deleteQuest = useCallback((questId: string) => {
    setGameState(prev => ({ ...prev, quests: prev.quests.filter(q => q.id !== questId) }));
  }, []);

  const addSystemMessage = useCallback((message: Omit<SystemMessage, 'id' | 'timestamp'>) => {
    setGameState(prev => ({
      ...prev,
      systemMessages: [{ ...message, id: Date.now().toString(), timestamp: new Date() }, ...prev.systemMessages.slice(0, 9)],
    }));
  }, []);

  const grantXpMultiplier = useCallback((multiplier: number, durationHours: number) => {
    const expires = new Date();
    expires.setHours(expires.getHours() + durationHours);
    setGameState(prev => ({
      ...prev,
      xpMultiplier: multiplier,
      xpMultiplierExpires: expires.toISOString(),
      systemMessages: [{
        id: Date.now().toString(),
        type: 'boost',
        message: `⚡ ${multiplier}x XP Multiplier active for ${durationHours}h! All gains boosted.`,
        timestamp: new Date(),
      }, ...prev.systemMessages.slice(0, 9)],
    }));
  }, []);

  const isTodayComplete = useCallback(() => {
    const allQuestsComplete = gameState.quests.length > 0 && gameState.quests.every(q => q.completed || q.failed);
    const todayIndex = (gameState.habits[0]?.completedDays.length ?? 30) - 1;
    const allHabitsComplete = gameState.habits.length > 0 && gameState.habits.every(h => h.completedDays[todayIndex]);
    return allQuestsComplete && allHabitsComplete;
  }, [gameState.quests, gameState.habits]);

  const getCurrentStreak = useCallback(() => {
    return Math.max(0, ...gameState.habits.map(h => h.streak));
  }, [gameState.habits]);

  return {
    gameState, setGameState, addXp, addCredits, completeQuest, failQuest,
    toggleHabitDay, spendCredits, updateStat, showLevelUp, addHabit,
    deleteHabit, addQuest, deleteQuest, addSystemMessage, grantXpMultiplier,
    isTodayComplete, getCurrentStreak,
  };
};
