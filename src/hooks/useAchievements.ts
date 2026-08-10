import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { PlayerStats } from '@/lib/attributes';

// Structural subset of GameState containing only the fields achievement
// conditions read. A full GameState (used by the dead useGameState.ts path)
// satisfies this interface unchanged, so no condition logic below changed.
// This exists so the canonical live state (useDashboardData's DashboardState,
// which has no habits array) can also be evaluated without needing every
// GameState field. See TIS-INFRA-005.
export interface AchievementEvalState {
  level: number;
  totalQuestsCompleted: number;
  credits: number;
  currentXp: number;
  stats: PlayerStats;
  habits: { streak: number }[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'quests' | 'habits' | 'level' | 'credits' | 'special' | 'pomodoro' | 'social' | 'streak';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'godly';
  unlocked: boolean;
  unlockedAt?: Date;
  condition: (state: AchievementEvalState) => boolean;
}

export const achievementDefinitions: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // ===== GODLY (2) =====
  { id: 'true_monarch', name: 'True Monarch', description: 'Reach level 100 - You have become absolute', icon: '👑', category: 'level', rarity: 'godly', condition: (s) => s.level >= 100 },
  { id: 'eternal_flame', name: 'Eternal Flame', description: 'Maintain a 365-day streak', icon: '🌟', category: 'streak', rarity: 'godly', condition: (s) => s.habits.some(h => h.streak >= 365) },

  // ===== MYTHIC (8) =====
  { id: 'shadow_sovereign', name: 'Shadow Sovereign', description: 'Reach level 75 - Shadows bow before you', icon: '🌑', category: 'level', rarity: 'mythic', condition: (s) => s.level >= 75 },
  { id: 'quest_emperor', name: 'Quest Emperor', description: 'Complete 1000 quests', icon: '⚔️', category: 'quests', rarity: 'mythic', condition: (s) => s.totalQuestsCompleted >= 1000 },
  { id: 'habit_immortal', name: 'Habit Immortal', description: 'Maintain a 200-day streak', icon: '♾️', category: 'streak', rarity: 'mythic', condition: (s) => s.habits.some(h => h.streak >= 200) },
  { id: 'wealth_dragon', name: 'Wealth Dragon', description: 'Accumulate 10000 credits', icon: '🐲', category: 'credits', rarity: 'mythic', condition: (s) => s.credits >= 10000 },
  { id: 'perfect_being', name: 'Perfect Being', description: 'All stats at 100', icon: '✨', category: 'special', rarity: 'mythic', condition: (s) => Object.values(s.stats).every(v => v >= 100) },
  { id: 'habit_master', name: 'Habit Master', description: 'Have 10 active habits', icon: '🎭', category: 'habits', rarity: 'mythic', condition: (s) => s.habits.length >= 10 },
  { id: 'quest_machine', name: 'Quest Machine', description: 'Complete 50 quests in one week', icon: '🤖', category: 'quests', rarity: 'mythic', condition: (s) => s.totalQuestsCompleted >= 50 },
  { id: 'credit_mogul', name: 'Credit Mogul', description: 'Spend 5000 credits total', icon: '💎', category: 'credits', rarity: 'mythic', condition: (s) => s.totalQuestsCompleted >= 100 },

