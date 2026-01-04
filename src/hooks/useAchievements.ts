import { useState, useEffect, useCallback } from 'react';
import { GameState } from './useGameState';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'quests' | 'habits' | 'level' | 'credits' | 'special' | 'pomodoro';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  condition: (state: GameState) => boolean;
}

const achievementDefinitions: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Starting achievement - always unlocked for new users
  { id: 'awakening', name: 'The Awakening', description: 'You have been chosen by The System', icon: '👁️', category: 'special', rarity: 'legendary', condition: () => true },
  
  // Quest achievements (harder to earn)
  { id: 'first_quest', name: 'First Blood', description: 'Complete your first quest', icon: '🩸', category: 'quests', rarity: 'common', condition: (s) => s.totalQuestsCompleted >= 1 },
  { id: 'quest_25', name: 'Quest Hunter', description: 'Complete 25 quests', icon: '⚔️', category: 'quests', rarity: 'rare', condition: (s) => s.totalQuestsCompleted >= 25 },
  { id: 'quest_100', name: 'Quest Slayer', description: 'Complete 100 quests', icon: '🗡️', category: 'quests', rarity: 'epic', condition: (s) => s.totalQuestsCompleted >= 100 },
  { id: 'quest_500', name: 'Quest Monarch', description: 'Complete 500 quests', icon: '👑', category: 'quests', rarity: 'legendary', condition: (s) => s.totalQuestsCompleted >= 500 },
  
  // Level achievements (meaningful milestones)
  { id: 'level_10', name: 'Risen', description: 'Reach level 10 - You are no longer weak', icon: '⚡', category: 'level', rarity: 'rare', condition: (s) => s.level >= 10 },
  { id: 'level_25', name: 'The Chosen', description: 'Reach level 25 - Power flows through you', icon: '🔥', category: 'level', rarity: 'epic', condition: (s) => s.level >= 25 },
  { id: 'level_50', name: 'Shadow Monarch', description: 'Reach level 50 - You command shadows', icon: '🌑', category: 'level', rarity: 'legendary', condition: (s) => s.level >= 50 },
  
  // Habit achievements (discipline-focused)
  { id: 'habit_streak_7', name: 'Iron Discipline', description: 'Maintain a 7-day habit streak', icon: '🔗', category: 'habits', rarity: 'rare', condition: (s) => s.habits.some(h => h.streak >= 7) },
  { id: 'habit_streak_30', name: 'Unbreakable', description: 'Maintain a 30-day habit streak', icon: '⛓️', category: 'habits', rarity: 'epic', condition: (s) => s.habits.some(h => h.streak >= 30) },
  { id: 'habit_streak_100', name: 'Eternal Flame', description: 'Maintain a 100-day habit streak', icon: '🔥', category: 'habits', rarity: 'legendary', condition: (s) => s.habits.some(h => h.streak >= 100) },
  
  // Credit achievements
  { id: 'credits_500', name: 'Treasure Seeker', description: 'Accumulate 500 credits', icon: '💰', category: 'credits', rarity: 'rare', condition: (s) => s.credits >= 500 },
  { id: 'credits_2000', name: 'Dragon Hoard', description: 'Accumulate 2000 credits', icon: '🐉', category: 'credits', rarity: 'legendary', condition: (s) => s.credits >= 2000 },
  
  // Stat achievements (true excellence)
  { id: 'stat_80', name: 'Specialist', description: 'Reach 80 in any stat', icon: '📊', category: 'special', rarity: 'epic', condition: (s) => Object.values(s.stats).some(v => v >= 80) },
  { id: 'stat_all_60', name: 'Balanced Warrior', description: 'All stats above 60', icon: '⚖️', category: 'special', rarity: 'epic', condition: (s) => Object.values(s.stats).every(v => v >= 60) },
  { id: 'stat_max', name: 'Transcendence', description: 'Max out any stat to 100', icon: '✨', category: 'special', rarity: 'legendary', condition: (s) => Object.values(s.stats).some(v => v >= 100) },
];

const ACHIEVEMENTS_STORAGE_KEY = 'the-system-achievements';

export const useAchievements = (gameState: GameState) => {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (saved) {
      try {
        const savedUnlocks = JSON.parse(saved) as Record<string, { unlocked: boolean; unlockedAt?: string }>;
        return achievementDefinitions.map(def => ({
          ...def,
          unlocked: savedUnlocks[def.id]?.unlocked || false,
          unlockedAt: savedUnlocks[def.id]?.unlockedAt ? new Date(savedUnlocks[def.id].unlockedAt) : undefined,
        }));
      } catch {
        return achievementDefinitions.map(def => ({ ...def, unlocked: false }));
      }
    }
    return achievementDefinitions.map(def => ({ ...def, unlocked: false }));
  });

  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  // Save to localStorage
  useEffect(() => {
    const toSave: Record<string, { unlocked: boolean; unlockedAt?: string }> = {};
    achievements.forEach(a => {
      toSave[a.id] = { unlocked: a.unlocked, unlockedAt: a.unlockedAt?.toISOString() };
    });
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(toSave));
  }, [achievements]);

  // Check for new achievements
  const checkAchievements = useCallback(() => {
    setAchievements(prev => {
      let hasNewUnlock = false;
      let firstNewUnlock: Achievement | null = null;

      const updated = prev.map(achievement => {
        if (achievement.unlocked) return achievement;
        
        const def = achievementDefinitions.find(d => d.id === achievement.id);
        if (def && def.condition(gameState)) {
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

      return hasNewUnlock ? updated : prev;
    });
  }, [gameState]);

  // Check achievements whenever game state changes
  useEffect(() => {
    checkAchievements();
  }, [gameState.totalQuestsCompleted, gameState.level, gameState.credits, gameState.habits, checkAchievements]);

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
