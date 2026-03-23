import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Shield, Check, Trophy, ChevronDown, ChevronUp, Swords, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const GATES = [
  {
    id: 'shadow_wolf',    minLevel: 1,  minQuests: 5,   minStreak: 0,
    name: 'Shadow Wolf',          jp: 'シャドウウルフ',     rank: 'E', icon: '🐺',
    rankColor: 'text-slate-400',  rankBg: 'bg-slate-500/20 border-slate-500/30',
    headerBg: 'from-slate-900/60 via-slate-800/20',
    challengeType: 'quests' as const, challengeTarget: 5,
    challenge: 'Complete 5 quests',
    lore: 'A wolf born from shadows. It hunts those who lack resolve. Complete your quests to drive it back.',
    rewards: { xp: 100, credits: 30, title: 'Wolf Slayer' },
  },
  {
    id: 'iron_golem',     minLevel: 5,  minQuests: 25,  minStreak: 0,
    name: 'Iron Golem',           jp: 'アイアンゴーレム',   rank: 'D', icon: '🤖',
    rankColor: 'text-green-400',  rankBg: 'bg-green-500/20 border-green-500/30',
    headerBg: 'from-green-950/60 via-green-900/20',
    challengeType: 'quests' as const, challengeTarget: 25,
    challenge: 'Complete 25 quests',
    lore: 'Forged from iron willpower. This golem does not yield to those who skip training days.',
    rewards: { xp: 300, credits: 80, title: 'Golem Breaker' },
  },
  {
    id: 'cursed_knight',  minLevel: 8,  minQuests: 0,   minStreak: 7,
    name: 'Cursed Knight',        jp: 'カーストナイト',     rank: 'D', icon: '⚔️',
    rankColor: 'text-green-400',  rankBg: 'bg-green-500/20 border-green-500/30',
    headerBg: 'from-emerald-950/60 via-emerald-900/20',
    challengeType: 'streak' as const, challengeTarget: 7,
    challenge: 'Maintain a 7-day streak',
    lore: 'A knight cursed for his inconsistency. Only those who never miss a day can break the curse.',
    rewards: { xp: 250, credits: 70, title: 'Curse Breaker' },
  },
  {
    id: 'hollow_magician', minLevel: 10, minQuests: 50, minStreak: 0,
    name: 'Hollow Magician',      jp: 'ホロウマジシャン',   rank: 'C', icon: '🧙',
    rankColor: 'text-blue-400',   rankBg: 'bg-blue-500/20 border-blue-500/30',
    headerBg: 'from-blue-950/60 via-blue-900/20',
    challengeType: 'quests' as const, challengeTarget: 50,
    challenge: 'Complete 50 quests',
    lore: 'A master of illusions who shows you your own weakness. Destroy it with relentless action.',
    rewards: { xp: 500, credits: 120, title: 'Arcane Slayer' },
  },
  {
    id: 'storm_bringer',  minLevel: 15, minQuests: 0,  minStreak: 14,
    name: 'Storm Bringer',        jp: 'ストームブリンガー', rank: 'C', icon: '⛈️',
    rankColor: 'text-blue-400',   rankBg: 'bg-blue-500/20 border-blue-500/30',
    headerBg: 'from-indigo-950/60 via-indigo-900/20',
    challengeType: 'streak' as const, challengeTarget: 14,
    challenge: 'Maintain a 14-day streak',
    lore: 'Born from a tempest of failed resolutions. Two weeks of consistency will silence the storm.',
    rewards: { xp: 600, credits: 150, title: 'Storm Tamer' },
  },
  {
    id: 'ice_dragon',     minLevel: 20, minQuests: 100, minStreak: 0,
    name: 'Ice Dragon',           jp: 'アイスドラゴン',     rank: 'B', icon: '🐉',
    rankColor: 'text-cyan-400',   rankBg: 'bg-cyan-500/20 border-cyan-500/30',
    headerBg: 'from-cyan-950/60 via-cyan-900/20',
    challengeType: 'quests' as const, challengeTarget: 100,
    challenge: 'Complete 100 quests',
    lore: 'Ancient and merciless. Its ice breath freezes those who lack determination. 100 quests to melt it.',
    rewards: { xp: 1000, credits: 250, title: 'Dragon Slayer' },
  },
  {
    id: 'shadow_tyrant',  minLevel: 25, minQuests: 0,  minStreak: 21,
    name: 'Shadow Tyrant',        jp: 'シャドウタイラント', rank: 'B', icon: '👹',
    rankColor: 'text-cyan-400',   rankBg: 'bg-cyan-500/20 border-cyan-500/30',
    headerBg: 'from-teal-950/60 via-teal-900/20',
    challengeType: 'streak' as const, challengeTarget: 21,
    challenge: 'Maintain a 21-day streak',
    lore: 'Three weeks. That is how long it takes to forge a real habit. The Tyrant knows this. Do you?',
    rewards: { xp: 1200, credits: 300, title: 'Tyrant\'s Bane' },
  },
  {
    id: 'demon_general',  minLevel: 30, minQuests: 200, minStreak: 0,
    name: "Demon King's General", jp: '魔王の将軍',          rank: 'A', icon: '😈',
    rankColor: 'text-purple-400', rankBg: 'bg-purple-500/20 border-purple-500/30',
    headerBg: 'from-purple-950/60 via-purple-900/20',
    challengeType: 'quests' as const, challengeTarget: 200,
    challenge: 'Complete 200 quests',
    lore: 'Second only to the Demon King. His power feeds on your procrastination. 200 quests to starve him.',
    rewards: { xp: 2000, credits: 500, title: 'Demon Slayer' },
  },
  {
    id: 'eternal_soldier', minLevel: 35, minQuests: 0, minStreak: 30,
    name: 'Eternal Soldier',      jp: 'エターナルソルジャー', rank: 'A', icon: '⚔️',
    rankColor: 'text-purple-400', rankBg: 'bg-purple-500/20 border-purple-500/30',
    headerBg: 'from-violet-950/60 via-violet-900/20',
    challengeType: 'streak' as const, challengeTarget: 30,
    challenge: 'Maintain a 30-day streak',
    lore: 'An immortal soldier who fought for 30 years without rest. Match his commitment for 30 days.',
    rewards: { xp: 2500, credits: 600, title: 'Iron Will' },
  },
  {
    id: 'the_architect',  minLevel: 50, minQuests: 500, minStreak: 0,
    name: 'The Architect',        jp: 'アーキテクト',       rank: 'S', icon: '⚡',
    rankColor: 'text-yellow-400', rankBg: 'bg-yellow-500/20 border-yellow-500/30',
    headerBg: 'from-yellow-950/60 via-amber-900/20',
    challengeType: 'quests' as const, challengeTarget: 500,
    challenge: 'Complete 500 quests',
    lore: 'The creator of the System itself. It watches, evaluates, and judges. Only 500 quests will earn its respect.',
    rewards: { xp: 10000, credits: 3000, title: 'Shadow Monarch' },
  },
];

