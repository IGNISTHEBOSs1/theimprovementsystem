import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Lock, ChevronDown, ChevronUp, Shield, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const SHADOWS = [
  { id: 'iron',     name: 'Iron',     icon: '⚔️', title: 'The Soldier',       rarity: 'uncommon', bonus: '+5% XP',          bonusDesc: 'All XP gains increased by 5%',                       unlockCond: 'Complete 10 quests',    unlockQuests: 10 },
  { id: 'fangs',    name: 'Fangs',    icon: '🐺', title: 'The Pack Hunter',    rarity: 'uncommon', bonus: 'Streak XP +10%',  bonusDesc: 'Habit streak XP multiplied by 1.1x',                unlockCond: '7-day streak',          unlockStreak: 7  },
  { id: 'kasaka',   name: 'Kasaka',   icon: '🕷️', title: 'The Weaver',        rarity: 'rare',     bonus: '+1 Habit Slot',   bonusDesc: 'Can maintain one extra habit without penalty',       unlockCond: 'Complete 25 quests',    unlockQuests: 25 },
  { id: 'beru',     name: 'Beru',     icon: '🪲', title: 'The Ant King',       rarity: 'epic',     bonus: '+15% Credits',    bonusDesc: 'Credit rewards increased by 15%',                    unlockCond: 'Reach Level 20',        unlockLevel: 20  },
  { id: 'igris',    name: 'Igris',    icon: '🩸', title: 'The Blood Knight',   rarity: 'epic',     bonus: 'Hard Quest +15%', bonusDesc: 'Hard & Urgent quest XP boosted by 15%',              unlockCond: 'Complete 100 quests',   unlockQuests: 100},
  { id: 'kaiser',   name: 'Kaiser',   icon: '🦅', title: 'The White Tiger',    rarity: 'epic',     bonus: 'Daily Bonus',     bonusDesc: 'Earn 10 bonus credits for completing all daily quests', unlockCond: '14-day streak',        unlockStreak: 14 },
  { id: 'greed',    name: 'Greed',    icon: '💀', title: 'The Armored',        rarity: 'legendary',bonus: 'Streak Shield',   bonusDesc: 'Miss 1 day without losing streak (once/week)',       unlockCond: 'Reach Level 30',        unlockLevel: 30  },
  { id: 'tank',     name: 'Tank',     icon: '🛡️', title: 'The Fortress',      rarity: 'legendary',bonus: 'Fail Protection', bonusDesc: 'First quest fail of the day costs 50% less XP',      unlockCond: 'Complete 200 quests',   unlockQuests: 200},
  { id: 'tusk',     name: 'Tusk',     icon: '👑', title: 'The Beast Monarch',  rarity: 'legendary',bonus: '+2x Streak XP',   bonusDesc: 'Streak days grant double XP on that habit',          unlockCond: '30-day streak',         unlockStreak: 30 },
  { id: 'bellion',  name: 'Bellion',  icon: '⚡', title: 'Grand Marshal',      rarity: 'mythic',   bonus: '2x XP Boost',     bonusDesc: 'Activate 2x XP for 1 hour once per day',             unlockCond: 'Reach Level 50',        unlockLevel: 50  },
  { id: 'antares',  name: 'Antares',  icon: '🌑', title: 'The Dragon Monarch', rarity: 'mythic',   bonus: '+25% All XP',     bonusDesc: 'All XP gains permanently increased by 25%',          unlockCond: 'Complete 500 quests',   unlockQuests: 500},
];

const RARITY = {
  uncommon:  { color: 'text-green-400',  border: 'border-green-500/40',  bg: 'bg-green-500/8',  label: 'Uncommon'  },
  rare:      { color: 'text-blue-400',   border: 'border-blue-500/50',   bg: 'bg-blue-500/8',   label: 'Rare'      },
  epic:      { color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-500/8', label: 'Epic'      },
  legendary: { color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500/8', label: 'Legendary' },
  mythic:    { color: 'text-rose-400',   border: 'border-rose-500/60',   bg: 'bg-rose-500/8',   label: 'Mythic'    },
};

interface ShadowArmyProps {
  level: number;
  totalQuestsCompleted: number;
  currentStreak: number;
}

export const ShadowArmy = ({ level, totalQuestsCompleted, currentStreak }: ShadowArmyProps) => {
  const [expanded, setExpanded] = useState(false);

  const isUnlocked = (s: typeof SHADOWS[0]) => {
    if ((shadow as any).unlockLevel && level < (shadow as any).unlockLevel) return false;
    if ((shadow as any).unlockQuests && totalQuestsCompleted < (shadow as any).unlockQuests) return false;
    if ((shadow as any).unlockStreak && currentStreak < (shadow as any).unlockStreak) return false;
    return true;
  };

  const unlocked = SHADOWS.filter(isUnlocked);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl border border-white/10 overflow-hidden">
      <button onClick={() => setExpanded(p => !p)} className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/25 to-violet-500/8 border border-violet-500/30 flex items-center justify-center">
            <span className="text-xl">👥</span>
          </div>
          <div className="text-left">
            <h3 className="font-display font-bold text-foreground tracking-wide">SHADOW ARMY</h3>
            <p className="text-[11px] text-muted-foreground font-jp">シャドウアーミー</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Active bonuses preview */}
          {unlocked.length > 0 && (
            <div className="hidden sm:flex gap-1">
              {unlocked.slice(0,3).map(s => (
                <span key={s.id} className="text-lg">{s.icon}</span>
              ))}
              {unlocked.length > 3 && <span className="text-xs text-muted-foreground self-center">+{unlocked.length-3}</span>}
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-violet-500/15 border border-violet-500/25 px-3 py-1.5 rounded-lg">
            <span className="text-violet-400 font-display font-bold text-sm">{unlocked.length}</span>
            <span className="text-violet-400/60 text-xs">/ {SHADOWS.length}</span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }} className="overflow-hidden border-t border-white/5"
          >
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-4">
                Shadows of defeated bosses rise to serve you. Each grants a permanent passive bonus.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {SHADOWS.map((shadow, i) => {
                  const unlk = isUnlocked(shadow);
                  const style = RARITY[shadow.rarity as keyof typeof RARITY];
                  return (
                    <motion.div
                      key={shadow.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border transition-all',
                        unlk ? `${style.bg} ${style.border}` : 'bg-white/2 border-white/5 opacity-40 grayscale'
                      )}
                    >
                      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-xl border flex-shrink-0', style.border, style.bg)}>
                        {unlk ? shadow.icon : <Lock className="w-4 h-4 text-muted-foreground/30" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-display font-bold text-xs text-foreground">{shadow.name}</span>
                          <span className={cn('text-[9px] font-bold uppercase', style.color)}>{style.label}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{unlk ? shadow.bonusDesc : `🔒 ${shadow.unlockCond}`}</p>
                      </div>
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
