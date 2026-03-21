import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '@/hooks/useAchievements';
import { AchievementDetailModal } from './AchievementDetailModal';
import { Trophy, Lock, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementsPanelProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}

const rarityConfig: Record<string, { label: string; color: string; bg: string; border: string; glow: string }> = {
  common:    { label: 'Common',    color: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/30',  glow: '' },
  uncommon:  { label: 'Uncommon',  color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/40',  glow: '' },
  rare:      { label: 'Rare',      color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/50',   glow: 'shadow-blue-500/20 shadow-md' },
  epic:      { label: 'Epic',      color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/50', glow: 'shadow-purple-500/25 shadow-md' },
  legendary: { label: 'Legendary', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', glow: 'shadow-yellow-400/30 shadow-md' },
  mythic:    { label: 'Mythic',    color: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/60',   glow: 'shadow-rose-500/35 shadow-lg' },
  godly:     { label: 'Godly',     color: 'text-cyan-300',   bg: 'bg-cyan-500/10',   border: 'border-cyan-400/60',   glow: 'shadow-cyan-400/40 shadow-lg' },
};

const categoryConfig = [
  { key: 'quests',  icon: '⚔️', label: 'Quests',  color: '#7f77dd' },
  { key: 'level',   icon: '⚡', label: 'Levels',  color: '#ba7517' },
  { key: 'habits',  icon: '🔥', label: 'Habits',  color: '#378add' },
  { key: 'streak',  icon: '🌊', label: 'Streaks', color: '#7f77dd' },
  { key: 'credits', icon: '💰', label: 'Credits', color: '#63992' },
  { key: 'special', icon: '✨', label: 'Special', color: '#d4537e' },
];

const rarityOrder: Record<string, number> = { godly: 0, mythic: 1, legendary: 2, epic: 3, rare: 4, uncommon: 5, common: 6 };

const AchieveBadge = ({ achievement, onClick, delay = 0 }: { achievement: Achievement; onClick: () => void; delay?: number }) => {
  const cfg = rarityConfig[achievement.rarity] || rarityConfig.common;
  const unlocked = achievement.unlocked;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 380, damping: 22 }}
      className="flex flex-col items-center group cursor-pointer"
      style={{ width: 64 }}
      onClick={onClick}
    >
      <motion.div
        whileHover={{ scale: 1.15, y: -4 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'w-11 h-11 rounded-xl border-2 flex items-center justify-center relative overflow-hidden',
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
        <span className="text-lg relative z-10">
          {unlocked ? achievement.icon : <Lock className="w-3 h-3 text-white/15" />}
        </span>
      </motion.div>
      <p className={cn('text-center text-[9px] leading-tight mt-1.5 w-full px-0.5 truncate',
        unlocked ? 'text-muted-foreground' : 'text-white/15'
      )}>
        {achievement.name}
      </p>

      {/* Tooltip — uses fixed so it escapes the zoom container */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 px-3 py-2.5 bg-background/98 border border-white/12 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-[200] text-center shadow-2xl">
        <p className={cn('text-[9px] font-bold uppercase tracking-wider mb-1', cfg.color)}>{cfg.label}</p>
        <p className="text-xs font-bold text-foreground">{achievement.name}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{achievement.description}</p>
        {unlocked && achievement.unlockedAt && (
          <p className="text-[9px] text-primary/70 mt-1.5 border-t border-white/8 pt-1.5">
            ✨ {new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>
        )}
        {!unlocked && <p className="text-[9px] text-white/20 mt-1">🔒 Locked</p>}
      </div>
    </motion.div>
  );
};

export const AchievementsPanel = ({ achievements, unlockedCount, totalCount }: AchievementsPanelProps) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const pct = Math.round((unlockedCount / totalCount) * 100);

  const getCategoryAchs = (key: string) =>
    [...achievements]
      .filter(a => a.category === key)
      .sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.achievement-badge')) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.min(2, Math.max(0.4, prev + delta)));
  };

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Build full tree layout
  const TREE_WIDTH = 900;
  const CAT_Y = 180;
  const ACH_Y = 320;
  const catSpacing = TREE_WIDTH / (categoryConfig.length + 1);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-white/10 overflow-hidden"
      >
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
            <div className="flex items-center gap-3">
              {/* Zoom controls */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <button onClick={() => setZoom(p => Math.max(0.4, p - 0.15))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(p => Math.min(2, p + 0.15))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button onClick={resetView} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-black text-primary leading-none">
                  {unlockedCount}<span className="text-muted-foreground text-base font-normal">/{totalCount}</span>
                </p>
                <p className="text-[10px] text-muted-foreground">{pct}% complete</p>
              </div>
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

        {/* Zoomable/Pannable tree area */}
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          style={{ height: 480, cursor: isDragging ? 'grabbing' : 'grab', background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary)/0.06) 0%, transparent 70%)' }}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
        >
          {/* Dot matrix bg */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15">
            <defs>
              <pattern id="ach-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="hsl(var(--primary)/0.5)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ach-dots)" />
          </svg>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, hsl(var(--background)) 100%)' }} />

          {/* Zoom + pan container */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              position: 'absolute',
              inset: 0,
              transition: isDragging ? 'none' : 'transform 0.1s ease',
            }}
          >
            {/* SVG connector lines */}
            <svg
              className="absolute pointer-events-none"
              style={{ left: `calc(50% - ${TREE_WIDTH/2}px)`, top: 0, width: TREE_WIDTH, height: ACH_Y + 120, overflow: 'visible' }}
            >
              {categoryConfig.map((cat, i) => {
                const catX = catSpacing * (i + 1);
                const rootX = TREE_WIDTH / 2;
                const midY = (CAT_Y - 60) / 2 + 60;
                return (
                  <g key={cat.key}>
                    {/* Root to horizontal bus */}
                    <line x1={rootX} y1={60} x2={rootX} y2={midY} stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Horizontal bus */}
                    {i === 0 && <line x1={catSpacing} y1={midY} x2={catSpacing * categoryConfig.length} y2={midY} stroke="rgba(139,92,246,0.2)" strokeWidth="1" />}
                    {/* Down to category */}
                    <line x1={catX} y1={midY} x2={catX} y2={CAT_Y - 8} stroke="rgba(139,92,246,0.25)" strokeWidth="1" strokeLinecap="round" />
                  </g>
                );
              })}
              {/* Category to achievements lines */}
              {categoryConfig.map((cat, ci) => {
                const catX = catSpacing * (ci + 1);
                const catAchs = getCategoryAchs(cat.key);
                const totalW = catAchs.length * 64;
                const startX = catX - totalW / 2 + 32;
                const midY2 = CAT_Y + 40 + 20;
                return catAchs.map((_, ai) => {
                  const achX = startX + ai * 64;
                  return (
                    <g key={`${cat.key}-${ai}`}>
                      {ai === 0 && catAchs.length > 1 && (
                        <line x1={startX} y1={midY2} x2={startX + (catAchs.length-1)*64} y2={midY2} stroke={cat.color + '50'} strokeWidth="0.8" />
                      )}
                      <line x1={catX} y1={CAT_Y + 40} x2={catX} y2={midY2} stroke={cat.color + '60'} strokeWidth="0.8" strokeLinecap="round" />
                      <line x1={achX} y1={midY2} x2={achX} y2={ACH_Y - 8} stroke={cat.color + '50'} strokeWidth="0.8" strokeLinecap="round" />
                    </g>
                  );
                });
              })}
            </svg>

            {/* ROOT NODE */}
            <div className="absolute flex flex-col items-center" style={{ left: '50%', transform: 'translateX(-50%)', top: 20 }}>
              <motion.div
                animate={{ filter: ['drop-shadow(0 0 8px hsl(var(--primary)/0.4))', 'drop-shadow(0 0 20px hsl(var(--primary)/0.7))', 'drop-shadow(0 0 8px hsl(var(--primary)/0.4))'] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/50 flex items-center justify-center text-3xl"
              >
                🏆
              </motion.div>
              <p className="text-[10px] font-bold text-primary font-display tracking-widest mt-2 uppercase whitespace-nowrap">The System</p>
            </div>

            {/* CATEGORY NODES */}
            <div className="absolute" style={{ left: `calc(50% - ${TREE_WIDTH/2}px)`, top: CAT_Y, width: TREE_WIDTH }}>
              <div className="flex justify-around">
                {categoryConfig.map((cat) => {
                  const catAchs = getCategoryAchs(cat.key);
                  const unlocked = catAchs.filter(a => a.unlocked).length;
                  return (
                    <div key={cat.key} className="flex flex-col items-center gap-1" style={{ width: catSpacing }}>
                      <motion.div
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="w-12 h-12 rounded-xl border-2 border-white/15 bg-white/5 flex items-center justify-center text-xl"
                        style={{ boxShadow: `0 0 12px ${cat.color}30` }}
                      >
                        {cat.icon}
                      </motion.div>
                      <p className="text-[9px] text-muted-foreground font-medium">{cat.label}</p>
                      <p className="text-[8px]" style={{ color: cat.color }}>{unlocked}/{catAchs.length}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACHIEVEMENT BADGES */}
            <div className="absolute" style={{ left: `calc(50% - ${TREE_WIDTH/2}px)`, top: ACH_Y, width: TREE_WIDTH }}>
              <div className="flex justify-around items-start">
                {categoryConfig.map((cat) => {
                  const catAchs = getCategoryAchs(cat.key);
                  return (
                    <div key={cat.key} className="flex flex-wrap justify-center gap-1" style={{ width: catSpacing, maxWidth: catSpacing }}>
                      {catAchs.map((ach, i) => (
                        <div key={ach.id} className="achievement-badge relative">
                          <AchieveBadge
                            achievement={ach}
                            delay={i * 0.03}
                            onClick={() => setSelectedAchievement(ach)}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Hint */}
          <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
            <p className="text-[10px] text-muted-foreground/30">Scroll to zoom · Drag to pan</p>
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
      </motion.div>

      {selectedAchievement && (
        <AchievementDetailModal achievement={selectedAchievement} onClose={() => setSelectedAchievement(null)} />
      )}
    </>
  );
};
