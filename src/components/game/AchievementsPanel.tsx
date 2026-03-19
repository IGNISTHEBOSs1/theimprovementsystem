import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '@/hooks/useAchievements';
import { AchievementBadge } from './AchievementBadge';
import { AchievementDetailModal } from './AchievementDetailModal';
import { Trophy, Lock, ChevronRight } from 'lucide-react';

interface AchievementsPanelProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}

const rarityConfig = {
  common:    { label: 'Common',    color: 'text-slate-400',  bg: 'bg-slate-500/10',   border: 'border-slate-500/20', dot: 'bg-slate-400' },
  uncommon:  { label: 'Uncommon',  color: 'text-green-400',  bg: 'bg-green-500/10',   border: 'border-green-500/20', dot: 'bg-green-400' },
  rare:      { label: 'Rare',      color: 'text-blue-400',   bg: 'bg-blue-500/10',    border: 'border-blue-500/20',  dot: 'bg-blue-400' },
  epic:      { label: 'Epic',      color: 'text-purple-400', bg: 'bg-purple-500/10',  border: 'border-purple-500/20',dot: 'bg-purple-400' },
  legendary: { label: 'Legendary', color: 'text-yellow-400', bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20',dot: 'bg-yellow-400' },
  mythic:    { label: 'Mythic',    color: 'text-rose-400',   bg: 'bg-rose-500/10',    border: 'border-rose-500/20',  dot: 'bg-rose-400' },
  godly:     { label: 'Godly',     color: 'text-cyan-300',   bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',  dot: 'bg-cyan-300' },
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

  // Rarity breakdown for stats bar
  const rarityBreakdown = Object.keys(rarityConfig).map(r => {
    const total = achievements.filter(a => a.rarity === r).length;
    const unlocked = achievements.filter(a => a.rarity === r && a.unlocked).length;
    return { rarity: r as keyof typeof rarityConfig, total, unlocked };
  }).filter(r => r.total > 0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#080810] border border-white/8 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-transparent to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/25 to-primary/8 border border-primary/25 flex items-center justify-center shadow-lg shadow-primary/15">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground tracking-wide">ACHIEVEMENTS</h2>
                  <p className="text-[11px] text-muted-foreground font-jp tracking-widest">実績コレクション</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-black text-primary leading-none">
                  {unlockedCount}
                  <span className="text-muted-foreground text-lg font-normal">/{totalCount}</span>
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{pct}% Complete</p>
              </div>
            </div>

            {/* Main progress bar */}
            <div className="space-y-1.5 mb-4">
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-violet-400 to-primary/80"
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>

            {/* Rarity breakdown */}
            <div className="flex flex-wrap gap-1.5">
              {rarityBreakdown.map(({ rarity, total, unlocked }) => {
                const cfg = rarityConfig[rarity];
                return (
                  <div key={rarity} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium border ${cfg.bg} ${cfg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    <span className={cfg.color}>{cfg.label}</span>
                    <span className="text-muted-foreground/60">{unlocked}/{total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="px-4 py-3 border-b border-white/5 flex gap-1.5 overflow-x-auto scrollbar-hide">
          <FilterTab
            label="All" icon="🏆"
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
            count={achievements.filter(a => a.unlocked).length}
            total={achievements.length}
          />
          {categories.map(cat => {
            const catAch = achievements.filter(a => a.category === cat.key);
            if (catAch.length === 0) return null;
            return (
              <FilterTab
                key={cat.key}
                label={cat.label} icon={cat.icon}
                active={activeCategory === cat.key}
                onClick={() => setActiveCategory(cat.key)}
                count={catAch.filter(a => a.unlocked).length}
                total={catAch.length}
              />
            );
          })}
        </div>

        {/* Achievement grid */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {activeCategory === 'all' ? (
              <motion.div
                key="all"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {categories.map(cat => {
                  const catAch = sorted.filter(a => a.category === cat.key);
                  if (catAch.length === 0) return null;
                  const unlockedCat = catAch.filter(a => a.unlocked).length;
                  const catPct = Math.round((unlockedCat / catAch.length) * 100);
                  return (
                    <div key={cat.key}>
                      {/* Category header */}
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="text-sm">{cat.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-foreground tracking-wide">{cat.label.toUpperCase()}</h3>
                              <span className="text-[10px] text-muted-foreground font-jp">{cat.jp}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Lock className="w-3 h-3 text-muted-foreground/50" />
                              <span className="text-[11px] text-muted-foreground tabular-nums">{unlockedCat}/{catAch.length}</span>
                              <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
                            </div>
                          </div>
                          <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary/50 rounded-full"
                              initial={{ width: 0 }} animate={{ width: `${catPct}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                        {catAch.map((ach, i) => (
                          <motion.div
                            key={ach.id}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.025, type: 'spring', stiffness: 400, damping: 20 }}
                            onClick={() => setSelectedAchievement(ach)}
                            className="cursor-pointer"
                          >
                            <AchievementBadge achievement={ach} size="sm" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-5 sm:grid-cols-8 gap-2"
              >
                {filtered.map((ach, i) => (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.025, type: 'spring', stiffness: 400, damping: 20 }}
                    onClick={() => setSelectedAchievement(ach)}
                    className="cursor-pointer"
                  >
                    <AchievementBadge achievement={ach} size="sm" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {selectedAchievement && (
        <AchievementDetailModal achievement={selectedAchievement} onClose={() => setSelectedAchievement(null)} />
      )}
    </>
  );
};

const FilterTab = ({ label, icon, active, onClick, count, total }: {
  label: string; icon: string; active: boolean; onClick: () => void; count: number; total: number;
}) => (
  <motion.button
    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
      active
        ? 'bg-primary/15 text-primary border-primary/30 shadow-sm shadow-primary/10'
        : 'bg-white/3 text-muted-foreground border-transparent hover:bg-white/6 hover:text-foreground'
    }`}
  >
    <span className="text-sm">{icon}</span>
    {label}
    <span className={`text-[10px] tabular-nums ${active ? 'text-primary/70' : 'text-muted-foreground/50'}`}>
      {count}/{total}
    </span>
  </motion.button>
);