interface GateEncounterProps {
  level: number;
  totalQuestsCompleted: number;
  currentStreak: number;
  onGateDefeated?: (gateId: string, title: string, xp: number, credits: number) => void;
}

const DEFEATED_STORAGE = 'system-gates-rewarded';
const getRewardedGates = (): string[] => {
  try { return JSON.parse(localStorage.getItem(DEFEATED_STORAGE) || '[]'); } catch { return []; }
};

const PortalAnimation = ({ color }: { color: string }) => (
  <div className="relative w-20 h-20 flex-shrink-0">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute inset-0 rounded-full border"
        style={{ borderColor: color, opacity: 0.3 - i * 0.08 }}
        animate={{ scale: [1, 1.3 + i * 0.15, 1], opacity: [0.3 - i * 0.08, 0.1, 0.3 - i * 0.08] }}
        transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
      />
    ))}
    <motion.div
      className="absolute inset-2 rounded-full"
      style={{ background: `radial-gradient(circle, ${color}40 0%, transparent 70%)` }}
      animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.05, 0.9] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
    <div className="absolute inset-0 flex items-center justify-center text-4xl">{GATES[0].icon}</div>
  </div>
);

const getGateProgress = (gate: typeof GATES[0], totalQuestsCompleted: number, currentStreak: number) =>
  gate.challengeType === 'streak'
    ? Math.min(currentStreak, gate.challengeTarget)
    : Math.min(totalQuestsCompleted, gate.challengeTarget);

