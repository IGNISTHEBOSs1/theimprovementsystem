import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '@/hooks/useAchievements';
import { AchievementDetailModal } from './AchievementDetailModal';
import { Trophy, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementsPanelProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}

const rarityConfig: Record<string, { label: string; color: string; bg: string; border: string; glow: string; hex: string }> = {
  common:    { label: 'Common',    color: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/30',  glow: '',                                hex: '#88878080' },
  uncommon:  { label: 'Uncommon',  color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/40',  glow: '',                                hex: '#63992280' },
  rare:      { label: 'Rare',      color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/50',   glow: 'shadow-blue-500/20 shadow-md',    hex: '#378add80' },
  epic:      { label: 'Epic',      color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/50', glow: 'shadow-purple-500/25 shadow-md',  hex: '#7f77dd80' },
  legendary: { label: 'Legendary', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', glow: 'shadow-yellow-400/30 shadow-md',  hex: '#ba751780' },
  mythic:    { label: 'Mythic',    color: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/60',   glow: 'shadow-rose-500/35 shadow-lg',    hex: '#d4537e90' },
  godly:     { label: 'Godly',     color: 'text-cyan-300',   bg: 'bg-cyan-500/10',   border: 'border-cyan-400/60',   glow: 'shadow-cyan-400/40 shadow-lg',    hex: '#22d3ee90' },
};

const categoryConfig = [
  { key: 'quests',  icon: '⚔️', label: 'Quests',  rarity: 'epic'     },
  { key: 'level',   icon: '⚡', label: 'Levels',  rarity: 'legendary'},
  { key: 'habits',  icon: '🔥', label: 'Habits',  rarity: 'rare'     },
  { key: 'streak',  icon: '🌊', label: 'Streaks', rarity: 'epic'     },
  { key: 'credits', icon: '💰', label: 'Credits', rarity: 'uncommon' },
  { key: 'special', icon: '✨', label: 'Special', rarity: 'mythic'   },
];

const rarityOrder: Record<string, number> = { godly: 0, mythic: 1, legendary: 2, epic: 3, rare: 4, uncommon: 5, common: 6 };

// Dot-matrix background component
const DotMatrix = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    style={{ opacity: 0.18 }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="dot-matrix" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="1.5" fill="rgba(139,92,246,0.6)" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dot-matrix)" />
  </svg>
);

interface BadgeProps {
  achievement: Achievement;
  onClick: () => void;
  delay?: number;
}

const AchieveBadge = ({ achievement, onClick, delay = 0 }: BadgeProps) => {
  const cfg = rarityConfig[achievement.rarity] || rarityConfig.common;
  const unlocked = achievement.unlocked;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 380, damping: 22 }}
      className="flex flex-col items-center group cursor-pointer"
      style={{ width: 60 }}
      onClick={onClick}
    >
      <motion.div
        whileHover={{ scale: 1.15, y: -4 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'w-11 h-11 rounded-xl border-2 flex items-center justify-center relative overflow-hidden transition-all duration-200',
          unlocked ? `${cfg.bg} ${cfg.border} ${cfg.glow}` : 'bg-white/3 border-white/8 grayscale opacity-25'
        )}
      >
        {unlocked && ['epic','legendary','mythic','godly'].includes(achievement.rarity) && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2.5 }}
          />
        )}
        <span className="text-[18px] relative z-10">
          {unlocked ? achievement.icon : <Lock className="w-3 h-3 text-white/15" />}
        </span>
      </motion.div>

      <p className={cn(
        'text-center text-[9px] leading-tight mt-1 w-full px-0.5 truncate',
        unlocked ? 'text-muted-foreground' : 'text-white/15'
      )}>
        {achievement.name}
      </p>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 px-3 py-2.5 bg-[#0c0c18]/98 border border-white/12 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-[100] text-center shadow-2xl scale-90 group-hover:scale-100">
        <p className={cn('text-[9px] font-bold uppercase tracking-wider mb-1', cfg.color)}>{cfg.label}</p>
        <p className="text-xs font-bold text-white">{achievement.name}</p>
        <p className="text-[10px] text-white/50 mt-1 leading-tight">{achievement.description}</p>
        {unlocked && achievement.unlockedAt && (
          <p className="text-[9px] text-primary/70 mt-1.5 border-t border-white/8 pt-1.5">
            ✨ {new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>
        )}
        {!unlocked && <p className="text-[9px] text-white/20 mt-1">🔒 Not yet unlocked</p>}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#0c0c18] border-r border-b border-white/12 rotate-45" />
      </div>
    </motion.div>
  );
};

// Tree connector SVG drawn on a canvas so positions are pixel-perfect
interface ConnectorProps {
  fromX: number;
  fromY: number;
  toXs: number[];
  toY: number;
  color?: string;
}

const TreeConnectors = ({ fromX, fromY, toXs, toY, color = 'rgba(139,92,246,0.25)' }: ConnectorProps) => {
  if (toXs.length === 0) return null;
  const midY = fromY + (toY - fromY) / 2;

  return (
    <svg
      className="absolute top-0 left-0 w-full pointer-events-none"
      style={{ height: toY, overflow: 'visible', zIndex: 0 }}
    >
      {/* Vertical from source */}
      <line x1={fromX} y1={fromY} x2={fromX} y2={midY} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Horizontal bus */}
      {toXs.length > 1 && (
        <line
          x1={Math.min(...toXs)} y1={midY}
          x2={Math.max(...toXs)} y2={midY}
          stroke={color} strokeWidth="1" strokeLinecap="round"
        />
      )}
      {/* Verticals to each target */}
      {toXs.map((x, i) => (
        <line key={i} x1={x} y1={midY} x2={x} y2={toY} stroke={color} strokeWidth="1" strokeLinecap="round" />
      ))}
    </svg>
  );
};

