import { motion } from 'framer-motion';
import { Shield, Star, Zap, Flame } from 'lucide-react';
import { AVATAR_OPTIONS } from './EditProfileModal';
import { PlayerStats } from '@/hooks/useGameState';
import { getHunterPower } from '@/lib/attributeXp';

interface PlayerCardProps {
  username: string;
  level: number;
  rank: string;
  currentXp: number;
  maxXp: number;
  avatarId?: string;
  streak?: number;
  questsCompleted?: number;
  bio?: string;
  stats?: PlayerStats;
}

const rankConfig: Record<string, { color: string; glow: string; bg: string; label: string; borderGlow: string }> = {
  S: { color: 'text-yellow-300', glow: 'shadow-yellow-500/50', bg: 'bg-yellow-500/10 border-yellow-500/30', label: 'S-Rank', borderGlow: '0 0 20px rgba(234,179,8,0.4)' },
  A: { color: 'text-red-400',    glow: 'shadow-red-500/50',    bg: 'bg-red-500/10 border-red-500/30',       label: 'A-Rank', borderGlow: '0 0 20px rgba(239,68,68,0.4)' },
  B: { color: 'text-purple-400', glow: 'shadow-purple-500/50', bg: 'bg-purple-500/10 border-purple-500/30', label: 'B-Rank', borderGlow: '0 0 20px rgba(168,85,247,0.4)' },
  C: { color: 'text-blue-400',   glow: 'shadow-blue-500/50',   bg: 'bg-blue-500/10 border-blue-500/30',     label: 'C-Rank', borderGlow: '0 0 20px rgba(59,130,246,0.4)' },
  D: { color: 'text-green-400',  glow: 'shadow-green-500/50',  bg: 'bg-green-500/10 border-green-500/30',   label: 'D-Rank', borderGlow: '0 0 20px rgba(34,197,94,0.4)' },
  E: { color: 'text-slate-400',  glow: 'shadow-slate-500/20',  bg: 'bg-slate-500/10 border-slate-500/30',   label: 'E-Rank', borderGlow: '0 0 8px rgba(148,163,184,0.2)' },
};

export const PlayerCard = ({ username, level, rank, currentXp, maxXp, avatarId = 'shadow', streak = 0, questsCompleted = 0, bio, stats }: PlayerCardProps) => {
  const xpPct = Math.min((currentXp / maxXp) * 100, 100);
  const rankLetter = rank.charAt(0).toUpperCase();
  const cfg = rankConfig[rankLetter] || rankConfig.E;
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0];
  const hunterPower = stats ? getHunterPower(stats) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden border border-white/10 bg-card grain top-light"
      style={{ boxShadow: 'var(--shadow-elevated)' }}
    >
      {/* Ambient top glow */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/12 to-transparent pointer-events-none" />

      <div className="relative p-5">
        <div className="flex items-start gap-5">

          {/* Avatar with animated gradient ring */}
          <div className="flex-shrink-0">
            <div className="relative">
              {/* Rotating gradient ring */}
              <div
                className="absolute -inset-1 rounded-2xl animate-border opacity-70"
                style={{ padding: '2px' }}
              />
              <div
                className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-xl ${cfg.glow}`}
                style={{ boxShadow: cfg.borderGlow }}
              >
                <img src={avatar.url} alt={username} className="w-full h-full object-cover" />
                {/* Level badge */}
                <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-white font-display font-black text-[11px] px-2 py-0.5 rounded-tl-lg rounded-br-xl shadow-lg">
                  LV.{level}
                </div>
              </div>
            </div>
          </div>

          {/* Info column */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-display text-xl font-bold text-white truncate">{username}</h2>
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
            </div>

            {bio && (
              <p className="text-xs text-muted-foreground italic mb-2 truncate">"{bio}"</p>
            )}

            {/* Rank badge */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold font-display mb-4 ${cfg.bg} ${cfg.color}`}>
              <Star className="w-3 h-3" />
              {rank}
            </div>

            {/* XP bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-label text-muted-foreground">Experience</span>
                <span className="text-caption font-display font-bold text-primary">
                  {currentXp.toLocaleString()} / {maxXp.toLocaleString()} XP
                </span>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-primary via-violet-400 to-secondary relative overflow-hidden xp-bar" style={{ boxShadow: "0 0 12px hsl(var(--primary)/0.6)" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatPill icon={<Zap    className="w-3.5 h-3.5" />} label="Power"  value={hunterPower > 0 ? hunterPower.toString() : '—'} color="text-primary"    bg="bg-primary/10 border-primary/20" />
          <StatPill icon={<Flame  className="w-3.5 h-3.5" />} label="Streak" value={`${streak}d`}                                    color="text-orange-400" bg="bg-orange-500/10 border-orange-500/20" />
          <StatPill icon={<Shield className="w-3.5 h-3.5" />} label="Quests" value={questsCompleted.toString()}                      color="text-violet-400" bg="bg-violet-500/10 border-violet-500/20" />
        </div>
      </div>
    </motion.div>
  );
};

const StatPill = ({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: string; color: string; bg: string }) => (
  <div className={`${bg} rounded-xl p-3 border transition-all duration-200 hover:scale-[1.02] top-light`}>
    <div className={`flex items-center gap-1.5 ${color} mb-1`}>
      {icon}
      <span className="text-label text-muted-foreground">{label}</span>
    </div>
    <span className="font-display font-bold text-sm text-foreground">{value}</span>
  </div>
);
