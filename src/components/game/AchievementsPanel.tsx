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

const RARITY: Record<string, { label: string; color: string; bg: string; border: string; glow: string }> = {
  common:    { label: 'Common',    color: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/30',  glow: '' },
  uncommon:  { label: 'Uncommon',  color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/40',  glow: '' },
  rare:      { label: 'Rare',      color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/50',   glow: 'shadow-blue-500/20 shadow-md' },
  epic:      { label: 'Epic',      color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/50', glow: 'shadow-purple-500/25 shadow-md' },
  legendary: { label: 'Legendary', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', glow: 'shadow-yellow-400/30 shadow-md' },
  mythic:    { label: 'Mythic',    color: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/60',   glow: 'shadow-rose-500/35 shadow-lg' },
  godly:     { label: 'Godly',     color: 'text-cyan-300',   bg: 'bg-cyan-500/10',   border: 'border-cyan-400/60',   glow: 'shadow-cyan-400/40 shadow-lg' },
};

const CATS = [
  { key: 'quests',  icon: '⚔️', label: 'Quests',  hex: '#7f77dd' },
  { key: 'level',   icon: '⚡', label: 'Levels',  hex: '#ba7517' },
  { key: 'habits',  icon: '🔥', label: 'Habits',  hex: '#378add' },
  { key: 'streak',  icon: '🌊', label: 'Streaks', hex: '#22d3ee' },
  { key: 'credits', icon: '💰', label: 'Credits', hex: '#639922' },
  { key: 'special', icon: '✨', label: 'Special', hex: '#d4537e' },
];

const rarityOrder: Record<string, number> = { godly: 0, mythic: 1, legendary: 2, epic: 3, rare: 4, uncommon: 5, common: 6 };

// ── Tree layout constants (all in SVG pixels) ──────────────────────────────
const W = 960;          // SVG canvas width
const ROOT_Y = 50;      // root node center Y
const ROOT_R = 32;      // root node half-size
const CAT_Y = 200;      // category node center Y
const CAT_R = 26;       // category node half-size
const ACH_START_Y = 300; // top of achievement badges area
const ACH_H = 52;       // height per achievement badge
const ACH_W = 60;       // width per achievement badge
const GAP = 6;          // gap between badges

const catXs = CATS.map((_, i) => Math.round(W / (CATS.length + 1) * (i + 1)));

const AchieveBadge = ({ achievement, x, y, onClick }: {
  achievement: Achievement; x: number; y: number; onClick: () => void;
}) => {
  const cfg = RARITY[achievement.rarity] || RARITY.common;
  const unlocked = achievement.unlocked;
  const [hovered, setHovered] = useState(false);

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Badge background */}
      <rect
        x={-22} y={-22} width={44} height={44} rx={10}
        fill={unlocked ? ({'epic':'rgba(127,119,221,0.15)','legendary':'rgba(186,117,23,0.15)','mythic':'rgba(212,83,126,0.15)','godly':'rgba(34,211,238,0.15)','rare':'rgba(55,138,221,0.12)','uncommon':'rgba(99,153,34,0.12)','common':'rgba(255,255,255,0.06)'}[achievement.rarity] || 'rgba(255,255,255,0.06)') : 'rgba(255,255,255,0.02)'}
        stroke={unlocked ? ({'epic':'rgba(127,119,221,0.6)','legendary':'rgba(186,117,23,0.6)','mythic':'rgba(212,83,126,0.7)','godly':'rgba(34,211,238,0.7)','rare':'rgba(55,138,221,0.5)','uncommon':'rgba(99,153,34,0.5)','common':'rgba(255,255,255,0.2)'}[achievement.rarity] || 'rgba(255,255,255,0.2)') : 'rgba(255,255,255,0.06)'}
        strokeWidth={1.5}
        opacity={hovered ? 1 : 0.9}
        style={{
          filter: unlocked ? ({'epic':'drop-shadow(0 0 6px #7f77dd80)','legendary':'drop-shadow(0 0 8px #ba751780)','mythic':'drop-shadow(0 0 8px #d4537e90)','godly':'drop-shadow(0 0 8px #22d3ee80)','rare':'drop-shadow(0 0 4px #378add60)'}[achievement.rarity] || 'none') : 'none',
          transition: 'all 0.15s'
        }}
      />
      {/* Icon */}
      <text
        x={0} y={7}
        textAnchor="middle"
        fontSize={unlocked ? 18 : 14}
        style={{ filter: unlocked ? 'none' : 'grayscale(1)', opacity: unlocked ? 1 : 0.25 }}
      >
        {unlocked ? achievement.icon : '🔒'}
      </text>
      {/* Name label */}
      <text
        x={0} y={32}
        textAnchor="middle"
        fontSize={8}
        fill={unlocked ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}
        style={{ pointerEvents: 'none' }}
      >
        {achievement.name.length > 10 ? achievement.name.slice(0, 9) + '…' : achievement.name}
      </text>
      {/* Tooltip */}
      {hovered && (
        <g transform="translate(0, -52)">
          <rect x={-60} y={-28} width={120} height={52} rx={6}
            fill="rgba(10,10,24,0.98)" stroke="rgba(255,255,255,0.12)" strokeWidth={0.8} />
          <text x={0} y={-12} textAnchor="middle" fontSize={8} fontWeight="bold"
            fill={achievement.rarity === 'epic' ? '#a78bfa' : achievement.rarity === 'legendary' ? '#fbbf24' : achievement.rarity === 'mythic' ? '#fb7185' : '#94a3b8'}>
            {cfg.label.toUpperCase()}
          </text>
          <text x={0} y={2} textAnchor="middle" fontSize={9} fontWeight="500" fill="rgb(240,240,255)">
            {achievement.name}
          </text>
          <text x={0} y={14} textAnchor="middle" fontSize={7.5} fill="rgba(200,200,220,0.7)">
            {achievement.description.length > 28 ? achievement.description.slice(0, 27) + '…' : achievement.description}
          </text>
        </g>
      )}
    </g>
  );
};

export const AchievementsPanel = ({ achievements, unlockedCount, totalCount }: AchievementsPanelProps) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const pct = Math.round((unlockedCount / totalCount) * 100);

  const getCatAchs = (key: string) =>
    [...achievements]
      .filter(a => a.category === key)
      .sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      });

  // Compute total SVG height based on max achievement column
  const maxAchs = Math.max(...CATS.map(c => getCatAchs(c.key).length));
  const COLS = 2; // achievements per row in each category column
  const rowsPerCat = Math.ceil(maxAchs / COLS);
  const SVG_H = ACH_START_Y + rowsPerCat * (ACH_H + GAP) + 60;

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as SVGElement).closest?.('.achievement-badge')) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    const rawX = dragStart.current.panX + (e.clientX - dragStart.current.x);
    const rawY = dragStart.current.panY + (e.clientY - dragStart.current.y);
    setPan({
      x: Math.max(-500, Math.min(500, rawX)),
      y: Math.max(-300, Math.min(300, rawY)),
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => { setIsDragging(false); dragStart.current = null; }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setZoom(prev => Math.min(2.5, Math.max(0.35, prev + (e.deltaY > 0 ? -0.08 : 0.08))));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const resetView = () => { setZoom(0.85); setPan({ x: 0, y: 0 }); };

  // Compute achievement positions per category column
  const getCatAchPositions = (catIdx: number) => {
    const catX = catXs[catIdx];
    const achs = getCatAchs(CATS[catIdx].key);
    const colW = Math.min(achs.length, COLS) * ACH_W;
    const startX = catX - colW / 2 + ACH_W / 2;
    return achs.map((ach, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      return {
        ach,
        x: startX + col * ACH_W,
        y: ACH_START_Y + row * (ACH_H + GAP),
      };
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-white/10 overflow-hidden hover:border-primary/20 transition-all duration-250"
        style={{ boxShadow: 'var(--shadow-card)' }}
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
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <button onClick={() => setZoom(p => Math.max(0.35, p - 0.15))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-muted-foreground hover:text-foreground">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(p => Math.min(2.5, p + 0.15))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-muted-foreground hover:text-foreground">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button onClick={resetView} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-muted-foreground hover:text-foreground">
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

        {/* Pan/zoom area */}
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          style={{
            height: 500,
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            WebkitUserSelect: 'none' as any,
            touchAction: 'none',
            background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary)/0.06) 0%, transparent 70%)',
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Dot matrix */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15">
            <defs>
              <pattern id="ach-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="hsl(var(--primary)/0.5)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ach-dots)" />
          </svg>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 35%, hsl(var(--background)) 100%)' }} />

          {/* Transformed SVG canvas */}
          <div style={{
            transform: `translate(calc(-50% + ${pan.x}px), ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top center',
            position: 'absolute',
            left: '50%',
            top: 20,
            transition: isDragging ? 'none' : 'transform 0.1s ease',
          }}>
            <svg
              width={W}
              height={SVG_H}
              style={{ overflow: 'visible', display: 'block' }}
            >
              {/* ── CONNECTOR LINES ── */}
              {/* Root → horizontal bus */}
              <line
                x1={W / 2} y1={ROOT_Y + ROOT_R}
                x2={W / 2} y2={(ROOT_Y + ROOT_R + CAT_Y - CAT_R) / 2}
                stroke="rgba(139,92,246,0.35)" strokeWidth={1.5} strokeLinecap="round"
              />
              {/* Horizontal bus across all categories */}
              <line
                x1={catXs[0]} y1={(ROOT_Y + ROOT_R + CAT_Y - CAT_R) / 2}
                x2={catXs[catXs.length - 1]} y2={(ROOT_Y + ROOT_R + CAT_Y - CAT_R) / 2}
                stroke="rgba(139,92,246,0.25)" strokeWidth={1}
              />
              {/* Bus → each category */}
              {catXs.map((cx, i) => (
                <line key={i}
                  x1={cx} y1={(ROOT_Y + ROOT_R + CAT_Y - CAT_R) / 2}
                  x2={cx} y2={CAT_Y - CAT_R - 2}
                  stroke="rgba(139,92,246,0.25)" strokeWidth={1} strokeLinecap="round"
                />
              ))}
              {/* Category → achievements */}
              {CATS.map((cat, ci) => {
                const catX = catXs[ci];
                const positions = getCatAchPositions(ci);
                if (positions.length === 0) return null;
                const midY = (CAT_Y + CAT_R + ACH_START_Y - ACH_H / 2) / 2;
                const leftX = Math.min(...positions.map(p => p.x));
                const rightX = Math.max(...positions.map(p => p.x));
                return (
                  <g key={cat.key}>
                    {/* Cat down to mid */}
                    <line x1={catX} y1={CAT_Y + CAT_R + 2} x2={catX} y2={midY}
                      stroke={cat.hex + '60'} strokeWidth={0.8} strokeLinecap="round" />
                    {/* Horizontal spread */}
                    {positions.length > 1 && (
                      <line x1={leftX} y1={midY} x2={rightX} y2={midY}
                        stroke={cat.hex + '45'} strokeWidth={0.8} />
                    )}
                    {/* Each achievement drop */}
                    {positions.map((p, pi) => (
                      <line key={pi}
                        x1={p.x} y1={midY}
                        x2={p.x} y2={p.y - ACH_H / 2 + 8}
                        stroke={cat.hex + '45'} strokeWidth={0.8} strokeLinecap="round"
                      />
                    ))}
                  </g>
                );
              })}

              {/* ── ROOT NODE ── */}
              <motion.g
                animate={{}}
                style={{ filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.6))' }}
              >
                <rect x={W/2 - ROOT_R} y={ROOT_Y - ROOT_R} width={ROOT_R*2} height={ROOT_R*2} rx={12}
                  fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.5)" strokeWidth={2} />
                <text x={W/2} y={ROOT_Y + 8} textAnchor="middle" fontSize={22}>🏆</text>
                <text x={W/2} y={ROOT_Y + ROOT_R + 14} textAnchor="middle" fontSize={9}
                  fontWeight="700" fill="rgba(139,92,246,0.9)" letterSpacing="2">
                  THE SYSTEM
                </text>
              </motion.g>

              {/* ── CATEGORY NODES ── */}
              {CATS.map((cat, ci) => {
                const cx = catXs[ci];
                const catAchs = getCatAchs(cat.key);
                const unlocked = catAchs.filter(a => a.unlocked).length;
                return (
                  <g key={cat.key}>
                    <rect x={cx - CAT_R} y={CAT_Y - CAT_R} width={CAT_R*2} height={CAT_R*2} rx={10}
                      fill="rgba(255,255,255,0.04)" stroke={cat.hex + '50'} strokeWidth={1.5}
                      style={{ filter: `drop-shadow(0 0 6px ${cat.hex}30)` }}
                    />
                    <text x={cx} y={CAT_Y + 8} textAnchor="middle" fontSize={20}>{cat.icon}</text>
                    <text x={cx} y={CAT_Y + CAT_R + 12} textAnchor="middle" fontSize={8.5}
                      fill="rgba(255,255,255,0.55)" fontWeight="500">
                      {cat.label}
                    </text>
                    <text x={cx} y={CAT_Y + CAT_R + 23} textAnchor="middle" fontSize={7.5}
                      fill={cat.hex + 'cc'} fontWeight="600">
                      {unlocked}/{catAchs.length}
                    </text>
                  </g>
                );
              })}

              {/* ── ACHIEVEMENT BADGES ── */}
              {CATS.map((_, ci) =>
                getCatAchPositions(ci).map(({ ach, x, y }) => (
                  <AchieveBadge
                    key={ach.id}
                    achievement={ach}
                    x={x}
                    y={y}
                    onClick={() => setSelectedAchievement(ach)}
                  />
                ))
              )}
            </svg>
          </div>

          <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
            <p className="text-[10px] text-muted-foreground/25">Scroll to zoom · Drag to pan</p>
          </div>
        </div>

        {/* Rarity legend */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-6 py-3 border-t border-white/5">
          {(['common','uncommon','rare','epic','legendary','mythic'] as const).map(r => {
            const cfg = RARITY[r];
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
