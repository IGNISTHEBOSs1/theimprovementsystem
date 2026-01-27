import { motion } from 'framer-motion';
import { Achievement } from '@/hooks/useAchievements';
import { AchievementBadge } from './AchievementBadge';
import { Trophy } from 'lucide-react';

interface AchievementsPanelProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}

export const AchievementsPanel = ({ 
  achievements, 
  unlockedCount, 
  totalCount 
}: AchievementsPanelProps) => {
  const categories = [
    { key: 'quests', label: 'Quests', japLabel: 'クエスト' },
    { key: 'level', label: 'Level', japLabel: 'レベル' },
    { key: 'habits', label: 'Habits', japLabel: '習慣' },
    { key: 'streak', label: 'Streaks', japLabel: 'ストリーク' },
    { key: 'credits', label: 'Credits', japLabel: 'クレジット' },
    { key: 'special', label: 'Special', japLabel: '特別' },
  ] as const;

  const rarityOrder = { godly: 0, mythic: 1, legendary: 2, epic: 3, rare: 4, uncommon: 5, common: 6 };

  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Achievements</h2>
            <p className="text-xs text-muted-foreground">実績</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{unlockedCount}/{totalCount}</p>
          <p className="text-xs text-muted-foreground">Unlocked</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/60"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Rarity Legend */}
      <div className="flex flex-wrap gap-2 mb-6 text-[10px]">
        <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400">Common</span>
        <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400">Uncommon</span>
        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">Rare</span>
        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">Epic</span>
        <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">Legendary</span>
        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">Mythic</span>
        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Godly</span>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map(category => {
          const categoryAchievements = sortedAchievements.filter(
            a => a.category === category.key
          );
          if (categoryAchievements.length === 0) return null;

          return (
            <div key={category.key}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-foreground">{category.label}</h3>
                <span className="text-xs text-muted-foreground">{category.japLabel}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {categoryAchievements.filter(a => a.unlocked).length}/{categoryAchievements.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {categoryAchievements.map(achievement => (
                  <AchievementBadge 
                    key={achievement.id} 
                    achievement={achievement}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
