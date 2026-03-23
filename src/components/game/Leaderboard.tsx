import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Flame, Target, Star, Users, ChevronRight, Loader2, Zap, Shield, Sword } from 'lucide-react';
import { PlayerProfileModal } from './PlayerProfileModal';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  level: number;
  score: number;
  label: string;
  rankTitle: string;
}

const categories = [
  { id: 'overall', title: 'Overall Power', japLabel: '総合力', icon: <Zap className="w-4 h-4" />, desc: 'Balanced score across all stats' },
  { id: 'level',   title: 'Highest Level', japLabel: '最高レベル', icon: <Crown className="w-4 h-4" />, desc: 'Players with highest levels' },
  { id: 'quests',  title: 'Quest Masters', japLabel: 'クエストマスター', icon: <Target className="w-4 h-4" />, desc: 'Most quests completed' },
  { id: 'streak',  title: 'Most Dedicated', japLabel: '献身的', icon: <Flame className="w-4 h-4" />, desc: 'Longest active streak' },
  { id: 'credits', title: 'Wealthiest', japLabel: '富裕層', icon: <Star className="w-4 h-4" />, desc: 'Highest credit balance' },
];

// Rank icon based on hunter rank string
const RankBadge = ({ level, size = 'sm' }: { level: number; size?: 'sm' | 'lg' }) => {
  const s = size === 'lg' ? 'w-12 h-12 text-2xl' : 'w-10 h-10 text-xl';
  if (level >= 50) return <div className={cn(s, 'rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center')}>⚡</div>;
  if (level >= 40) return <div className={cn(s, 'rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center')}>🔮</div>;
  if (level >= 30) return <div className={cn(s, 'rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center')}>🌊</div>;
  if (level >= 20) return <div className={cn(s, 'rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center')}>🗡️</div>;
  if (level >= 10) return <div className={cn(s, 'rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center')}>🛡️</div>;
  return <div className={cn(s, 'rounded-xl bg-slate-500/20 border border-slate-500/30 flex items-center justify-center')}>⚔️</div>;
};

interface LeaderboardProps {
  currentUsername?: string;
  currentLevel?: number;
}

export const Leaderboard = ({ currentUsername = 'You', currentLevel = 1 }: LeaderboardProps) => {
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<{id: string; username: string} | null>(null);

  const fetchLeaderboard = async (catId: string) => {
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from('leaderboard_view')
        .select('user_id, username, avatar_id, level, total_quests_completed, credits, achievements, longest_streak, current_streak');

      if (error || !rows) { setData([]); return; }

      const scored = rows.map(r => {
        const stats = {
          level: r.level || 0,
          quests: r.total_quests_completed || 0,
          streak: Math.max(r.longest_streak || 0, r.current_streak || 0),
          credits: r.credits || 0,
          achievements: Array.isArray(r.achievements) ? r.achievements.length : 0,
        };
        // Overall = weighted mix of all stats
        const overall = Math.round(
          stats.level * 20 +
          stats.quests * 2 +
          stats.streak * 5 +
          Math.sqrt(stats.credits) * 3 +
          stats.achievements * 10
        );
        return { ...r, ...stats, overall };
      });

      const sorted = [...scored].sort((a, b) => {
        if (catId === 'overall') return b.overall - a.overall;
        if (catId === 'quests')  return b.quests  - a.quests;
        if (catId === 'streak')  return b.streak  - a.streak;
        if (catId === 'credits') return b.credits - a.credits;
        return b.level - a.level;
      });

      const getRankTitle = (level: number) => {
        if (level >= 50) return 'S-Rank';
        if (level >= 40) return 'A-Rank';
        if (level >= 30) return 'B-Rank';
        if (level >= 20) return 'C-Rank';
        if (level >= 10) return 'D-Rank';
        return 'E-Rank';
      };

      const entries: LeaderboardEntry[] = sorted.slice(0, 15).map((r, i) => {
        const score = catId === 'overall' ? r.overall : catId === 'quests' ? r.quests : catId === 'streak' ? r.streak : catId === 'credits' ? r.credits : r.level;
        const label = catId === 'overall' ? 'Power' : catId === 'quests' ? 'Quests' : catId === 'streak' ? 'Day Streak' : catId === 'credits' ? 'Credits' : 'Level';
        return { id: r.user_id, rank: i + 1, username: r.username || 'Hunter', level: r.level || 1, score, label, rankTitle: getRankTitle(r.level || 1) };
      });

      setData(entries);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const myIdx = sorted.findIndex(r => r.user_id === user.id);
        setMyRank(myIdx >= 0 ? myIdx + 1 : null);
      }
    } catch (e) {
      console.error('Leaderboard error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaderboard(selectedCategory); }, [selectedCategory]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <span className="medal-gold font-display font-black text-lg">👑</span>;
    if (rank === 2) return <span className="medal-silver font-display font-black text-base">🥈</span>;
    if (rank === 3) return <span className="medal-bronze font-display font-black text-base">🥉</span>;
    return <span className="text-caption font-display font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/40 shadow-[0_0_16px_rgba(234,179,8,0.15)]';
    if (rank === 2) return 'bg-gradient-to-r from-slate-400/15 to-slate-500/5 border-slate-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/15 to-orange-600/5 border-amber-600/30';
    return 'bg-card/50 border-white/5';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Leaderboards</h2>
            <p className="text-xs text-muted-foreground font-jp">ランキング</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{format(new Date(), 'MMM d, yyyy')}</span>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
            className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
              selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}>
            {cat.icon}
            <span className="hidden sm:inline">{cat.title}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No players yet. Be the first!</div>
      ) : (
        <div className="space-y-2">
          {data.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className={cn('flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer', getRankStyle(entry.rank))}
              onClick={() => setSelectedPlayer({ id: entry.id, username: entry.username })}>
              <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center flex-shrink-0">
                {getRankIcon(entry.rank)}
              </div>
              {/* Rank icon instead of avatar photo */}
              <RankBadge level={entry.level} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{entry.username}</p>
                <p className="text-xs text-muted-foreground">{entry.rankTitle} • Lv.{entry.level}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-primary text-base">{entry.score.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{entry.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Your Position */}
      <div className="mt-5 p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-3">
        <RankBadge level={currentLevel} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">{currentUsername}</p>
          <p className="text-xs text-muted-foreground">{myRank ? `Rank #${myRank}` : 'Unranked'} • Keep climbing!</p>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <span className="font-bold text-sm">Lv.{currentLevel}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Player profile modal */}
      {selectedPlayer && (
        <PlayerProfileModal
          userId={selectedPlayer.id}
          username={selectedPlayer.username}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </motion.div>
  );
};
