import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronDown, ChevronUp, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const SHADOWS = [
  { id: 'iron',     name: 'Iron',     icon: '⚔️', title: 'The Soldier',       rarity: 'uncommon',  bonus: '+5% XP',          bonusDesc: 'All XP gains increased by 5%',                          unlockCond: 'Complete 10 quests',  unlockQuests: 10  },
  { id: 'fangs',    name: 'Fangs',    icon: '🐺', title: 'The Pack Hunter',    rarity: 'uncommon',  bonus: 'Streak XP +10%',  bonusDesc: 'Habit streak XP multiplied by 1.1x',                   unlockCond: '7-day streak',        unlockStreak: 7   },
  { id: 'kasaka',   name: 'Kasaka',   icon: '🕷️', title: 'The Weaver',        rarity: 'rare',      bonus: '+1 Habit Slot',   bonusDesc: 'Can maintain one extra habit without penalty',          unlockCond: 'Complete 25 quests',  unlockQuests: 25  },
  { id: 'beru',     name: 'Beru',     icon: '🪲', title: 'The Ant King',       rarity: 'epic',      bonus: '+15% Credits',    bonusDesc: 'Credit rewards increased by 15%',                       unlockCond: 'Reach Level 20',      unlockLevel: 20   },
  { id: 'igris',    name: 'Igris',    icon: '🩸', title: 'The Blood Knight',   rarity: 'epic',      bonus: 'Hard Quest +15%', bonusDesc: 'Hard & Urgent quest XP boosted by 15%',                 unlockCond: 'Complete 100 quests', unlockQuests: 100 },
  { id: 'kaiser',   name: 'Kaiser',   icon: '🦅', title: 'The White Tiger',    rarity: 'epic',      bonus: 'Daily Bonus',     bonusDesc: 'Earn 10 bonus credits for completing all daily quests', unlockCond: '14-day streak',       unlockStreak: 14  },
  { id: 'greed',    name: 'Greed',    icon: '💀', title: 'The Armored',        rarity: 'legendary', bonus: 'Streak Shield',   bonusDesc: 'Miss 1 day without losing streak (once/week)',          unlockCond: 'Reach Level 30',      unlockLevel: 30   },
  { id: 'tank',     name: 'Tank',     icon: '🛡️', title: 'The Fortress',      rarity: 'legendary', bonus: 'Fail Protection', bonusDesc: 'First quest fail of the day costs 50% less XP',         unlockCond: 'Complete 200 quests', unlockQuests: 200 },
  { id: 'tusk',     name: 'Tusk',     icon: '👑', title: 'The Beast Monarch',  rarity: 'legendary', bonus: '+2x Streak XP',   bonusDesc: 'Streak days grant double XP on that habit',             unlockCond: '30-day streak',       unlockStreak: 30  },
  { id: 'bellion',  name: 'Bellion',  icon: '⚡', title: 'Grand Marshal',      rarity: 'mythic',    bonus: '2x XP Boost',     bonusDesc: 'Activate 2x XP for 1 hour once per day',                unlockCond: 'Reach Level 50',      unlockLevel: 50   },
  { id: 'antares',  name: 'Antares',  icon: '🌑', title: 'The Dragon Monarch', rarity: 'mythic',    bonus: '+25% All XP',     bonusDesc: 'All XP gains permanently increased by 25%',             unlockCond: 'Complete 500 quests', unlockQuests: 500 },
];

