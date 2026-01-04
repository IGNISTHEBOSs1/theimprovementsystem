import { useState, useEffect, useCallback } from 'react';
import { GameState } from './useGameState';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'quests' | 'habits' | 'level' | 'credits' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  condition: (state: GameState) => boolean;
}

const achievementDefinitions: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Quest achievements
  { id: 'first_quest', name: 'First Steps', description: 'Complete your first quest', icon: '🎯', category: 'quests', rarity: 'common', condition: (s) => s.totalQuestsCompleted >= 1 },
  { id: 'quest_10', name: 'Quest Apprentice', description: 'Complete 10 quests', icon: '⚔️', category: 'quests', rarity: 'common', condition: (s) => s.totalQuestsCompleted >= 10 },
  { id: 'quest_50', name: 'Quest Warrior', description: 'Complete 50 quests', icon: '🗡️', category: 'quests', rarity: 'rare', condition: (s) => s.totalQuestsCompleted >= 50 },
  { id: 'quest_100', name: 'Quest Master', description: 'Complete 100 quests', icon: '🏆', category: 'quests', rarity: 'epic', condition: (s) => s.totalQuestsCompleted >= 100 },
  { id: 'quest_500', name: 'Quest Legend', description: 'Complete 500 quests', icon: '👑', category: 'quests', rarity: 'legendary', condition: (s) => s.totalQuestsCompleted >= 500 },
  
  // Level achievements
  { id: 'level_5', name: 'Awakened', description: 'Reach level 5', icon: '✨', category: 'level', rarity: 'common', condition: (s) => s.level >= 5 },
  { id: 'level_10', name: 'Rising Hunter', description: 'Reach level 10', icon: '🌟', category: 'level', rarity: 'common', condition: (s) => s.level >= 10 },
  { id: 'level_20', name: 'Elite Hunter', description: 'Reach level 20', icon: '💫', category: 'level', rarity: 'rare', condition: (s) => s.level >= 20 },
  { id: 'level_30', name: 'Veteran Hunter', description: 'Reach level 30', icon: '🔥', category: 'level', rarity: 'epic', condition: (s) => s.level >= 30 },
  { id: 'level_50', name: 'Shadow Monarch', description: 'Reach level 50', icon: '👁️', category: 'level', rarity: 'legendary', condition: (s) => s.level >= 50 },
  
  // Credit achievements
  { id: 'credits_100', name: 'Coin Collector', description: 'Accumulate 100 credits', icon: '🪙', category: 'credits', rarity: 'common', condition: (s) => s.credits >= 100 },
  { id: 'credits_500', name: 'Treasure Hunter', description: 'Accumulate 500 credits', icon: '💰', category: 'credits', rarity: 'rare', condition: (s) => s.credits >= 500 },
  { id: 'credits_1000', name: 'Gold Hoarder', description: 'Accumulate 1000 credits', icon: '💎', category: 'credits', rarity: 'epic', condition: (s) => s.credits >= 1000 },
  
  // Habit achievements
  { id: 'habit_streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '📅', category: 'habits', rarity: 'common', condition: (s) => s.habits.some(h => h.streak >= 7) },
  { id: 'habit_streak_14', name: 'Fortnight Fighter', description: 'Maintain a 14-day streak', icon: '🔗', category: 'habits', rarity: 'rare', condition: (s) => s.habits.some(h => h.streak >= 14) },
  { id: 'habit_streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '⛓️', category: 'habits', rarity: 'epic', condition: (s) => s.habits.some(h => h.streak >= 30) },
  
  // Stat achievements
  { id: 'stat_80', name: 'Specialist', description: 'Reach 80 in any stat', icon: '📊', category: 'special', rarity: 'rare', condition: (s) => Object.values(s.stats).some(v => v >= 80) },
  { id: 'stat_all_50', name: 'Balanced', description: 'All stats above 50', icon: '⚖️', category: 'special', rarity: 'epic', condition: (s) => Object.values(s.stats).every(v => v >= 50) },
  { id: 'stat_all_90', name: 'Perfection', description: 'All stats above 90', icon: '🌈', category: 'special', rarity: 'legendary', condition: (s) => Object.values(s.stats).every(v => v >= 90) },
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