  // ===== LEGENDARY (15) =====
  { id: 'awakening', name: 'The Awakening', description: 'You have been chosen by The System', icon: '👁️', category: 'special', rarity: 'legendary', condition: () => true },
  { id: 'level_50', name: 'Shadow Monarch', description: 'Reach level 50 - You command shadows', icon: '🌑', category: 'level', rarity: 'legendary', condition: (s) => s.level >= 50 },
  { id: 'quest_500', name: 'Quest Monarch', description: 'Complete 500 quests', icon: '👑', category: 'quests', rarity: 'legendary', condition: (s) => s.totalQuestsCompleted >= 500 },
  { id: 'habit_streak_100', name: 'Unbreakable Will', description: 'Maintain a 100-day habit streak', icon: '🔥', category: 'streak', rarity: 'legendary', condition: (s) => s.habits.some(h => h.streak >= 100) },
  { id: 'credits_5000', name: 'Dragon Hoard', description: 'Accumulate 5000 credits', icon: '🐉', category: 'credits', rarity: 'legendary', condition: (s) => s.credits >= 5000 },
  { id: 'stat_max', name: 'Transcendence', description: 'Max out any stat to 100', icon: '✨', category: 'special', rarity: 'legendary', condition: (s) => Object.values(s.stats).some(v => v >= 100) },
  { id: 'all_stats_80', name: 'Elite Hunter', description: 'All stats above 80', icon: '🦅', category: 'special', rarity: 'legendary', condition: (s) => Object.values(s.stats).every(v => v >= 80) },
  { id: 'habit_7_active', name: 'Lifestyle Architect', description: 'Have 7 active habits', icon: '🏗️', category: 'habits', rarity: 'legendary', condition: (s) => s.habits.length >= 7 },
  { id: 'streak_60', name: 'Iron Fortress', description: 'Maintain a 60-day streak', icon: '🏰', category: 'streak', rarity: 'legendary', condition: (s) => s.habits.some(h => h.streak >= 60) },
  { id: 'quest_marathon', name: 'Quest Marathon', description: 'Complete 30 quests in one day', icon: '🏃', category: 'quests', rarity: 'legendary', condition: (s) => s.totalQuestsCompleted >= 30 },
  { id: 'level_40', name: 'Rising Power', description: 'Reach level 40', icon: '⚡', category: 'level', rarity: 'legendary', condition: (s) => s.level >= 40 },
  { id: 'credits_3000', name: 'Treasure King', description: 'Accumulate 3000 credits', icon: '💰', category: 'credits', rarity: 'legendary', condition: (s) => s.credits >= 3000 },
  { id: 'dedication_master', name: 'Dedication Master', description: 'Log in 100 consecutive days', icon: '📅', category: 'special', rarity: 'legendary', condition: (s) => s.totalQuestsCompleted >= 100 },
  { id: 'habit_perfectionist', name: 'Perfectionist', description: 'Complete all habits for 30 days straight', icon: '💯', category: 'habits', rarity: 'legendary', condition: (s) => s.habits.some(h => h.streak >= 30) },
  { id: 'power_surge', name: 'Power Surge', description: 'Gain 1000 XP in a single day', icon: '🌊', category: 'special', rarity: 'legendary', condition: (s) => s.currentXp >= 500 },

  // ===== EPIC (20) =====
  { id: 'level_25', name: 'The Chosen', description: 'Reach level 25 - Power flows through you', icon: '🔥', category: 'level', rarity: 'epic', condition: (s) => s.level >= 25 },
  { id: 'quest_100', name: 'Quest Slayer', description: 'Complete 100 quests', icon: '🗡️', category: 'quests', rarity: 'epic', condition: (s) => s.totalQuestsCompleted >= 100 },
  { id: 'habit_streak_30', name: 'Unbreakable', description: 'Maintain a 30-day habit streak', icon: '⛓️', category: 'streak', rarity: 'epic', condition: (s) => s.habits.some(h => h.streak >= 30) },
  { id: 'stat_80', name: 'Specialist', description: 'Reach 80 in any stat', icon: '📊', category: 'special', rarity: 'epic', condition: (s) => Object.values(s.stats).some(v => v >= 80) },
  { id: 'stat_all_60', name: 'Balanced Warrior', description: 'All stats above 60', icon: '⚖️', category: 'special', rarity: 'epic', condition: (s) => Object.values(s.stats).every(v => v >= 60) },
  { id: 'credits_2000', name: 'Wealthy Hunter', description: 'Accumulate 2000 credits', icon: '💎', category: 'credits', rarity: 'epic', condition: (s) => s.credits >= 2000 },
  { id: 'level_20', name: 'Ascending', description: 'Reach level 20', icon: '🌙', category: 'level', rarity: 'epic', condition: (s) => s.level >= 20 },
  { id: 'quest_75', name: 'Quest Veteran', description: 'Complete 75 quests', icon: '🎖️', category: 'quests', rarity: 'epic', condition: (s) => s.totalQuestsCompleted >= 75 },
  { id: 'habit_5_active', name: 'Multi-Habit Master', description: 'Have 5 active habits', icon: '🎯', category: 'habits', rarity: 'epic', condition: (s) => s.habits.length >= 5 },
  { id: 'streak_45', name: 'Consistency King', description: 'Maintain a 45-day streak', icon: '👑', category: 'streak', rarity: 'epic', condition: (s) => s.habits.some(h => h.streak >= 45) },
  { id: 'fitness_focus', name: 'Fitness Focused', description: 'Reach 70 in Fitness stat', icon: '💪', category: 'special', rarity: 'epic', condition: (s) => s.stats.FIT >= 70 },
  { id: 'intellect_peak', name: 'Intellect Peak', description: 'Reach 70 in Intelligence stat', icon: '🧠', category: 'special', rarity: 'epic', condition: (s) => s.stats.INT >= 70 },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Reach 70 in Social stat', icon: '🦋', category: 'special', rarity: 'epic', condition: (s) => s.stats.SOC >= 70 },
  { id: 'discipline_iron', name: 'Iron Discipline', description: 'Reach 70 in Discipline stat', icon: '🔒', category: 'special', rarity: 'epic', condition: (s) => s.stats.DIS >= 70 },
  { id: 'focus_laser', name: 'Laser Focus', description: 'Reach 70 in Focus stat', icon: '🎯', category: 'special', rarity: 'epic', condition: (s) => s.stats.FOC >= 70 },
  { id: 'finance_guru', name: 'Finance Guru', description: 'Reach 70 in Finance stat', icon: '📈', category: 'special', rarity: 'epic', condition: (s) => s.stats.FIN >= 70 },
  { id: 'credits_1500', name: 'Gold Collector', description: 'Accumulate 1500 credits', icon: '🥇', category: 'credits', rarity: 'epic', condition: (s) => s.credits >= 1500 },
  { id: 'quest_sprint', name: 'Quest Sprint', description: 'Complete 10 quests in one day', icon: '⚡', category: 'quests', rarity: 'epic', condition: (s) => s.totalQuestsCompleted >= 10 },
  { id: 'early_riser', name: 'Early Riser', description: 'Complete a task before 7 AM', icon: '🌅', category: 'special', rarity: 'epic', condition: (s) => s.totalQuestsCompleted >= 5 },
  { id: 'night_owl', name: 'Night Owl', description: 'Complete a task after 11 PM', icon: '🦉', category: 'special', rarity: 'epic', condition: (s) => s.totalQuestsCompleted >= 5 },