export const AchievementsPanel = ({ achievements, unlockedCount, totalCount }: AchievementsPanelProps) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [catPositions, setCatPositions] = useState<number[]>([]);
  const [achPositions, setAchPositions] = useState<number[]>([]);
  const catRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const achRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const pct = Math.round((unlockedCount / totalCount) * 100);

  const getCategoryAchs = (key: string) =>
    [...achievements]
      .filter(a => a.category === key)
      .sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      });

  const expandedAchs = expandedCategory ? getCategoryAchs(expandedCategory) : [];

  // Measure positions after render for accurate connectors
  useEffect(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const cats = catRefs.current.map(ref => {
      if (!ref) return 0;
      const r = ref.getBoundingClientRect();
      return r.left - containerRect.left + r.width / 2;
    });
    setCatPositions(cats);

    if (expandedCategory) {
      const achs = achRefs.current.map(ref => {
        if (!ref) return 0;
        const r = ref.getBoundingClientRect();
        return r.left - containerRect.left + r.width / 2;
      });
      setAchPositions(achs);
    }
  }, [expandedCategory, achievements]);

  const ROOT_H = 88;   // root node bottom y
  const CAT_TOP = 136; // category node top y (after 48px connector space)
  const CAT_H = 48;    // category node height
  const CAT_BOT = CAT_TOP + CAT_H; // category bottom y
  const ACH_TOP = CAT_BOT + 44;    // ach node top y

  const expandedCatIndex = categoryConfig.findIndex(c => c.key === expandedCategory);
  const expandedCatX = catPositions[expandedCatIndex] || 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative bg-[#06060f] border border-white/8 rounded-2xl overflow-hidden"
      >
        {/* DOT MATRIX BACKGROUND */}
        <DotMatrix />

        {/* Radial fade over the dots so edges look clean */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, #06060f 100%)',
            zIndex: 1,
          }}
        />

        {/* All content above the background */}
        <div className="relative z-10">

          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/25 to-primary/8 border border-primary/25 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground tracking-wide">ACHIEVEMENTS</h2>
                  <p className="text-[11px] text-muted-foreground font-jp tracking-widest">実績ツリー</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-black text-primary leading-none">
                  {unlockedCount}<span className="text-muted-foreground text-lg font-normal">/{totalCount}</span>
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{pct}% complete</p>
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

          {/* TREE */}
          <div className="p-6 pb-8 overflow-x-auto">
            <div className="min-w-[320px] relative" ref={containerRef}>

              {/* ROOT NODE */}
              <div className="flex justify-center" style={{ height: ROOT_H }}>
                <motion.div
                  className="flex flex-col items-center pt-2"
                  animate={{ filter: ['drop-shadow(0 0 8px rgba(139,92,246,0.3))', 'drop-shadow(0 0 20px rgba(139,92,246,0.6))', 'drop-shadow(0 0 8px rgba(139,92,246,0.3))'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/50 flex items-center justify-center text-3xl relative">
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                    />
                    <span className="relative z-10">🏆</span>
                  </div>
                  <p className="text-[10px] font-bold text-primary font-display tracking-widest mt-2 uppercase">The System</p>
                </motion.div>
              </div>

              {/* ROOT → CATEGORY CONNECTORS */}
              {catPositions.length === 6 && (
                <TreeConnectors
                  fromX={catPositions[Math.floor(catPositions.length / 2 - 0.5)] + (catPositions[Math.floor(catPositions.length / 2)] - catPositions[Math.floor(catPositions.length / 2 - 0.5)]) / 2}
                  fromY={ROOT_H - 16}
                  toXs={catPositions}
                  toY={CAT_TOP}
                  color="rgba(139,92,246,0.3)"
                />
              )}

              {/* CATEGORY NODES ROW */}
              <div
                className="flex justify-between items-start px-1"
                style={{ marginTop: CAT_TOP - ROOT_H, position: 'relative' }}
              >
                {categoryConfig.map((cat, idx) => {
                  const cfg = rarityConfig[cat.rarity] || rarityConfig.common;
                  const catAchs = getCategoryAchs(cat.key);
                  const catUnlocked = catAchs.filter(a => a.unlocked).length;
                  const isExpanded = expandedCategory === cat.key;

                  return (
                    <div key={cat.key} className="flex flex-col items-center" style={{ width: '16.66%' }}>
                      <motion.button
                        ref={el => catRefs.current[idx] = el}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.key)}
                        className={cn(
                          'w-12 h-12 rounded-xl border-2 flex items-center justify-center relative overflow-hidden transition-all duration-300 text-xl',
                          isExpanded
                            ? `${cfg.bg} ${cfg.border} ${cfg.glow}`
                            : 'bg-white/4 border-white/12 hover:bg-white/8 hover:border-white/25'
                        )}
                      >
                        {isExpanded && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                          />
                        )}
                        <span className="relative z-10">{cat.icon}</span>
                      </motion.button>
                      <p className="text-[9px] text-muted-foreground mt-1.5 font-medium text-center">{cat.label}</p>
                      <p className={cn('text-[8px] font-bold', isExpanded ? cfg.color : 'text-white/30')}>
                        {catUnlocked}/{catAchs.length}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* EXPANDED: connectors + achievement badges */}
              <AnimatePresence>
                {expandedCategory && (
                  <motion.div
                    key={expandedCategory}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28 }}
                    className="overflow-hidden"
                  >
                    {/* Spacer for connector lines */}
                    <div style={{ height: 44, position: 'relative' }}>
                      {achPositions.length > 0 && expandedCatX > 0 && (
                        <TreeConnectors
                          fromX={expandedCatX}
                          fromY={0}
                          toXs={achPositions}
                          toY={44}
                          color={rarityConfig[categoryConfig[expandedCatIndex]?.rarity]?.hex || 'rgba(139,92,246,0.25)'}
                        />
                      )}
                    </div>

                    {/* Achievement badges */}
                    <div
                      className="flex flex-wrap justify-center gap-x-1 gap-y-5 pb-2 relative"
                    >
                      {expandedAchs.map((ach, i) => (
                        <div
                          key={ach.id}
                          ref={el => achRefs.current[i] = el}
                          className="relative"
                        >
                          <AchieveBadge
                            achievement={ach}
                            delay={i * 0.04}
                            onClick={() => setSelectedAchievement(ach)}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Click hint */}
              {!expandedCategory && (
                <p className="text-center text-[10px] text-white/20 mt-5">
                  Tap a category to explore achievements
                </p>
              )}

            </div>
          </div>

          {/* Rarity legend */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 px-6 py-3 border-t border-white/5">
            {(['common','uncommon','rare','epic','legendary','mythic'] as const).map(r => {
              const cfg = rarityConfig[r];
              return (
                <span key={r} className="flex items-center gap-1">
                  <span className={cn('w-2 h-2 rounded-[3px] border inline-block', cfg.bg, cfg.border)} />
                  <span className={cn('text-[9px] font-medium', cfg.color)}>{cfg.label}</span>
                </span>
              );
            })}
          </div>

        </div>
      </motion.div>

      {selectedAchievement && (
        <AchievementDetailModal achievement={selectedAchievement} onClose={() => setSelectedAchievement(null)} />
      )}
    </>
  );
};