const RARITY = {
  uncommon:  { color: 'text-green-400',  border: 'border-green-500/40',  bg: 'bg-green-500/10',  label: 'Uncommon'  },
  rare:      { color: 'text-blue-400',   border: 'border-blue-500/50',   bg: 'bg-blue-500/10',   label: 'Rare'      },
  epic:      { color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-500/10', label: 'Epic'      },
  legendary: { color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', label: 'Legendary' },
  mythic:    { color: 'text-rose-400',   border: 'border-rose-500/60',   bg: 'bg-rose-500/10',   label: 'Mythic'    },
};

// Shadows whose passives are wired into the XP economy.
// 'passive' = applied once on first unlock, never again.
// 'daily'   = activated manually each day by the player.
const WIRED_SHADOWS: Record<string, 'passive' | 'daily'> = {
  iron:    'passive',  // +5% permanent XP
  antares: 'passive',  // +25% permanent XP
  bellion: 'daily',    // 2× timed XP, 1hr, once/day
};

interface ShadowArmyProps {
  level: number;
  totalQuestsCompleted: number;
  currentStreak: number;
  // Economy callbacks — only provided when wired shadows are needed
  onAddPermanentXpBonus?: (bonus: number) => void;
  onActivateBellion?: () => boolean;
  // Read-only state for display
  permanentXpBonus?: number;
  bellionLastUsed?: string;
  xpMultiplierExpires?: string;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export const ShadowArmy = ({
  level,
  totalQuestsCompleted,
  currentStreak,
  onAddPermanentXpBonus,
  onActivateBellion,
  permanentXpBonus = 0,
  bellionLastUsed = '',
  xpMultiplierExpires,
}: ShadowArmyProps) => {
  const [expanded, setExpanded]               = useState(false);
  const [appliedPassives, setAppliedPassives] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('shadow-applied-passives');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
  });
  const [bellionCooldown, setBellionCooldown] = useState(false);

  const isUnlocked = (s: typeof SHADOWS[0]): boolean => {
    if ((s as any).unlockLevel   && level                < (s as any).unlockLevel)  return false;
    if ((s as any).unlockQuests  && totalQuestsCompleted < (s as any).unlockQuests) return false;
    if ((s as any).unlockStreak  && currentStreak        < (s as any).unlockStreak) return false;
    return true;
  };

  const getProgress = (s: typeof SHADOWS[0]): { current: number; target: number } => {
    if ((s as any).unlockLevel)  return { current: level,                target: (s as any).unlockLevel  };
    if ((s as any).unlockQuests) return { current: totalQuestsCompleted, target: (s as any).unlockQuests };
    if ((s as any).unlockStreak) return { current: currentStreak,        target: (s as any).unlockStreak };
    return { current: 0, target: 1 };
  };

  // Auto-apply passive bonuses on first unlock.
  // Iron (+5%) and Antares (+25%) call addPermanentXpBonus once and persist
  // the shadow id to localStorage so the bonus is never applied twice.
  useEffect(() => {
    if (!onAddPermanentXpBonus) return;

    const PASSIVE_BONUSES: Record<string, number> = {
      iron:    0.05,
      antares: 0.25,
    };

    let anyApplied = false;
    const newApplied = new Set(appliedPassives);

    for (const [id, bonus] of Object.entries(PASSIVE_BONUSES)) {
      const shadow = SHADOWS.find(s => s.id === id);
      if (!shadow) continue;
      if (!isUnlocked(shadow)) continue;
      if (newApplied.has(id)) continue;

      // First time this shadow's passive is eligible — apply it
      onAddPermanentXpBonus(bonus);
      newApplied.add(id);
      anyApplied = true;
    }

    if (anyApplied) {
      setAppliedPassives(newApplied);
      localStorage.setItem('shadow-applied-passives', JSON.stringify([...newApplied]));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, totalQuestsCompleted, currentStreak]);

  const handleBellionActivate = () => {
    if (!onActivateBellion) return;
    const success = onActivateBellion();
    if (!success) {
      // Already used today — brief visual feedback
      setBellionCooldown(true);
      setTimeout(() => setBellionCooldown(false), 1500);
    }
  };

  const bellionUsedToday = bellionLastUsed === getTodayString();
  const bellionStillActive = xpMultiplierExpires
    ? new Date(xpMultiplierExpires) > new Date()
    : false;

  const unlockedList = SHADOWS.filter(isUnlocked);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-white/10 overflow-hidden hover:border-violet-500/20 transition-all duration-250"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/25 to-violet-500/8 border border-violet-500/30 flex items-center justify-center">
            <span className="text-xl">👥</span>
          </div>
          <div className="text-left">
            <h3 className="font-display font-bold text-foreground tracking-wide text-sm">SHADOW ARMY</h3>
            <p className="text-label text-muted-foreground font-jp">シャドウアーミー</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Show active permanent bonus if any */}
          {permanentXpBonus > 0 && (
            <span className="text-label text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-lg font-bold">
              +{Math.round(permanentXpBonus * 100)}% XP
            </span>
          )}
          {unlockedList.length > 0 && (
            <div className="hidden sm:flex gap-1 items-center">
              {unlockedList.slice(0, 3).map(s => (
                <span key={s.id} className="text-lg">{s.icon}</span>
              ))}
              {unlockedList.length > 3 && (
                <span className="text-xs text-muted-foreground">+{unlockedList.length - 3}</span>
              )}
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-violet-500/15 border border-violet-500/25 px-3 py-1.5 rounded-lg">
            <span className="text-violet-400 font-display font-bold text-sm">{unlockedList.length}</span>
            <span className="text-violet-400/60 text-xs">/ {SHADOWS.length}</span>
          </div>
          {expanded
            ? <ChevronUp  className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
          }
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-5">
              <p className="text-body-sm text-muted-foreground mb-4">
                Shadows of defeated bosses rise to serve you. Each grants a permanent passive bonus.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {SHADOWS.map((shadow, i) => {
                  const unlk  = isUnlocked(shadow);
                  const style = RARITY[shadow.rarity as keyof typeof RARITY];
                  const prog  = getProgress(shadow);
                  const pct   = Math.min(100, Math.round((prog.current / prog.target) * 100));
                  const wired = WIRED_SHADOWS[shadow.id];
                  const passiveApplied = appliedPassives.has(shadow.id);

                  return (
                    <motion.div
                      key={shadow.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border transition-all',
                        unlk ? `${style.bg} ${style.border}` : 'bg-white/2 border-white/5'
                      )}
                    >
                      {/* Icon */}
                      <div className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center text-xl border flex-shrink-0',
                        style.border, style.bg,
                        !unlk && 'grayscale opacity-40'
                      )}>
                        {unlk ? shadow.icon : <Lock className="w-4 h-4 text-muted-foreground/30" />}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={cn('font-display font-bold text-caption', unlk ? 'text-foreground' : 'text-muted-foreground/50')}>
                            {shadow.name}
                          </span>
                          <span className={cn('text-label font-bold uppercase', unlk ? style.color : 'text-muted-foreground/30')}>
                            {style.label}
                          </span>
                          {/* Wired indicator */}
                          {unlk && wired && (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-1 py-0.5 rounded uppercase tracking-wide">
                              ACTIVE
                            </span>
                          )}
                        </div>

                        {unlk ? (
                          <>
                            <p className="text-label text-muted-foreground">{shadow.bonusDesc}</p>
                            {/* Bellion — daily activate button */}
                            {shadow.id === 'bellion' && wired && (
                              <div className="mt-2">
                                {bellionStillActive ? (
                                  <span className="text-label text-rose-400 flex items-center gap-1">
                                    <Zap className="w-3 h-3" /> 2× XP active now
                                  </span>
                                ) : bellionUsedToday ? (
                                  <span className="text-label text-muted-foreground flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Used today — resets at midnight
                                  </span>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="neon"
                                    onClick={(e) => { e.stopPropagation(); handleBellionActivate(); }}
                                    className={cn('h-7 text-xs mt-1', bellionCooldown && 'opacity-50')}
                                    disabled={bellionCooldown}
                                  >
                                    <Zap className="w-3 h-3" />
                                    Activate 2× XP
                                  </Button>
                                )}
                              </div>
                            )}
                            {/* Iron / Antares — passive status */}
                            {(shadow.id === 'iron' || shadow.id === 'antares') && wired && (
                              <span className="text-label text-emerald-400 flex items-center gap-1 mt-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {passiveApplied ? 'Bonus applied' : 'Applying...'}
                              </span>
                            )}
                          </>
                        ) : (
                          <div>
                            <p className="text-label text-muted-foreground/50 mb-1">🔒 {shadow.unlockCond}</p>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-white/20 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="text-label text-muted-foreground/35 mt-0.5">
                              {prog.current} / {prog.target}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Bonus badge */}
                      {unlk && (
                        <div className={cn('px-2 py-1 rounded-lg border text-xs font-bold flex-shrink-0', style.border, style.color)}>
                          {shadow.bonus}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
