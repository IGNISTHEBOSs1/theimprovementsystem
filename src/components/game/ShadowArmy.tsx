import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Star, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Shadow {
  id: string;
  name: string;
  icon: string;
  title: string;
  unlockCondition: string;
  bonus: string;
  bonusDesc: string;
  unlockLevel?: number;
  unlockQuests?: number;
  unlockStreak?: number;
  rarity: 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

const SHADOWS: Shadow[] = [
  { id: 'iron',      name: 'Iron',      icon: '⚔️', title: 'The Soldier',      bonus: '+5% XP',         bonusDesc: 'All XP gains increased by 5%',          unlockQuests: 10,  rarity: 'uncommon',  unlockCondition: '10 quests completed' },
  { id: 'fangs',     name: 'Fangs',     icon: '🐺', title: 'The Beast',        bonus: '+10% Streak',    bonusDesc: 'Streak XP multiplied by 1.1x',           unlockStreak: 7,   rarity: 'rare',      unlockCondition: '7-day streak' },
  { id: 'beru',      name: 'Beru',      icon: '🪲', title: 'The Ant King',     bonus: '+15% Credits',   bonusDesc: 'Credit rewards increased by 15%',        unlockLevel: 20,   rarity: 'epic',      unlockCondition: 'Reach Level 20' },
  { id: 'igris',     name: 'Igris',     icon: '🩸', title: 'The Blood Knight', bonus: '+10% XP (Hard)', bonusDesc: 'Hard/Urgent quest XP +10%',              unlockQuests: 100, rarity: 'epic',      unlockCondition: '100 quests completed' },
  { id: 'greed',     name: 'Greed',     icon: '💀', title: 'The Armored',      bonus: 'Streak Shield',  bonusDesc: 'Miss 1 day without losing streak (once/week)', unlockLevel: 30, rarity: 'legendary', unlockCondition: 'Reach Level 30' },
  { id: 'bellion',   name: 'Bellion',   icon: '👑', title: 'Grand Marshal',    bonus: '+2x XP Boost',   bonusDesc: 'Activate 2x XP for 1 hour (once/day)',   unlockLevel: 50,   rarity: 'mythic',    unlockCondition: 'Reach Level 50' },
];

const rarityStyle: Record<string, { color: string; border: string; bg: string; glow: string }> = {
  uncommon:  { color: 'text-green-400',  border: 'border-green-500/40',  bg: 'bg-green-500/8',   glow: '' },
  rare:      { color: 'text-blue-400',   border: 'border-blue-500/50',   bg: 'bg-blue-500/8',    glow: 'shadow-blue-500/20' },
  epic:      { color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-500/8',  glow: 'shadow-purple-500/25' },
  legendary: { color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500/8',  glow: 'shadow-yellow-400/30' },
  mythic:    { color: 'text-rose-400',   border: 'border-rose-500/60',   bg: 'bg-rose-500/8',    glow: 'shadow-rose-500/35' },
};

interface ShadowArmyProps {
  level: number;
  totalQuestsCompleted: number;
  currentStreak: number;
}

export const ShadowArmy = ({ level, totalQuestsCompleted, currentStreak }: ShadowArmyProps) => {
  const [expanded, setExpanded] = useState(false);

  const isUnlocked = (s: Shadow) => {
    if (s.unlockLevel && level < s.unlockLevel) return false;
    if (s.unlockQuests && totalQuestsCompleted < s.unlockQuests) return false;
    if (s.unlockStreak && currentStreak < s.unlockStreak) return false;
    return true;
  };

  const unlockedShadows = SHADOWS.filter(isUnlocked);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/25 to-violet-500/8 border border-violet-500/30 flex items-center justify-center text-xl">
            👥
          </div>
          <div className="text-left">
            <h3 className="font-display font-bold text-foreground tracking-wide">SHADOW ARMY</h3>
            <p className="text-[11px] text-muted-foreground font-jp">シャドウアーミー</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-violet-500/15 border border-violet-500/25 px-3 py-1.5 rounded-lg">
            <span className="text-violet-400 font-display font-bold text-sm">{unlockedShadows.length}</span>
            <span className="text-violet-400/60 text-xs">/ {SHADOWS.length}</span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/5">
              <p className="text-xs text-muted-foreground mt-3 mb-4">
                Defeated bosses leave behind shadows. Each shadow grants a passive bonus to your hunter.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {SHADOWS.map((shadow, i) => {
                  const unlocked = isUnlocked(shadow);
                  const style = rarityStyle[shadow.rarity];

                  return (
                    <motion.div
                      key={shadow.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-2xl border transition-all',
                        unlocked ? `${style.bg} ${style.border} ${style.glow && `shadow-md ${style.glow}`}` : 'bg-white/2 border-white/5 opacity-40 grayscale'
                      )}
                    >
                      {/* Shadow icon */}
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border', style.border, style.bg)}>
                        {unlocked ? shadow.icon : <Lock className="w-5 h-5 text-muted-foreground/30" />}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-display font-bold text-sm text-foreground">{shadow.name}</p>
                          <span className={cn('text-[9px] font-bold uppercase tracking-wider', style.color)}>{shadow.rarity}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{shadow.title}</p>
                        {unlocked ? (
                          <p className="text-[11px] text-muted-foreground/70 mt-1">{shadow.bonusDesc}</p>
                        ) : (
                          <p className="text-[11px] text-muted-foreground/50 mt-1">🔒 {shadow.unlockCondition}</p>
                        )}
                      </div>

                      {/* Bonus */}
                      {unlocked && (
                        <div className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-lg border flex-shrink-0', style.border, style.bg)}>
                          <Zap className={cn('w-3 h-3', style.color)} />
                          <span className={cn('text-xs font-bold', style.color)}>{shadow.bonus}</span>
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