export const GateEncounter = ({ level, totalQuestsCompleted, currentStreak, onGateDefeated }: GateEncounterProps) => {
  const [expandedGate, setExpandedGate] = useState<string | null>(null);
  const rewardedRef = useRef<string[]>(getRewardedGates());

  // Detect newly defeated gates and award titles/rewards
  useEffect(() => {
    const alreadyRewarded = rewardedRef.current;
    GATES.forEach(gate => {
      const defeated = getGateProgress(gate, totalQuestsCompleted, currentStreak) >= gate.challengeTarget;
      if (defeated && !alreadyRewarded.includes(gate.id) && onGateDefeated) {
        onGateDefeated(gate.id, gate.rewards.title, gate.rewards.xp, gate.rewards.credits);
        const updated = [...alreadyRewarded, gate.id];
        rewardedRef.current = updated;
        localStorage.setItem(DEFEATED_STORAGE, JSON.stringify(updated));
      }
    });
  }, [totalQuestsCompleted, currentStreak, level]);



  const isUnlocked = (gate: typeof GATES[0]) =>
    level >= gate.minLevel &&
    (gate.minQuests === 0 || totalQuestsCompleted >= gate.minQuests) &&
    (gate.minStreak === 0 || currentStreak >= gate.minStreak);

  const isDefeated = (gate: typeof GATES[0]) =>
    getGateProgress(gate, totalQuestsCompleted, currentStreak) >= gate.challengeTarget;

  const availableGates = GATES.filter(g => level >= g.minLevel - 3); // show slightly ahead

  return (
    <div className="space-y-3">
      {availableGates.map((gate, gi) => {
        const unlocked = isUnlocked(gate);
        const defeated = isDefeated(gate);
        const progress = getGateProgress(gate, totalQuestsCompleted, currentStreak);
        const pct = Math.min(100, (progress / gate.challengeTarget) * 100);
        const isExpanded = expandedGate === gate.id;

        return (
          <motion.div
            key={gate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.06 }}
            className={cn(
              'glass rounded-2xl border overflow-hidden transition-all duration-300',
              defeated ? 'border-green-500/40 shadow-[0_0_16px_rgba(34,197,94,0.1)]' :
              unlocked ? 'border-white/10 hover:border-primary/30 hover:shadow-[var(--shadow-glow-primary)]' :
              'border-white/5 opacity-50'
            )}
          >
            {/* Gate header */}
            <button
              onClick={() => setExpandedGate(isExpanded ? null : gate.id)}
              className="w-full text-left"
            >
              <div className={cn('relative p-4 bg-gradient-to-r to-transparent', gate.headerBg)}>
                <div className="flex items-center gap-4">
                  {/* Portal/boss icon with animation */}
                  <motion.div
                    animate={unlocked && !defeated ? {
                      filter: ['drop-shadow(0 0 8px rgba(139,92,246,0.3))', 'drop-shadow(0 0 20px rgba(139,92,246,0.6))', 'drop-shadow(0 0 8px rgba(139,92,246,0.3))']
                    } : {}}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 flex-shrink-0',
                      defeated ? 'bg-green-500/15 border-green-500/30' :
                      unlocked ? 'bg-black/30 border-white/15' :
                      'bg-black/20 border-white/8 grayscale'
                    )}
                  >
                    {defeated ? '✅' : gate.icon}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold border', gate.rankBg, gate.rankColor)}>
                        {gate.rank}-RANK
                      </span>
                      {defeated && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-500/20 border border-green-500/30 text-green-400">DEFEATED</span>}
                      {!unlocked && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 border border-white/10 text-muted-foreground">LOCKED Lv.{gate.minLevel}</span>}
                    </div>
                    <h3 className="font-display font-bold text-foreground text-lg truncate">{gate.name}</h3>
                    <p className="text-caption text-muted-foreground font-jp">{gate.jp}</p>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <p className={cn('font-display font-bold text-sm', gate.rankColor)}>{progress}/{gate.challengeTarget}</p>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', defeated ? 'bg-green-500' : 'bg-gradient-to-r from-primary via-secondary to-accent')}
                    style={!defeated ? { boxShadow: '0 0 10px hsl(var(--primary)/0.6)' } : { boxShadow: '0 0 8px rgba(34,197,94,0.5)' }}
                  />
                </div>
              </div>
            </button>

            {/* Expanded detail */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-white/5"
                >
                  <div className="p-4 space-y-4">
                    <p className="text-sm text-muted-foreground italic">"{gate.lore}"</p>

                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                      <p className="text-sm font-semibold text-foreground">{gate.challenge}</p>
                    </div>

                    {/* Rewards */}
                    <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-accent" />
                        <p className="text-xs font-bold text-foreground">Victory Rewards</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="font-display font-bold text-primary">+{gate.rewards.xp}</p>
                          <p className="text-[10px] text-muted-foreground">XP</p>
                        </div>
                        <div className="text-center">
                          <p className="font-display font-bold text-accent">+{gate.rewards.credits}</p>
                          <p className="text-[10px] text-muted-foreground">Credits</p>
                        </div>
                        <div className="text-center">
                          <p className="font-display font-bold text-secondary text-xs">{gate.rewards.title}</p>
                          <p className="text-[10px] text-muted-foreground">Title</p>
                        </div>
                      </div>
                    </div>

                    {!unlocked && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-white/5">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          Requires Level {gate.minLevel}
                          {gate.minQuests > 0 && ` · ${gate.minQuests} quests`}
                          {gate.minStreak > 0 && ` · ${gate.minStreak}-day streak`}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};
