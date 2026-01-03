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
    { key: 'credits', label: 'Credits', japLabel: 'クレジット' },
    { key: 'special', label: 'Special', japLabel: '特別' },
  ] as const;

  const sortedAchievements = [...achievements].sort((a, b) => {
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
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
