import { motion } from 'framer-motion';
import { GameState, AttributeStat } from '@/hooks/useGameState';
import { Achievement } from '@/hooks/useAchievements';
import { AVATAR_OPTIONS } from './EditProfileModal';
import { Trophy, Flame, Sword, Shield, Star, Crown, Zap, Target, Lock, CheckCircle2 } from 'lucide-react';
import { RadarChartComponent } from './RadarChart';
import { getHunterPower, getAttributeTitle } from '@/lib/attributeXp';
import { cn } from '@/lib/utils';

interface HunterProfileProps {
  gameState: GameState;
  achievements: Achievement[];
  unlockedCount: number;
  avatarId?: string;
  bio?: string;
  streak: number;
  earnedTitles?: string[];
}

const GATES_CLEARED = [
  { minQuests: 5,   name: 'Shadow Wolf',          rank: 'E', icon: '🐺', color: 'text-slate-400' },
  { minQuests: 25,  name: 'Iron Golem',            rank: 'D', icon: '🤖', color: 'text-green-400' },
  { minQuests: 75,  name: 'Hollow Magician',       rank: 'C', icon: '🧙', color: 'text-blue-400'  },
  { minQuests: 150, name: 'Ice Dragon',             rank: 'B', icon: '🐉', color: 'text-cyan-400'  },
  { minQuests: 300, name: "Demon King's General",  rank: 'A', icon: '😈', color: 'text-purple-400' },
  { minQuests: 500, name: 'The Architect',          rank: 'S', icon: '⚡', color: 'text-yellow-400' },
];

const TITLES = [
  { condition: (g: GameState) => g.level >= 1,                   title: 'Awakened',        color: 'text-slate-400'  },
  { condition: (g: GameState) => g.level >= 10,                  title: 'D-Rank Hunter',   color: 'text-green-400'  },
  { condition: (g: GameState) => g.level >= 20,                  title: 'C-Rank Hunter',   color: 'text-blue-400'   },
  { condition: (g: GameState) => g.level >= 30,                  title: 'B-Rank Hunter',   color: 'text-cyan-400'   },
  { condition: (g: GameState) => g.level >= 40,                  title: 'A-Rank Hunter',   color: 'text-purple-400' },
  { condition: (g: GameState) => g.level >= 50,                  title: 'S-Rank Hunter',   color: 'text-yellow-400' },
  { condition: (g: GameState) => g.totalQuestsCompleted >= 100,  title: 'Quest Master',    color: 'text-primary'    },
  { condition: (g: GameState) => g.totalQuestsCompleted >= 500,  title: 'Quest Legend',    color: 'text-yellow-400' },
];

const RANK_STYLES: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  'E-Rank Hunter':             { color: 'text-slate-400',  bg: 'from-slate-900/40',  border: 'border-slate-500/30',  glow: '' },
  'D-Rank Hunter':             { color: 'text-green-400',  bg: 'from-green-900/40',  border: 'border-green-500/40',  glow: 'shadow-green-500/20' },
  'C-Rank Hunter':             { color: 'text-blue-400',   bg: 'from-blue-900/40',   border: 'border-blue-500/40',   glow: 'shadow-blue-500/25' },
  'B-Rank Hunter':             { color: 'text-cyan-400',   bg: 'from-cyan-900/40',   border: 'border-cyan-500/40',   glow: 'shadow-cyan-500/25' },
  'A-Rank Hunter':             { color: 'text-purple-400', bg: 'from-purple-900/40', border: 'border-purple-500/50', glow: 'shadow-purple-500/30' },
  'S-Rank Hunter':             { color: 'text-yellow-400', bg: 'from-yellow-900/40', border: 'border-yellow-500/50', glow: 'shadow-yellow-400/40' },
  'National-Level Hunter':     { color: 'text-rose-400',   bg: 'from-rose-900/40',   border: 'border-rose-500/60',   glow: 'shadow-rose-500/50' },
};

