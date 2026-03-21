import { motion } from 'framer-motion';
import { Lock, Shield, Skull, Check, Trophy, Star, Zap, Crown, Flame, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GateEncounterProps {
  level: number;
  totalQuestsCompleted: number;
  currentStreak: number;
}

const GATES = [
  {
    minLevel: 1,
    name: 'Shadow Wolf',
    nameJp: 'シャドウウルフ',
    rank: 'E-RANK',
    rankColor: 'text-slate-400',
    rankBg: 'bg-slate-500/20 border-slate-500/30',
    bossColor: 'text-slate-400',
    bgGradient: 'from-slate-900/50 via-card to-slate-900/30',
    challenge: 'Complete 5 quests',
    challengeTarget: 5,
    challengeType: 'quests' as const,
    rewards: { xp: 100, credits: 30, title: 'Wolf Slayer' },
    description: 'Your first gate. A shadow wolf lurks. Complete 5 quests to defeat it.',
    icon: '🐺',
  },
  {
    minLevel: 5,
    name: 'Iron Golem',
    nameJp: 'アイアンゴーレム',
    rank: 'D-RANK',
    rankColor: 'text-green-400',
    rankBg: 'bg-green-500/20 border-green-500/30',
    bossColor: 'text-green-400',
    bgGradient: 'from-green-950/50 via-card to-green-950/30',
    challenge: 'Complete 25 quests',
    challengeTarget: 25,
    challengeType: 'quests' as const,
    rewards: { xp: 300, credits: 80, title: 'Golem Breaker' },
    description: 'A mechanical titan. Requires sustained effort to crack open.',
    icon: '🤖',
  },
  {
    minLevel: 10,
    name: 'Hollow Magician',
    nameJp: 'ホロウ・マジシャン',
    rank: 'C-RANK',
    rankColor: 'text-blue-400',
    rankBg: 'bg-blue-500/20 border-blue-500/30',
    bossColor: 'text-blue-400',
    bgGradient: 'from-blue-950/50 via-card to-blue-950/30',
    challenge: 'Maintain a 7-day streak',
    challengeTarget: 7,
    challengeType: 'streak' as const,
    rewards: { xp: 600, credits: 150, title: 'Arcane Slayer' },
    description: 'A master of illusions. Only true consistency can pierce its defenses.',
    icon: '🧙',
  },
  {
    minLevel: 20,
    name: 'Ice Dragon',
    nameJp: 'アイスドラゴン',
    rank: 'B-RANK',
    rankColor: 'text-cyan-400',
    rankBg: 'bg-cyan-500/20 border-cyan-500/30',
    bossColor: 'text-cyan-400',
    bgGradient: 'from-cyan-950/50 via-card to-cyan-950/30',
    challenge: 'Complete 75 quests',
    challengeTarget: 75,
    challengeType: 'quests' as const,
    rewards: { xp: 1500, credits: 400, title: 'Dragon Slayer' },
    description: 'Ancient and merciless. Its ice breath freezes those who lack determination.',
    icon: '🐉',
  },
  {
    minLevel: 30,
    name: 'Demon King\'s General',
    nameJp: '魔王の将軍',
    rank: 'A-RANK',
    rankColor: 'text-purple-400',
    rankBg: 'bg-purple-500/20 border-purple-500/30',
    bossColor: 'text-purple-400',
    bgGradient: 'from-purple-950/50 via-card to-purple-950/30',
    challenge: 'Maintain a 30-day streak',
    challengeTarget: 30,
    challengeType: 'streak' as const,
    rewards: { xp: 3000, credits: 800, title: 'Demon Slayer' },
    description: 'Second only to the Demon King himself. Only the most disciplined hunters can prevail.',
    icon: '😈',
  },
  {
    minLevel: 50,
    name: 'The Architect',
    nameJp: 'アーキテクト',
    rank: 'S-RANK',
    rankColor: 'text-yellow-400',
    rankBg: 'bg-yellow-500/20 border-yellow-500/30',
    bossColor: 'text-yellow-400',
    bgGradient: 'from-yellow-950/50 via-card to-amber-950/30',
    challenge: 'Complete 200 quests with 100-day streak',
    challengeTarget: 200,
    challengeType: 'quests' as const,
    rewards: { xp: 10000, credits: 3000, title: 'Shadow Monarch' },
    description: 'The final test. The Architect created the system itself. Only the worthy can face it.',
    icon: '⚡',
  },
];

export const GateEncounter = ({ level, totalQuestsCompleted, currentStreak }: GateEncounterProps) => {
  // Find the current gate for this level
  const availableGates = GATES.filter(g => level >= g.minLevel);
  const currentGate = availableGates[availableGates.length - 1] || GATES[0];
  const nextGate = GATES.find(g => level < g.minLevel);

  const getProgress = (gate: typeof GATES[0]) => {
    if (gate.challengeType === 'streak') return Math.min(currentStreak, gate.challengeTarget);
    return Math.min(totalQuestsCompleted, gate.challengeTarget);
  };

  const progress = getProgress(currentGate);
  const isDefeated = progress >= currentGate.challengeTarget;
  const pct = Math.min(100, (progress / currentGate.challengeTarget) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Boss Header */}
      <div className={cn('relative h-48 bg-gradient-to-br p-6', currentGate.bgGradient)}>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('px-3 py-1 rounded-full text-sm font-display font-semibold border', currentGate.rankBg, currentGate.rankColor)}>
                {currentGate.rank}
              </div>
              {isDefeated && (
                <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-display font-semibold">
                  DEFEATED
                </div>
              )}
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">{currentGate.name}</h2>
            <p className="text-muted-foreground font-jp text-lg mt-1">{currentGate.nameJp}</p>
          </div>
          <div className={cn('w-24 h-24 rounded-2xl border flex items-center justify-center text-5xl', `bg-gradient-to-br ${currentGate.bgGradient}`, `border-${currentGate.bossColor}/30`)}>
            {currentGate.icon}
          </div>
        </div>
      </div>

      {/* Challenge Info */}
      <div className="p-6">
        <p className="text-muted-foreground mb-5">{currentGate.description}</p>

        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-foreground">Challenge: {currentGate.challenge}</h3>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-display font-bold text-foreground">{progress}/{currentGate.challengeTarget}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={cn('h-full rounded-full bg-gradient-to-r', isDefeated ? 'from-green-500 to-emerald-400' : 'from-primary via-secondary to-accent')}
            />
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-card rounded-xl p-4 border border-white/5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-accent" />
            <h4 className="font-display font-bold text-foreground">Victory Rewards</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="font-display font-bold text-lg text-primary">+{currentGate.rewards.xp}</p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-lg text-accent">+{currentGate.rewards.credits}</p>
              <p className="text-xs text-muted-foreground">Credits</p>
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-sm text-secondary">{currentGate.rewards.title}</p>
              <p className="text-xs text-muted-foreground">Title</p>
            </div>
          </div>
        </div>

        {/* Next gate preview */}
        {nextGate && (
          <div className="p-3 rounded-xl bg-muted/20 border border-white/5 flex items-center gap-3">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Next: {nextGate.name}</p>
              <p className="text-xs text-muted-foreground/60">Unlocks at Level {nextGate.minLevel}</p>
            </div>
            <span className="ml-auto text-xl">{nextGate.icon}</span>
          </div>
        )}

        {!nextGate && isDefeated && (
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
            <Crown className="w-4 h-4 text-yellow-400" />
            <p className="text-sm text-yellow-400 font-semibold">You have conquered all gates. You ARE the System.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