  // ===== RARE (25) =====
  { id: 'level_10', name: 'Risen', description: 'Reach level 10 - You are no longer weak', icon: '⚡', category: 'level', rarity: 'rare', condition: (s) => s.level >= 10 },
  { id: 'quest_25', name: 'Quest Hunter', description: 'Complete 25 quests', icon: '⚔️', category: 'quests', rarity: 'rare', condition: (s) => s.totalQuestsCompleted >= 25 },
  { id: 'habit_streak_7', name: 'Week Warrior', description: 'Maintain a 7-day habit streak', icon: '🔗', category: 'streak', rarity: 'rare', condition: (s) => s.habits.some(h => h.streak >= 7) },
  { id: 'credits_500', name: 'Treasure Seeker', description: 'Accumulate 500 credits', icon: '💰', category: 'credits', rarity: 'rare', condition: (s) => s.credits >= 500 },
  { id: 'level_15', name: 'Growing Strong', description: 'Reach level 15', icon: '🌱', category: 'level', rarity: 'rare', condition: (s) => s.level >= 15 },
  { id: 'quest_50', name: 'Quest Warrior', description: 'Complete 50 quests', icon: '⚔️', category: 'quests', rarity: 'rare', condition: (s) => s.totalQuestsCompleted >= 50 },
  { id: 'habit_3_active', name: 'Triple Threat', description: 'Have 3 active habits', icon: '🔱', category: 'habits', rarity: 'rare', condition: (s) => s.habits.length >= 3 },
  { id: 'streak_14', name: 'Two Week Champion', description: 'Maintain a 14-day streak', icon: '🏆', category: 'streak', rarity: 'rare', condition: (s) => s.habits.some(h => h.streak >= 14) },
  { id: 'streak_21', name: 'Three Week Master', description: 'Maintain a 21-day streak', icon: '🎖️', category: 'streak', rarity: 'rare', condition: (s) => s.habits.some(h => h.streak >= 21) },
  { id: 'stat_60', name: 'Skilled', description: 'Reach 60 in any stat', icon: '📊', category: 'special', rarity: 'rare', condition: (s) => Object.values(s.stats).some(v => v >= 60) },
  { id: 'stat_all_50', name: 'Well Rounded', description: 'All stats above 50', icon: '⭐', category: 'special', rarity: 'rare', condition: (s) => Object.values(s.stats).every(v => v >= 50) },
  { id: 'credits_750', name: 'Money Maker', description: 'Accumulate 750 credits', icon: '💵', category: 'credits', rarity: 'rare', condition: (s) => s.credits >= 750 },
  { id: 'credits_1000', name: 'Thousand Club', description: 'Accumulate 1000 credits', icon: '💴', category: 'credits', rarity: 'rare', condition: (s) => s.credits >= 1000 },
  { id: 'quest_variety', name: 'Quest Variety', description: 'Complete all difficulty types', icon: '🎲', category: 'quests', rarity: 'rare', condition: (s) => s.totalQuestsCompleted >= 20 },
  { id: 'habit_consistent', name: 'Consistent', description: 'Complete habits 5 days in a row', icon: '📆', category: 'habits', rarity: 'rare', condition: (s) => s.habits.some(h => h.streak >= 5) },
  { id: 'level_8', name: 'Leveling Up', description: 'Reach level 8', icon: '📈', category: 'level', rarity: 'rare', condition: (s) => s.level >= 8 },
  { id: 'quest_40', name: 'Quest Apprentice', description: 'Complete 40 quests', icon: '📜', category: 'quests', rarity: 'rare', condition: (s) => s.totalQuestsCompleted >= 40 },
  { id: 'fitness_boost', name: 'Fitness Boost', description: 'Reach 55 in Fitness', icon: '🏋️', category: 'special', rarity: 'rare', condition: (s) => s.stats.FIT >= 55 },
  { id: 'mind_sharp', name: 'Sharp Mind', description: 'Reach 55 in Intelligence', icon: '💡', category: 'special', rarity: 'rare', condition: (s) => s.stats.INT >= 55 },
  { id: 'social_skills', name: 'Social Skills', description: 'Reach 55 in Social', icon: '🤝', category: 'special', rarity: 'rare', condition: (s) => s.stats.SOC >= 55 },
  { id: 'self_control', name: 'Self Control', description: 'Reach 55 in Discipline', icon: '🧘', category: 'special', rarity: 'rare', condition: (s) => s.stats.DIS >= 55 },
  { id: 'concentration', name: 'Concentration', description: 'Reach 55 in Focus', icon: '🔍', category: 'special', rarity: 'rare', condition: (s) => s.stats.FOC >= 55 },
  { id: 'money_sense', name: 'Money Sense', description: 'Reach 55 in Finance', icon: '💹', category: 'special', rarity: 'rare', condition: (s) => s.stats.FIN >= 55 },
  { id: 'weekend_warrior', name: 'Weekend Warrior', description: 'Complete quests on weekends', icon: '🗓️', category: 'quests', rarity: 'rare', condition: (s) => s.totalQuestsCompleted >= 15 },
  { id: 'habit_duo', name: 'Dynamic Duo', description: 'Have 2 habits with 7+ day streaks', icon: '👥', category: 'habits', rarity: 'rare', condition: (s) => s.habits.filter(h => h.streak >= 7).length >= 2 },