export const HunterProfile = ({ gameState, achievements, unlockedCount, avatarId = 'shadow', bio, streak, earnedTitles = [] }: HunterProfileProps) => {
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0];
  const rankStyle = RANK_STYLES[gameState.rank] || RANK_STYLES['E-Rank Hunter'];
  const xpPct = Math.round((gameState.currentXp / gameState.maxXp) * 100);

  const clearedGates = GATES_CLEARED.filter(g => gameState.totalQuestsCompleted >= g.minQuests);
  const systemTitles = TITLES.filter(t => t.condition(gameState));
  const primaryTitle = systemTitles[systemTitles.length - 1];

  // statEntries correctly typed as AttributeStat — never cast to number
  const statEntries = Object.entries(gameState.stats || {}) as [string, AttributeStat][];
  const avgLevel = statEntries.length > 0
    ? Math.round(statEntries.reduce((sum, [, s]) => sum + s.level, 0) / statEntries.length)
    : 1;
  const hunterPower = getHunterPower(gameState.stats);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main character card */}
      <div className={cn('relative glass-strong rounded-2xl border overflow-hidden transition-all duration-250', rankStyle.border, rankStyle.glow && `shadow-lg ${rankStyle.glow}`)} style={{ boxShadow: 'var(--shadow-elevated)' }}>
        {/* Rank gradient bg */}
        <div className={cn('absolute inset-0 bg-gradient-to-br to-transparent pointer-events-none opacity-40', rankStyle.bg)} />

        <div className="relative p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={cn('w-24 h-24 rounded-2xl overflow-hidden border-2', avatar.border)}>
                <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-primary border-2 border-background flex items-center justify-center">
                <span className="text-[10px] font-display font-black text-white">{gameState.level}</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-2xl font-black text-foreground truncate">{gameState.username || 'Hunter'}</h2>
              {bio && <p className="text-sm text-muted-foreground italic mt-0.5">"{bio}"</p>}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={cn('px-2.5 py-1 rounded-lg text-xs font-bold border bg-background/40', rankStyle.color, rankStyle.border)}>
                  {gameState.rank}
                </span>
                {primaryTitle && (
                  <span className={cn('px-2.5 py-1 rounded-lg text-xs font-bold border border-white/10 bg-white/5', primaryTitle.color)}>
                    {primaryTitle.title}
                  </span>
                )}
              </div>

              {/* XP bar */}
              <div className="mt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-label text-muted-foreground">Level {gameState.level}</span>
                  <span className={rankStyle.color}>{gameState.currentXp.toLocaleString()} / {gameState.maxXp.toLocaleString()} XP</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${xpPct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    className={cn('h-full rounded-full bg-gradient-to-r', 'from-primary via-violet-400 to-primary/80')}
                    style={{ boxShadow: '0 0 8px hsl(var(--primary)/0.5)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { icon: <Flame className="w-4 h-4 text-orange-400" />, label: 'Streak',   value: `${streak}d`,                        color: 'text-orange-400' },
              { icon: <Target className="w-4 h-4 text-primary" />,   label: 'Quests',   value: gameState.totalQuestsCompleted,       color: 'text-primary' },
              { icon: <Trophy className="w-4 h-4 text-accent" />,    label: 'Badges',   value: `${unlockedCount}/${achievements.length}`, color: 'text-accent' },
              { icon: <Zap    className="w-4 h-4 text-yellow-400" />, label: 'Credits',  value: gameState.credits.toLocaleString(),   color: 'text-yellow-400' },
              { icon: <Zap    className="w-4 h-4 text-primary"    />, label: 'Power',    value: hunterPower,                          color: 'text-primary'    },
              { icon: <Shield className="w-4 h-4 text-cyan-400"   />, label: 'Gates',    value: `${clearedGates.length}/6`,           color: 'text-cyan-400'   },
            ].map((stat, i) => (
              <div key={i} className="bg-white/3 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-1.5 mb-1">{stat.icon}<span className="text-label text-muted-foreground">{stat.label}</span></div>
                <p className={cn('font-display font-bold text-sm', stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats spider chart */}
      {gameState.stats && <RadarChartComponent stats={gameState.stats} />}

      {/* Per-attribute breakdown — level + title for each stat */}
      <div className="glass rounded-2xl p-5 border border-white/10">
        <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-secondary" />
          Attributes
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {statEntries.map(([key, stat]) => {
            const title = getAttributeTitle(stat.level);
            return (
              <div
                key={key}
                className="flex items-center justify-between py-1.5 px-1 border-b border-white/5 last:border-0"
              >
                {/* Stat key */}
                <span className="font-display font-bold text-xs text-muted-foreground w-10">
                  {key}
                </span>
                {/* Level — primary info */}
                <span className="font-display font-bold text-sm text-foreground flex-1">
                  Level {stat.level}
                </span>
                {/* Title — secondary, visually smaller */}
                <span className="text-label text-muted-foreground">
                  {title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="glass rounded-2xl p-5 border border-white/10 hover:border-white/15 transition-all duration-250">
        <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <Crown className="w-4 h-4 text-accent" /> Defeated Bosses
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {GATES_CLEARED.map(gate => {
            const cleared = gameState.totalQuestsCompleted >= gate.minQuests;
            return (
              <div key={gate.name} className={cn('flex items-center gap-2 p-2.5 rounded-xl border transition-all',
                cleared ? 'bg-white/4 border-white/10' : 'bg-white/2 border-white/5 opacity-40'
              )}>
                <span className="text-xl">{gate.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-caption font-bold truncate', cleared ? gate.color : 'text-muted-foreground')}>{gate.name}</p>
                  <p className="text-label text-muted-foreground">{gate.rank}-Rank</p>
                </div>
                {cleared
                  ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  : <Lock className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Titles */}
      <div className="glass rounded-2xl p-5 border border-white/10 hover:border-white/15 transition-all duration-250">
        <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" /> Earned Titles
        </h3>
        <div className="flex flex-wrap gap-2">
          {/* Level/quest titles */}
          {systemTitles.map(t => {
            const earned = true;
            return (
              <span key={t.title} className={cn('px-3 py-1.5 rounded-xl text-caption font-bold border transition-all',
                earned ? `${t.color} border-white/15 bg-white/5` : 'text-muted-foreground/20 border-white/5 bg-white/2'
              )}>
                {earned ? t.title : '???'}
              </span>
            );
          })}
          {/* Gate defeat titles */}
          {earnedTitles.map(title => (
            <span key={title} className="px-3 py-1.5 rounded-xl text-xs font-bold border text-amber-400 border-amber-500/40 bg-amber-500/10">
              ⚔️ {title}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
