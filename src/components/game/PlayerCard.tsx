import { motion } from 'framer-motion';
import { Shield, Star, Zap } from 'lucide-react';

interface PlayerCardProps {
  username: string;
  level: number;
  rank: string;
  currentXp: number;
  maxXp: number;
  avatarId?: string;
  streak?: number;
  questsCompleted?: number;
}

// Avatar images mapping
const avatarImages: Record<string, string> = {
  default: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=hunter1&backgroundColor=1a1a2e',
  warrior: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=warrior&backgroundColor=2d1b4e',
  mage: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=mage&backgroundColor=1b2d4e',
  rogue: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=rogue&backgroundColor=1b4e2d',
  knight: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=knight&backgroundColor=4e1b1b',
  sage: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=sage&backgroundColor=4e4e1b',
};

export const PlayerCard = ({ username, level, rank, currentXp, maxXp, avatarId = 'default', streak = 0, questsCompleted = 0 }: PlayerCardProps) => {
  const xpPercentage = (currentXp / maxXp) * 100;
  const avatarSrc = avatarImages[avatarId] || avatarImages.default;
  const rankLetter = rank.charAt(0);

  const getRankColor = () => {
    switch (rankLetter) {
      case 'S': return 'rank-s';
      case 'A': return 'rank-a';
      case 'B': return 'rank-b';
      case 'C': return 'rank-c';
      case 'D': return 'rank-d';
      default: return 'rank-e';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border-glow-primary relative overflow-hidden"
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <div className="relative z-10 flex items-start gap-5">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-primary/30 bg-card shadow-lg shadow-primary/10">
            <img
              src={avatarSrc}
              alt={username}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Level badge */}
          <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground font-display font-bold text-sm px-2 py-1 rounded-lg shadow-lg glow-primary">
            LV.{level}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-display text-2xl font-bold text-foreground">{username}</h2>
            <Shield className="w-5 h-5 text-primary" />
          </div>
          
          {/* Rank badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${getRankColor()} mb-4`}>
            <Star className="w-4 h-4" />
            <span className="font-display font-semibold text-sm">{rank}</span>
          </div>

          {/* XP Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Experience</span>
              <span className="font-display text-primary font-semibold">
                {currentXp.toLocaleString()} / {maxXp.toLocaleString()} XP
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary via-purple-400 to-primary-glow rounded-full xp-bar"
              />
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="relative z-10 mt-6 grid grid-cols-3 gap-3">
        <QuickStat icon={<Zap className="w-4 h-4" />} label="Active Boost" value="1.0x" color="accent" />
        <QuickStat icon={<Star className="w-4 h-4" />} label="Streak" value={`${streak} days`} color="primary" />
        <QuickStat icon={<Shield className="w-4 h-4" />} label="Quests Done" value={questsCompleted.toString()} color="secondary" />
      </div>
    </motion.div>
  );
};

const QuickStat = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) => (
  <div className="bg-card-elevated/50 rounded-lg p-3 border border-white/5">
    <div className={`flex items-center gap-2 text-${color} mb-1`}>
      {icon}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <span className="font-display font-bold text-foreground">{value}</span>
  </div>
);