  // ===== UNCOMMON (20) =====
  { id: 'level_5', name: 'Awakened', description: 'Reach level 5', icon: '🌟', category: 'level', rarity: 'uncommon', condition: (s) => s.level >= 5 },
  { id: 'quest_10', name: 'Quest Initiate', description: 'Complete 10 quests', icon: '📋', category: 'quests', rarity: 'uncommon', condition: (s) => s.totalQuestsCompleted >= 10 },
  { id: 'habit_streak_3', name: 'Three Day Rule', description: 'Maintain a 3-day habit streak', icon: '🔥', category: 'streak', rarity: 'uncommon', condition: (s) => s.habits.some(h => h.streak >= 3) },
  { id: 'credits_200', name: 'Coin Collector', description: 'Accumulate 200 credits', icon: '🪙', category: 'credits', rarity: 'uncommon', condition: (s) => s.credits >= 200 },
  { id: 'credits_300', name: 'Savings Starter', description: 'Accumulate 300 credits', icon: '💳', category: 'credits', rarity: 'uncommon', condition: (s) => s.credits >= 300 },
  { id: 'level_3', name: 'Getting Started', description: 'Reach level 3', icon: '🚀', category: 'level', rarity: 'uncommon', condition: (s) => s.level >= 3 },
  { id: 'level_7', name: 'Progressing', description: 'Reach level 7', icon: '📊', category: 'level', rarity: 'uncommon', condition: (s) => s.level >= 7 },
  { id: 'quest_15', name: 'Quest Regular', description: 'Complete 15 quests', icon: '✅', category: 'quests', rarity: 'uncommon', condition: (s) => s.totalQuestsCompleted >= 15 },
  { id: 'quest_20', name: 'Quest Familiar', description: 'Complete 20 quests', icon: '📝', category: 'quests', rarity: 'uncommon', condition: (s) => s.totalQuestsCompleted >= 20 },
  { id: 'habit_2_active', name: 'Double Habit', description: 'Have 2 active habits', icon: '✌️', category: 'habits', rarity: 'uncommon', condition: (s) => s.habits.length >= 2 },
  { id: 'streak_5', name: 'Five Day Streak', description: 'Maintain a 5-day streak', icon: '🖐️', category: 'streak', rarity: 'uncommon', condition: (s) => s.habits.some(h => h.streak >= 5) },
  { id: 'stat_55', name: 'Above Average', description: 'Reach 55 in any stat', icon: '📈', category: 'special', rarity: 'uncommon', condition: (s) => Object.values(s.stats).some(v => v >= 55) },
  { id: 'hard_quest', name: 'Hard Worker', description: 'Complete a Hard difficulty quest', icon: '💪', category: 'quests', rarity: 'uncommon', condition: (s) => s.totalQuestsCompleted >= 5 },
  { id: 'urgent_quest', name: 'Under Pressure', description: 'Complete an Urgent quest', icon: '⏰', category: 'quests', rarity: 'uncommon', condition: (s) => s.totalQuestsCompleted >= 5 },
  { id: 'morning_person', name: 'Morning Person', description: 'Complete quests in the morning', icon: '☀️', category: 'special', rarity: 'uncommon', condition: (s) => s.totalQuestsCompleted >= 3 },
  { id: 'productive_day', name: 'Productive Day', description: 'Complete 5 quests in one day', icon: '📅', category: 'quests', rarity: 'uncommon', condition: (s) => s.totalQuestsCompleted >= 5 },
  { id: 'habit_keeper', name: 'Habit Keeper', description: 'Keep a habit for 4 days', icon: '🗝️', category: 'habits', rarity: 'uncommon', condition: (s) => s.habits.some(h => h.streak >= 4) },
  { id: 'xp_grinder', name: 'XP Grinder', description: 'Gain 500 XP total', icon: '⚡', category: 'special', rarity: 'uncommon', condition: (s) => s.currentXp >= 200 },
  { id: 'system_user', name: 'System User', description: 'Use The System for 3 days', icon: '💻', category: 'special', rarity: 'uncommon', condition: (s) => s.totalQuestsCompleted >= 3 },
  { id: 'credits_150', name: 'Pocket Change', description: 'Accumulate 150 credits', icon: '💵', category: 'credits', rarity: 'uncommon', condition: (s) => s.credits >= 150 },

