import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Flame, Target, Star, Users, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatarId: string;
  value: number;
  label: string;
}

interface LeaderboardCategory {
  id: string;
  title: string;
  japLabel: string;
  icon: React.ReactNode;
  description: string;
  valueLabel: string;
  dbColumn: string;
}

const categories: LeaderboardCategory[] = [
  { id: 'level', title: 'Highest Level', japLabel: '最高レベル', icon: <Crown className="w-5 h-5" />, description: 'Players with the highest levels', valueLabel: 'Level', dbColumn: 'level' },
  { id: 'dedication', title: 'Most Dedicated', japLabel: '献身的', icon: <Flame className="w-5 h-5" />, description: 'Longest active streaks', valueLabel: 'Day Streak', dbColumn: 'longest_streak' },
  { id: 'quests', title: 'Quest Masters', japLabel: 'クエストマスター', icon: <Target className="w-5 h-5" />, description: 'Most quests completed', valueLabel: 'Quests', dbColumn: 'total_quests_completed' },
  { id: 'achievements', title: 'Achievement Hunters', japLabel: '実績ハンター', icon: <Trophy className="w-5 h-5" />, description: 'Most achievements unlocked', valueLabel: 'Achievements', dbColumn: 'achievements' },
  { id: 'credits', title: 'Wealthiest', japLabel: '富裕層', icon: <Star className="w-5 h-5" />, description: 'Highest credit balance', valueLabel: 'Credits', dbColumn: 'credits' },
];

interface LeaderboardProps {
  currentUsername?: string;
  currentLevel?: number;
}

export const Leaderboard = ({ currentUsername = 'You', currentLevel = 1 }: LeaderboardProps) => {
  const [selectedCategory, setSelectedCategory] = useState('level');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentUserValue, setCurrentUserValue] = useState<number>(0);

  const fetchLeaderboard = async (categoryId: string) => {
    setLoading(true);
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;

      // Query the view
      let query = supabase
        .from('leaderboard_view')
        .select('user_id, username, avatar_id, level, total_quests_completed, credits, achievements, longest_streak, current_streak');

      const { data, error } = await query;
      
      if (error) {
        console.error('Leaderboard fetch error:', error);
        return;
      }

      if (!data || data.length === 0) {
        setLeaderboardData([]);
        return;
      }

      // Sort and map based on category
      const sorted = [...data].sort((a, b) => {
        if (categoryId === 'achievements') {
          const aCount = Array.isArray(a.achievements) ? a.achievements.length : 0;
          const bCount = Array.isArray(b.achievements) ? b.achievements.length : 0;
          return bCount - aCount;
        }
        const aVal = (a as any)[category.dbColumn] || 0;
        const bVal = (b as any)[category.dbColumn] || 0;
        return bVal - aVal;
      });

      const entries: LeaderboardEntry[] = sorted.slice(0, 15).map((entry, index) => {
        let value: number;
        if (categoryId === 'achievements') {
          value = Array.isArray(entry.achievements) ? entry.achievements.length : 0;
        } else if (categoryId === 'dedication') {
          value = entry.longest_streak || entry.current_streak || 0;
        } else {
          value = (entry as any)[category.dbColumn] || 0;
        }

        return {
          id: entry.user_id,
          rank: index + 1,
          username: entry.username || 'Hunter',
          avatarId: entry.avatar_id || 'default',
          value,
          label: category.valueLabel,
        };
      });

      setLeaderboardData(entries);

      // Find current user rank
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userEntry = entries.find(e => e.id === user.id);
        if (userEntry) {
          setCurrentUserRank(userEntry.rank);
          setCurrentUserValue(userEntry.value);
        } else {
          // User exists but not in top 15
          const userInAll = sorted.findIndex(e => e.user_id === user.id);
          setCurrentUserRank(userInAll >= 0 ? userInAll + 1 : null);
          if (userInAll >= 0) {
            const entry = sorted[userInAll];
            if (categoryId === 'achievements') {
              setCurrentUserValue(Array.isArray(entry.achievements) ? entry.achievements.length : 0);
            } else {
              setCurrentUserValue((entry as any)[category.dbColumn] || 0);
            }
          }
        }
      }
    } catch (err) {
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-slate-400/20 to-slate-500/10 border-slate-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/20 to-orange-600/10 border-amber-600/30';
    return 'bg-card/50 border-white/5';
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Leaderboards</h2>
            <p className="text-xs text-muted-foreground">ランキング</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{format(currentTime, 'MMM d, yyyy • h:mm a')}</span>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {category.icon}
            <span className="hidden sm:inline">{category.title}</span>
          </button>
        ))}
      </div>

      {/* Category Description */}
      {selectedCategoryData && (
        <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-white/5">
          <div className="flex items-center gap-2">
            {selectedCategoryData.icon}
            <div>
              <h3 className="font-semibold text-foreground">{selectedCategoryData.title}</h3>
              <p className="text-xs text-muted-foreground">{selectedCategoryData.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : leaderboardData.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No players yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboardData.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl border transition-all hover:scale-[1.01]",
                getRankStyle(entry.rank)
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center">
                {getRankIcon(entry.rank)}
              </div>

              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                <img 
                  src={`https://api.dicebear.com/7.x/${entry.avatarId === 'default' ? 'bottts' : entry.avatarId}/svg?seed=${entry.username}`}
                  alt={entry.username}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{entry.username}</p>
                <p className="text-xs text-muted-foreground">{entry.label}: {entry.value.toLocaleString()}</p>
              </div>

              <div className="text-right">
                <p className="font-bold text-primary text-lg">{entry.value.toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Your Position */}
      <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {currentUserRank ? `#${currentUserRank}` : 'You'}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{currentUsername}</p>
            <p className="text-xs text-muted-foreground">Keep pushing to climb the ranks!</p>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <span className="font-bold">{currentUserValue > 0 ? currentUserValue.toLocaleString() : `Level ${currentLevel}`}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
