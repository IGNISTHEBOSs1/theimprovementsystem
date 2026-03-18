import { useState } from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '@/hooks/useAchievements';
import { AchievementBadge } from './AchievementBadge';
import { AchievementDetailModal } from './AchievementDetailModal';
import { Trophy, Lock } from 'lucide-react';

interface AchievementsPanelProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}

const rarityConfig = {
  common:    { label: 'Common',    color: 'text-slate-400',  bg: 'bg-slate-500/15',   border: 'border-slate-500/25' },
  uncommon:  { label: 'Uncommon',  color: 'text-green-400',  bg: 'bg-green-500/15',   border: 'border-green-500/25' },
  rare:      { label: 'Rare',      color: 'text-blue-400',   bg: 'bg-blue-500/15',    border: 'border-blue-500/25' },
  epic:      { label: 'Epic',      color: 'text-purple-400', bg: 'bg-purple-500/15',  border: 'border-purple-500/25' },
  legendary: { label: 'Legendary', color: 'text-yellow-400', bg: 'bg-yellow-500/15',  border: 'border-yellow-500/25' },
  mythic:    { label: 'Mythic',    color: 'text-rose-400',   bg: 'bg-rose-500/15',    border: 'border-rose-500/25' },
  godly:     { label: 'Godly',     color: 'text-cyan-300',   bg: 'bg-cyan-500/15',    border: 'border-cyan-500/25' },
};

const categories = [
  { key: 'quests',  label: 'Quests',   icon: '⚔️', jp: 'クエスト' },
  { key: 'level',   label: 'Level',    icon: '⚡', jp: 'レベル' },
  { key: 'habits',  label: 'Habits',   icon: '🔥', jp: '習慣' },
  { key: 'streak',  label: 'Streaks',  icon: '🌊', jp: 'ストリーク' },
  { key: 'credits', label: 'Credits',  icon: '💰', jp: 'クレジット' },
  { key: 'special', label: 'Special',  icon: '✨', jp: '特別' },
] as const;

const rarityOrder = { godly: 0, mythic: 1, legendary: 2, epic: 3, rare: 4, uncommon: 5, common: 6 };

export const AchievementsPanel = ({ achievements, unlockedCount, totalCount }: AchievementsPanelProps) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const pct = Math.round((unlockedCount / totalCount) * 100);

  const sorted = [...achievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  const filtered = activeCategory === 'all' ? sorted : sorted.filter(a => a.category === activeCategory);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#0d0d14] border border-white/8 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Achievements</h2>
                <p className="text-xs text-muted-foreground font-jp">実績コレクション</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-black text-primary">{unlockedCount}<span className="text-muted-foreground text-base font-normal">/{totalCount}</span></p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{pct}% Complete</p>
            </div>
          </div>

          {/* XP progress bar */}
          <div className="space-y-1.5">
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400"
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Rarity legend */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Object.entries(rarityConfig).map(([key, cfg]) => (
              <span key={key} className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                {cfg.label}
              </span>
            ))}
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="px-4 py-3 border-b border-white/5 flex gap-1.5 overflow-x-auto scrollbar-hide">
          <FilterTab label="All" active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}
            count={achievements.filter(a => a.unlocked).length} total={achievements.length} />
          {categories.map(cat => {
            const catAch = achievements.filter(a => a.category === cat.key);
            if (catAch.length === 0) return null;
            return (
              <FilterTab key={cat.key} label={`${cat.icon} ${cat.label}`} active={activeCategory === cat.key}
                onClick={() => setActiveCategory(cat.key)}
                count={catAch.filter(a => a.unlocked).length} total={catAch.length} />
            );
          })}
        </div>

        {/* Achievement grid */}
        <div className="p-5">
          {activeCategory === 'all' ? (
            <div className="space-y-6">
              {categories.map(cat => {
                const catAch = sorted.filter(a => a.category === cat.key);
                if (catAch.length === 0) return null;
                const unlockedCat = catAch.filter(a => a.unlocked).length;
                return (
                  <div key={cat.key}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">{cat.icon}</span>
                      <h3 className="text-sm font-semibold text-foreground">{cat.label}</h3>
                      <span className="text-xs text-muted-foreground font-jp">{cat.jp}</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{unlockedCat}/{catAch.length}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                      {catAch.map((ach, i) => (
                        <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }} onClick={() => setSelectedAchievement(ach)} className="cursor-pointer">
                          <AchievementBadge achievement={ach} size="sm" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
              {filtered.map((ach, i) => (
                <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }} onClick={() => setSelectedAchievement(ach)} className="cursor-pointer">
                  <AchievementBadge achievement={ach} size="sm" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {selectedAchievement && (
        <AchievementDetailModal achievement={selectedAchievement} onClose={() => setSelectedAchievement(null)} />
      )}
    </>
  );
};

const FilterTab = ({ label, active, onClick, count, total }: { label: string; active: boolean; onClick: () => void; count: number; total: number }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      active ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-muted-foreground border border-transparent hover:bg-white/8'
    }`}
  >
    {label}
    <span className={`text-[10px] ${active ? 'text-primary/70' : 'text-muted-foreground/60'}`}>{count}/{total}</span>
  </button>
);