  // ===== COMMON (10) =====
  { id: 'first_quest', name: 'First Blood', description: 'Complete your first quest', icon: '🩸', category: 'quests', rarity: 'common', condition: (s) => s.totalQuestsCompleted >= 1 },
  { id: 'level_2', name: 'Level Up!', description: 'Reach level 2', icon: '⬆️', category: 'level', rarity: 'common', condition: (s) => s.level >= 2 },
  { id: 'first_habit', name: 'First Habit', description: 'Create your first habit', icon: '🌱', category: 'habits', rarity: 'common', condition: (s) => s.habits.length >= 1 },
  { id: 'quest_5', name: 'Quest Beginner', description: 'Complete 5 quests', icon: '📋', category: 'quests', rarity: 'common', condition: (s) => s.totalQuestsCompleted >= 5 },
  { id: 'credits_100', name: 'First Earnings', description: 'Accumulate 100 credits', icon: '💰', category: 'credits', rarity: 'common', condition: (s) => s.credits >= 100 },
  { id: 'habit_day_1', name: 'Day One', description: 'Complete a habit for the first time', icon: '✨', category: 'habits', rarity: 'common', condition: (s) => s.habits.some(h => h.streak >= 1) },
  { id: 'explorer', name: 'Explorer', description: 'Visit all sections of The System', icon: '🗺️', category: 'special', rarity: 'common', condition: (s) => s.totalQuestsCompleted >= 1 },
  { id: 'quest_3', name: 'Getting Going', description: 'Complete 3 quests', icon: '🎯', category: 'quests', rarity: 'common', condition: (s) => s.totalQuestsCompleted >= 3 },
  { id: 'stat_improvement', name: 'Self Improvement', description: 'Improve any stat', icon: '📊', category: 'special', rarity: 'common', condition: (s) => Object.values(s.stats).some(v => v > 50) },
  { id: 'system_activated', name: 'System Activated', description: 'Begin your journey', icon: '🔮', category: 'special', rarity: 'common', condition: (s) => s.level >= 1 },
];

