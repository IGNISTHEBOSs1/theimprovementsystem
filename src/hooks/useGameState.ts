import { useState, useEffect, useCallback } from 'react';
import { Difficulty, getDifficultyRewards, migrateDifficulty } from '@/lib/difficulty';
import {
  AttributeStat,
  applyStatXp,
  removeStatXp,
  normaliseStatValue,
  zeroStat,
} from '@/lib/attributeXp';

// Re-export so consumers can import from one place
export type { Difficulty };
export type { AttributeStat };

export interface Quest {
  id: string;
  title: string;
  difficulty: Difficulty;
  xpReward: number;       // derived from getDifficultyRewards() — stored for display
  creditReward: number;   // derived from getDifficultyRewards() — stored for display
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
  difficulty: Difficulty; // replaces winXp/loseXp — rewards derived at runtime
  streak: number;
  completedDays: boolean[];
  statCategory?: keyof PlayerStats;
  deletionDeniedUntil?: string;
}

export interface PlayerStats {
  FIT: AttributeStat;
  SOC: AttributeStat;
  INT: AttributeStat;
  DIS: AttributeStat;
  FOC: AttributeStat;
  FIN: AttributeStat;
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
  /**
   * Permanent additive XP bonus from unlocked Shadow Army passives.
   * Iron:    +0.05 (5%)
   * Antares: +0.25 (25%)
   * Accumulated additively. Applied as: effectiveXp = raw × xpMultiplier × (1 + permanentXpBonus)
   * Default: 0 (no permanent bonus).
   */
  permanentXpBonus: number;
  /**
   * ISO date string (YYYY-MM-DD) of the last day Bellion's 2× boost was activated.
   * Guards against activating Bellion multiple times per day and retroactive exploits.
   * Empty string = never activated.
   */
  bellionLastUsed: string;
  /**
   * Telemetry — player XP earned today (player level XP only).
   * Does NOT include attribute XP or credits.
   * Resets to 0 at midnight alongside lastQuestResetDate.
   * Used for future fatigue system and beta analytics.
   */
  dailyXpEarned: number;
  dailyXpResetDate: string;
  /**
   * Exploit protection — manually added quests today.
   * Hard cap: DAILY_QUEST_ADD_LIMIT per day. Prevents quest spam.
   * AI auto-generated quests bypass this via the skipDailyLimit flag.
   * Resets at midnight.
   */
  dailyQuestsAdded: number;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

/**
 * Applies all active XP multipliers to a raw XP amount.
 *
 * Formula: Math.round(rawXp × timedMultiplier × (1 + permanentBonus))
 *
 * - timedMultiplier:  xpMultiplier from GameState (1× by default, 2× when Bellion is active)
 * - permanentBonus:   permanentXpBonus from GameState (additive: Iron 0.05, Antares 0.25)
 *
 * Stacking examples:
 *   Iron only:              1 × 1.05 = 1.05×
 *   Antares only:           1 × 1.25 = 1.25×
 *   Iron + Antares:         1 × 1.30 = 1.30×
 *   Bellion only:           2 × 1.00 = 2.00×
 *   Bellion + Iron:         2 × 1.05 = 2.10×
 *   Bellion + Iron + Antares: 2 × 1.30 = 2.60×
 *
 * Pure function — no state access, safe to call anywhere.
 */
export function applyXpMultipliers(
  rawXp: number,
  timedMultiplier: number,
  permanentBonus: number,
): number {
  if (rawXp <= 0) return 0;
  return Math.round(rawXp * timedMultiplier * (1 + permanentBonus));
}

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

// Map quest/habit title to stat category — keyword-based heuristic.
// This is ONLY used for stat routing, not for XP calculation.
// XP is now always derived from getDifficultyRewards(difficulty).
export const inferStatCategory = (title: string): keyof PlayerStats => {
  const t = title.toLowerCase();
  if (/workout|gym|run|exercise|push.?up|squat|yoga|sport|walk|swim|fitness|stretch/.test(t)) return 'FIT';
  if (/read|study|learn|course|book|research|code|write|journal|essay|math|science/.test(t)) return 'INT';
  if (/meditat|focus|pomodoro|deep.?work|distract|concentration|mindful/.test(t)) return 'FOC';
  if (/friend|family|call|social|meet|network|talk|message|reach.?out|community/.test(t)) return 'SOC';
  if (/budget|save|invest|money|finance|expense|income|spend|earn|credit|debt/.test(t)) return 'FIN';
  return 'DIS';
};

/**
 * Maximum quests a player can manually add per calendar day.
 * AI auto-generated quests (useAutoGenerateTasks) are exempt.
 * Set to 10 — covers all legitimate use cases (planning a full day)
 * while blocking the spam exploit (adding 100 trivial quests).
 * Adjust based on beta telemetry from dailyQuestsAdded.
 */
const DAILY_QUEST_ADD_LIMIT = 10;

export const freshAccountState: GameState = {
  username: 'Hunter',
  level: 1,
  rank: 'E-Rank Hunter',
  currentXp: 0,
  maxXp: getXpForLevel(1),
  credits: 0,
  stats: {
    FIT: zeroStat(),
    SOC: zeroStat(),
    INT: zeroStat(),
    DIS: zeroStat(),
    FOC: zeroStat(),
    FIN: zeroStat(),
  },
  quests: [
    { id: 'default_1', title: '🏃 Morning Exercise',        difficulty: 'Easy'     as Difficulty, xpReward: getDifficultyRewards('Easy').xp,     creditReward: getDifficultyRewards('Easy').credits,     timeFrame: 'Today', statCategory: 'FIT', completed: false, failed: false, createdAt: new Date().toISOString() },
    { id: 'default_2', title: '📚 Read for 20 minutes',     difficulty: 'Easy'     as Difficulty, xpReward: getDifficultyRewards('Easy').xp,     creditReward: getDifficultyRewards('Easy').credits,     timeFrame: 'Today', statCategory: 'INT', completed: false, failed: false, createdAt: new Date().toISOString() },
    { id: 'default_3', title: '💧 Drink 8 glasses of water',difficulty: 'Trivial'  as Difficulty, xpReward: getDifficultyRewards('Trivial').xp,  creditReward: getDifficultyRewards('Trivial').credits,  timeFrame: 'Today', statCategory: 'DIS', completed: false, failed: false, createdAt: new Date().toISOString() },
  ],
  habits: [],
  systemMessages: [
    { id: '1', type: 'achievement', message: '🎉 Welcome to The System, Hunter! Your journey begins.', timestamp: new Date() },
  ],
  totalQuestsCompleted: 0,
  lastQuestResetDate: getTodayDateString(),
  xpMultiplier: 1,
  permanentXpBonus: 0,
  bellionLastUsed: '',
  dailyXpEarned: 0,
  dailyXpResetDate: getTodayDateString(),
  dailyQuestsAdded: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// Migration
// Runs once on load (both from localStorage via useState initializer and from
// cloud via useCloudSync). Always safe to call — passes valid data unchanged.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Migrates a raw GameState (possibly loaded from old localStorage or Supabase)
 * to the current schema. Returns a corrected copy — never mutates the input.
 *
 * Rules applied:
 *   Quest difficulty 'Normal'  → 'Moderate'
 *   Quest difficulty 'Urgent'  → 'Elite'
 *   Quest difficulty missing / unknown → 'Moderate'
 *   Habit difficulty missing / unknown → 'Moderate'
 *   Stat plain number (e.g. FIT: 12) → { level: 12, xp: 0 }
 *   Stat missing / null               → { level: 1, xp: 0 }
 *   Stat already { level, xp }        → validated and passed through
 */
export function migrateGameState(raw: GameState): GameState {
  // ── Quests ──────────────────────────────────────────────────────────────────
  const migratedQuests = raw.quests.map(q => {
    const difficulty = migrateDifficulty(q.difficulty);
    const rewards    = getDifficultyRewards(difficulty);
    return {
      ...q,
      difficulty,
      xpReward:     rewards.xp,
      creditReward: rewards.credits,
    };
  });

  // ── Habits ──────────────────────────────────────────────────────────────────
  const migratedHabits = raw.habits.map(h => ({
    ...h,
    difficulty: migrateDifficulty((h as any).difficulty),
  }));

  // ── Stats ───────────────────────────────────────────────────────────────────
  // normaliseStatValue handles legacy numbers (FIT: 12 → {level:12, xp:0}),
  // already-valid AttributeStat objects, and missing/null values.
  const rawStats = ((raw.stats ?? {}) as Record<string, unknown>);
  const migratedStats: PlayerStats = {
    FIT: normaliseStatValue(rawStats.FIT),
    SOC: normaliseStatValue(rawStats.SOC),
    INT: normaliseStatValue(rawStats.INT),
    DIS: normaliseStatValue(rawStats.DIS),
    FOC: normaliseStatValue(rawStats.FOC),
    FIN: normaliseStatValue(rawStats.FIN),
  };

  return {
    ...raw,
    quests: migratedQuests,
    habits: migratedHabits,
    stats: migratedStats,
    // Telemetry fields — safe defaults for any existing user loading new code
    dailyXpEarned:    (raw as any).dailyXpEarned    ?? 0,
    dailyXpResetDate: (raw as any).dailyXpResetDate ?? getTodayDateString(),
    dailyQuestsAdded: (raw as any).dailyQuestsAdded ?? 0,
    // Shadow Army economy fields — zero defaults for all existing users
    permanentXpBonus: typeof (raw as any).permanentXpBonus === 'number'
      ? (raw as any).permanentXpBonus
      : 0,
    bellionLastUsed:  (raw as any).bellionLastUsed ?? '',
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export const useGameState = () => {
  // Apply migration on first render — handles stale localStorage data
  const [gameState, setGameState] = useState<GameState>(() =>
    migrateGameState(freshAccountState)
  );
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
          // Reset daily telemetry counters — new day, fresh slate
          dailyXpEarned:    0,
          dailyXpResetDate: today,
          dailyQuestsAdded: 0,
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
      const multiplied = applyXpMultipliers(
        amount,
        prev.xpMultiplier || 1,
        prev.permanentXpBonus || 0,
      );
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

      // Telemetry — accumulate player XP earned today for analytics and future fatigue
      const today = getTodayDateString();
      const dailyXpEarned = prev.dailyXpResetDate === today
        ? prev.dailyXpEarned + multiplied
        : multiplied; // new day — reset counter
      const dailyXpResetDate = today;

      return {
        ...prev,
        currentXp: newXp,
        level: newLevel,
        maxXp: newMaxXp,
        rank: getRankForLevel(newLevel),
        dailyXpEarned,
        dailyXpResetDate,
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

      // Derive rewards from difficulty tier — never use stored xpReward directly
      const cat     = quest.statCategory || inferStatCategory(quest.title);
      const rewards = getDifficultyRewards(quest.difficulty);

      // Apply attribute XP via the progression engine (handles multi-level-ups)
      const newStats = {
        ...prev.stats,
        [cat]: applyStatXp(prev.stats[cat], rewards.statXp),
      };

      // Player XP (main level) — applies xpMultiplier, attribute XP does not
      const multiplied = applyXpMultipliers(
        rewards.xp,
        prev.xpMultiplier || 1,
        prev.permanentXpBonus || 0,
      );
      let newXp    = prev.currentXp + multiplied;
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

      // Telemetry — accumulate daily player XP
      const today = getTodayDateString();
      const dailyXpEarned = prev.dailyXpResetDate === today
        ? prev.dailyXpEarned + multiplied
        : multiplied;

      return {
        ...prev,
        quests: prev.quests.map(q => q.id === questId ? { ...q, completed: true } : q),
        totalQuestsCompleted: prev.totalQuestsCompleted + 1,
        currentXp: newXp,
        maxXp:     newMaxXp,
        level:     newLevel,
        rank:      getRankForLevel(newLevel),
        credits:   prev.credits + rewards.credits,
        stats:     newStats,
        dailyXpEarned,
        dailyXpResetDate: today,
      };
    });
  }, []);

  const failQuest = useCallback((questId: string) => {
    setGameState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest) return prev;

      const cat     = quest.statCategory || inferStatCategory(quest.title);
      const rewards = getDifficultyRewards(quest.difficulty);

      // Penalty: lose a portion of the difficulty's loseXp as stat XP.
      // Never causes a level regression — xp floor is 0 within current level.
      const newStats = {
        ...prev.stats,
        [cat]: removeStatXp(prev.stats[cat], rewards.loseXp),
      };

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
      const rewards = getDifficultyRewards(habit.difficulty);

      // Player XP change (main level) — completion gains, un-completion loses
      const xpChange = wasCompleted
        ? -rewards.loseXp
        : applyXpMultipliers(rewards.xp, prev.xpMultiplier || 1, prev.permanentXpBonus || 0);

      // Attribute XP — uses progression engine; never regresses levels
      const cat      = habit.statCategory || inferStatCategory(habit.name);
      const newStats = wasCompleted
        ? { ...prev.stats, [cat]: removeStatXp(prev.stats[cat], rewards.loseXp) }
        : { ...prev.stats, [cat]: applyStatXp(prev.stats[cat], rewards.statXp) };

      // Main level XP update
      let newXp    = prev.currentXp + xpChange;
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

      // Telemetry — only accumulate on gain path (not on un-check removal)
      const today = getTodayDateString();
      const xpGained = wasCompleted ? 0 : Math.max(0, xpChange);
      const dailyXpEarned = prev.dailyXpResetDate === today
        ? prev.dailyXpEarned + xpGained
        : xpGained;

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
        maxXp:     newMaxXp,
        level:     newLevel,
        rank:      getRankForLevel(newLevel),
        stats:     newStats,
        dailyXpEarned,
        dailyXpResetDate: today,
      };
    });
  }, []);

  const spendCredits = useCallback((amount: number) => {
    setGameState(prev => {
      if (prev.credits < amount) return prev;
      return { ...prev, credits: prev.credits - amount };
    });
  }, []);

  // updateStat removed — stats are now AttributeStat objects driven by
  // applyStatXp() / removeStatXp() only. Direct number assignment is no longer valid.

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
        // Default to Moderate if difficulty somehow missing (backwards compat)
        difficulty: habit.difficulty ?? 'Moderate',
        statCategory: habit.statCategory || inferStatCategory(habit.name),
      }],
    }));
  }, []);

  const deleteHabit = useCallback((habitId: string) => {
    setGameState(prev => ({ ...prev, habits: prev.habits.filter(h => h.id !== habitId) }));
  }, []);

  const addQuest = useCallback((
    quest: Omit<Quest, 'id' | 'completed' | 'failed' | 'createdAt'>,
    options?: {
      /**
       * When true, bypasses the daily quest creation cap.
       * Set by useAutoGenerateTasks — AI-generated quests are pre-validated
       * and should not count against the player's manual limit.
       */
      skipDailyLimit?: boolean;
    }
  ) => {
    const rewards = getDifficultyRewards(quest.difficulty);
    const today = getTodayDateString();

    setGameState(prev => {
      // Enforce daily quest creation limit for manually added quests
      if (!options?.skipDailyLimit) {
        const currentCount = prev.dailyXpResetDate === today
          ? prev.dailyQuestsAdded
          : 0; // new day — counter reset
        if (currentCount >= DAILY_QUEST_ADD_LIMIT) {
          // Silently return — caller (UI) should check canAddQuest before calling
          return prev;
        }
      }

      const dailyQuestsAdded = options?.skipDailyLimit
        ? prev.dailyQuestsAdded // AI quests don't increment the counter
        : (prev.dailyXpResetDate === today ? prev.dailyQuestsAdded + 1 : 1);

      return {
        ...prev,
        quests: [...prev.quests, {
          ...quest,
          id: Date.now().toString(),
          xpReward: rewards.xp,
          creditReward: rewards.credits,
          completed: false,
          failed: false,
          createdAt: new Date().toISOString(),
          statCategory: quest.statCategory || inferStatCategory(quest.title),
        }],
        dailyQuestsAdded,
        dailyXpResetDate: today,
      };
    });
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

  /**
   * Adds a permanent additive XP bonus from a Shadow Army passive.
   * Iron:    call with 0.05
   * Antares: call with 0.25
   * Multiple passives accumulate additively: Iron + Antares = 0.30 (30% permanent boost).
   * The bonus stacks multiplicatively with timed boosts (Bellion):
   *   effectiveXp = raw × timedMultiplier × (1 + permanentXpBonus)
   */
  const addPermanentXpBonus = useCallback((bonus: number) => {
    setGameState(prev => ({
      ...prev,
      permanentXpBonus: Math.round((prev.permanentXpBonus + bonus) * 1000) / 1000,
      systemMessages: [{
        id: Date.now().toString(),
        type: 'boost',
        message: `🌟 Permanent XP bonus +${Math.round(bonus * 100)}% activated! Total permanent boost: ${Math.round((prev.permanentXpBonus + bonus) * 100)}%`,
        timestamp: new Date(),
      }, ...prev.systemMessages.slice(0, 9)],
    }));
  }, []);

  /**
   * Activates Bellion's 2× XP boost for 1 hour.
   *
   * Guards:
   *   1. Once per calendar day — bellionLastUsed must not equal today's date.
   *   2. Only applies to XP earned AFTER activation, never retroactively.
   *
   * Returns true if activated, false if already used today.
   */
  const activateBellion = useCallback((): boolean => {
    const today = getTodayDateString();
    let activated = false;

    setGameState(prev => {
      if (prev.bellionLastUsed === today) {
        // Already used today — no-op, activated stays false
        return prev;
      }
      activated = true;
      const expires = new Date();
      expires.setHours(expires.getHours() + 1);
      return {
        ...prev,
        xpMultiplier: 2,
        xpMultiplierExpires: expires.toISOString(),
        bellionLastUsed: today,
        systemMessages: [{
          id: Date.now().toString(),
          type: 'boost',
          message: `⚡ BELLION ACTIVATED — 2× XP for the next hour! Expires at ${expires.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          timestamp: new Date(),
        }, ...prev.systemMessages.slice(0, 9)],
      };
    });

    return activated;
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

  // Derived telemetry values — consumed by UI to show rate-limit feedback
  const today = getTodayDateString();
  const dailyQuestsUsed = gameState.dailyXpResetDate === today
    ? gameState.dailyQuestsAdded
    : 0;
  const canAddQuest = dailyQuestsUsed < DAILY_QUEST_ADD_LIMIT;
  const dailyQuestsRemaining = Math.max(0, DAILY_QUEST_ADD_LIMIT - dailyQuestsUsed);

  return {
    gameState, setGameState, addXp, addCredits, completeQuest, failQuest,
    toggleHabitDay, spendCredits, showLevelUp, addHabit,
    deleteHabit, addQuest, deleteQuest, addSystemMessage, grantXpMultiplier,
    isTodayComplete, getCurrentStreak,
    // Exploit protection / telemetry
    canAddQuest, dailyQuestsRemaining,
    dailyXpEarned: gameState.dailyXpEarned,
    addPermanentXpBonus, activateBellion,
  };
};
