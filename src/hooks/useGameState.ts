import { useState, useEffect, useCallback } from 'react';

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
  xpMultiplier: number;
  xpMultiplierExpires?: string;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// XP required per level — easy early, exponential later
export const getXpForLevel = (level: number): number => {
  if (level <= 5)  return 200 + (level - 1) * 100;     // 200, 300, 400, 500, 600
  if (level <= 10) return 700 + (level - 5) * 150;     // 700→1450
  if (level <= 20) return 1500 + (level - 10) * 300;   // 1500→4500
  if (level <= 35) return 4500 + (level - 20) * 500;   // 4500→12000
  return 12000 + (level - 35) * 1000;                   // 12000+
};

const getRankForLevel = (level: number): string => {
  if (level >= 60) return 'National-Level Hunter';
  if (level >= 50) return 'S-Rank Hunter';
  if (level >= 40) return 'A-Rank Hunter';
  if (level >= 30) return 'B-Rank Hunter';
  if (level >= 20) return 'C-Rank Hunter';
  if (level >= 10) return 'D-Rank Hunter';
  return 'E-Rank Hunter';
};

// Map quest/habit keywords to stat categories
export const inferStatCategory = (title: string): keyof PlayerStats => {
  const t = title.toLowerCase();
  if (/workout|gym|run|exercise|push.?up|squat|yoga|sport|walk|swim|fitness|stretch/.test(t)) return 'FIT';
  if (/read|study|learn|course|book|research|code|write|journal|essay|math|science/.test(t)) return 'INT';
  if (/meditat|focus|pomodoro|deep.?work|distract|concentration|mindful/.test(t)) return 'FOC';
  if (/friend|family|call|social|meet|network|talk|message|reach.?out|community/.test(t)) return 'SOC';
  if (/budget|save|invest|money|finance|expense|income|spend|earn|credit|debt/.test(t)) return 'FIN';
  return 'DIS'; // discipline is the default for everything else
};

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
        // New day — reset quest completion, roll habit days forward
        return {
          ...prev,
          quests: prev.quests
            .filter(q => !q.scheduledFor || q.scheduledFor <= today) // unlock scheduled quests
            .map(q => ({ ...q, completed: false, failed: false })),
          habits: prev.habits.map(h => {
            const newDays = [...h.completedDays];
            newDays.push(false);
            if (newDays.length > 30) newDays.shift();
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
      let newXp = prev.currentXp + multiplied;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      let didLevelUp = false;

      if (newXp < 0) newXp = 0;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel++;
        newMaxXp = getXpForLevel(newLevel);
        didLevelUp = true;
      }

      if (didLevelUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 4000);
      }

      return {
        ...prev,
        currentXp: newXp,
        level: newLevel,
        maxXp: newMaxXp,
        rank: getRankForLevel(newLevel),
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
      const statGain = quest.difficulty === 'Easy' ? 1 : quest.difficulty === 'Normal' ? 2 : quest.difficulty === 'Hard' ? 3 : 4;
      const newStats = { ...prev.stats, [cat]: Math.min(100, prev.stats[cat] + statGain) };

      const multiplied = Math.round(quest.xpReward * (prev.xpMultiplier || 1));
      let newXp = prev.currentXp + multiplied;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      let didLevelUp = false;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel++;
        newMaxXp = getXpForLevel(newLevel);
        didLevelUp = true;
      }

      if (didLevelUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 4000);
      }

      return {
        ...prev,
        quests: prev.quests.map(q => q.id === questId ? { ...q, completed: true } : q),
        totalQuestsCompleted: prev.totalQuestsCompleted + 1,
        currentXp: newXp,
        maxXp: newMaxXp,
        level: newLevel,
        rank: getRankForLevel(newLevel),
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

      let newXp = prev.currentXp + xpChange;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      let didLevelUp = false;

      if (newXp < 0) newXp = 0;
      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel++;
        newMaxXp = getXpForLevel(newLevel);
        didLevelUp = true;
      }
      if (didLevelUp) {
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
        currentXp: newXp,
        maxXp: newMaxXp,
        level: newLevel,
        rank: getRankForLevel(newLevel),
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
    setGameState(prev => ({
      ...prev,
      habits: [...prev.habits, {
        ...habit,
        id: Date.now().toString(),
        streak: 0,
        completedDays: Array(30).fill(false),
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
    const todayIndex = gameState.habits[0]?.completedDays.length - 1 ?? 29;
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