type PersistedAchievements = Record<string, { unlocked: boolean; unlockedAt?: string }>;

const hydrateFromPersisted = (persisted: PersistedAchievements): Achievement[] =>
  achievementDefinitions.map(def => ({
    ...def,
    unlocked: persisted[def.id]?.unlocked || false,
    unlockedAt: persisted[def.id]?.unlockedAt ? new Date(persisted[def.id].unlockedAt) : undefined,
  }));

const serializeAchievements = (achievements: Achievement[]): PersistedAchievements => {
  const toSave: PersistedAchievements = {};
  achievements.forEach(a => {
    toSave[a.id] = { unlocked: a.unlocked, unlockedAt: a.unlockedAt?.toISOString() };
  });
  return toSave;
};

export const useAchievements = (userId: string | undefined, evalState: AchievementEvalState) => {
  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    achievementDefinitions.map(def => ({ ...def, unlocked: false })),
  );
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  // Guards writes/checks until the initial load from game_state.achievements
  // completes, so an empty in-memory default never overwrites real
  // persisted unlocks before they've been read.
  const hasLoadedRef = useRef(false);

  // Load persisted unlocks from the canonical game_state.achievements
  // column — the single source of truth (no localStorage involved).
  useEffect(() => {
    hasLoadedRef.current = false;
    if (!userId) {
      setAchievements(achievementDefinitions.map(def => ({ ...def, unlocked: false })));
      return;
    }

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('game_state')
        .select('achievements')
        .eq('user_id', userId)
        .maybeSingle();

      if (cancelled) return;

      const persisted: PersistedAchievements =
        !error && data?.achievements && typeof data.achievements === 'object' && !Array.isArray(data.achievements)
          ? (data.achievements as unknown as PersistedAchievements)
          : {};

      setAchievements(hydrateFromPersisted(persisted));
      hasLoadedRef.current = true;
    })();

    return () => { cancelled = true; };
  }, [userId]);

  // Persist to game_state.achievements whenever the achievement set changes
  // as a result of a new unlock (see checkAchievements below).
  const persist = useCallback(async (next: Achievement[]) => {
    if (!userId) return;
    await supabase
      .from('game_state')
      .update({ achievements: serializeAchievements(next) as unknown as Json })
      .eq('user_id', userId);
  }, [userId]);

  // Check for new achievements
  const checkAchievements = useCallback(() => {
    if (!hasLoadedRef.current) return;

    setAchievements(prev => {
      let hasNewUnlock = false;
      let firstNewUnlock: Achievement | null = null;

      const updated = prev.map(achievement => {
        if (achievement.unlocked) return achievement;

        const def = achievementDefinitions.find(d => d.id === achievement.id);
        if (def && def.condition(evalState)) {
          hasNewUnlock = true;
          const unlockedAchievement = { ...achievement, unlocked: true, unlockedAt: new Date() };
          if (!firstNewUnlock) firstNewUnlock = unlockedAchievement;
          return unlockedAchievement;
        }
        return achievement;
      });

      if (firstNewUnlock) {
        setNewlyUnlocked(firstNewUnlock);
        setTimeout(() => setNewlyUnlocked(null), 4000);
      }

      if (hasNewUnlock) {
        void persist(updated);
        return updated;
      }
      return prev;
    });
  }, [evalState, persist]);

  // Check achievements whenever the evaluated state changes
  useEffect(() => {
    checkAchievements();
  }, [evalState.totalQuestsCompleted, evalState.level, evalState.credits, evalState.habits, checkAchievements]);

  const dismissNotification = useCallback(() => {
    setNewlyUnlocked(null);
  }, []);

  return {
    achievements,
    newlyUnlocked,
    dismissNotification,
    unlockedCount: achievements.filter(a => a.unlocked).length,
    totalCount: achievements.length,
  };
};
