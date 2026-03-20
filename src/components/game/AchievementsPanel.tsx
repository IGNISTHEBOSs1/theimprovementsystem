import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '@/hooks/useAchievements';
import { AchievementDetailModal } from './AchievementDetailModal';
import { Trophy, Lock, Star } from 'lucide-react';

interface AchievementsPanelProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}

const rarityConfig = {
  common:    { label: 'Common',    color: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/20', glow: '', ring: 'ring-slate-400/20' },
  uncommon:  { label: 'Uncommon',  color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20', glow: 'shadow-green-500/20', ring: 'ring-green-400/30' },
  rare:      { label: 'Rare',      color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/25', glow: 'shadow-blue-500/30', ring: 'ring-blue-400/40' },
  epic:      { label: 'Epic',      color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', glow: 'shadow-purple-500/40', ring: 'ring-purple-400/50' },
  legendary: { label: 'Legendary', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/40', glow: 'shadow-yellow-400/50', ring: 'ring-yellow-400/60' },
  mythic:    { label: 'Mythic',    color: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/50', glow: 'shadow-rose-500/60', ring: 'ring-rose-400/70' },
  godly:     { label: 'Godly',     color: 'text-cyan-300',   bg: 'bg-cyan-500/10',   border: 'border-cyan-400/60', glow: 'shadow-cyan-400/70', ring: 'ring-cyan-300/80' },
};

const categories = [
  { key: 'quests',  label: 'Quests',   icon: '⚔️', description: 'Complete quests to prove your worth' },
  { key: 'level',   label: 'Level',    icon: '⚡', description: 'Rise through the ranks of hunters' },
  { key: 'habits',  label: 'Habits',   icon: '🔥', description: 'Build discipline through consistency' },
  { key: 'streak',  label: 'Streaks',  icon: '🌊', description: 'Chain your victories together' },
  { key: 'credits', label: 'Credits',  icon: '💰', description: 'Accumulate wealth and power' },
  { key: 'special', label: 'Special',  icon: '✨', description: 'Rare feats only few achieve' },
] as const;

const rarityOrder: Record<string, number> = { godly: 0, mythic: 1, legendary: 2, epic: 3, rare: 4, uncommon: 5, common: 6 };

const NodeBadge = ({ achievement, onClick, delay = 0 }: { achievement: Achievement; onClick: () => void; delay?: number }) => {
  const cfg = rarityConfig[achievement.rarity];
  const isUnlocked = achievement.unlocked;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 20 }}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      {/* Glow ring for unlocked */}
      {isUnlocked && (
        <motion.div
          className={`absolute inset-0 rounded-2xl ${cfg.ring} ring-2 blur-sm`}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <motion.div
        whileHover={{ scale: 1.15, y: -3 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative w-14 h-14 rounded-2xl border-2 flex items-center justify-center
          transition-all duration-300
          ${isUnlocked
            ? `${cfg.bg} ${cfg.border} shadow-lg ${cfg.glow}`
            : 'bg-muted/10 border-muted/20 grayscale opacity-40'
          }
        `}
      >
        {/* Shimmer for epic+ */}
        {isUnlocked && ['epic','legendary','mythic','godly'].includes(achievement.rarity) && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/15 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
          />
        )}

        <span className="text-xl relative z-10">
          {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-muted-foreground/30" />}
        </span>

        {/* Star for legendary+ */}
        {isUnlocked && ['legendary','mythic','godly'].includes(achievement.rarity) && (
          <Star className={`absolute top-0.5 right-0.5 w-2.5 h-2.5 ${cfg.color} fill-current`} />
        )}
      </motion.div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 px-3 py-2 bg-[#0d0d14]/95 backdrop-blur border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 text-center shadow-xl scale-90 group-hover:scale-100">
        <p className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${cfg.color}`}>{cfg.label}</p>
        <p className="text-xs font-bold text-foreground">{achievement.name}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{achievement.description}</p>
        {isUnlocked && achievement.unlockedAt && (
          <p className="text-[9px] text-primary/70 mt-1">✨ {new Date(achievement.unlockedAt).toLocaleDateString()}</p>
        )}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#0d0d14] border-r border-b border-white/10 rotate-45" />
      </div>
    </motion.div>
  );
};

export const AchievementsPanel = ({ achievements, unlockedCount, totalCount }: AchievementsPanelProps) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const pct = Math.round((unlockedCount / totalCount) * 100);

  const getCategoryAchievements = (catKey: string) =>
    [...achievements]
      .filter(a => a.category === catKey)
      .sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#080810] border border-white/8 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/25 to-primary/8 border border-primary/25 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground tracking-wide">ACHIEVEMENTS</h2>
                <p className="text-[11px] text-muted-foreground font-jp tracking-widest">実績コレクション</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-black text-primary leading-none">
                {unlockedCount}<span className="text-muted-foreground text-lg font-normal">/{totalCount}</span>
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{pct}% Complete</p>
            </div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary via-violet-400 to-primary/80"
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
        </div>

        {/* Mind-map category nodes */}
        <div className="p-6">
          {/* Central node */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{ boxShadow: ['0 0 20px rgba(139,92,246,0.2)', '0 0 40px rgba(139,92,246,0.4)', '0 0 20px rgba(139,92,246,0.2)'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/40 flex items-center justify-center mb-2"
            >
              <Trophy className="w-7 h-7 text-primary" />
            </motion.div>
            <p className="text-xs font-bold text-primary font-display tracking-widest">THE SYSTEM</p>
          </div>

          {/* Category branches */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, catIdx) => {
              const catAchs = getCategoryAchievements(cat.key);
              if (catAchs.length === 0) return null;
              const unlockedCat = catAchs.filter(a => a.unlocked).length;
              const isExpanded = activeCategory === cat.key;

              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIdx * 0.08 }}
                  className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isExpanded ? 'border-primary/40 bg-primary/5' : 'border-white/8 bg-white/2 hover:border-white/15'
                  }`}
                >
                  {/* Category header */}
                  <button
                    onClick={() => setActiveCategory(isExpanded ? null : cat.key)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{cat.icon}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(unlockedCat, 5) }).map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 text-primary fill-primary" />
                        ))}
                      </div>
                    </div>
                    <p className="font-display font-bold text-sm text-foreground tracking-wide">{cat.label.toUpperCase()}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{unlockedCat}/{catAchs.length} unlocked</p>
                    <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary/60 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(unlockedCat / catAchs.length) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </button>

                  {/* Expanded achievement grid */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/8 overflow-hidden"
                      >
                        <div className="p-4 flex flex-wrap gap-2 justify-center">
                          {catAchs.map((ach, i) => (
                            <NodeBadge
                              key={ach.id}
                              achievement={ach}
                              delay={i * 0.04}
                              onClick={() => setSelectedAchievement(ach)}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Recently unlocked strip */}
          {achievements.filter(a => a.unlocked).length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Recently Unlocked</p>
              <div className="flex gap-2 flex-wrap">
                {achievements
                  .filter(a => a.unlocked)
                  .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
                  .slice(0, 8)
                  .map((ach, i) => (
                    <NodeBadge key={ach.id} achievement={ach} delay={i * 0.05} onClick={() => setSelectedAchievement(ach)} />
                  ))}
              </div>
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
