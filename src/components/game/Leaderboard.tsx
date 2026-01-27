import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Flame, Target, Star, Users, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
}

const categories: LeaderboardCategory[] = [
  { id: 'level', title: 'Highest Level', japLabel: '最高レベル', icon: <Crown className="w-5 h-5" />, description: 'Players with the highest levels', valueLabel: 'Level' },
  { id: 'dedication', title: 'Most Dedicated', japLabel: '献身的', icon: <Flame className="w-5 h-5" />, description: 'Longest active streaks', valueLabel: 'Day Streak' },
  { id: 'quests', title: 'Quest Masters', japLabel: 'クエストマスター', icon: <Target className="w-5 h-5" />, description: 'Most quests completed', valueLabel: 'Quests' },
  { id: 'achievements', title: 'Achievement Hunters', japLabel: '実績ハンター', icon: <Trophy className="w-5 h-5" />, description: 'Most achievements unlocked', valueLabel: 'Achievements' },
  { id: 'credits', title: 'Wealthiest', japLabel: '富裕層', icon: <Star className="w-5 h-5" />, description: 'Highest credit balance', valueLabel: 'Credits' },
];

// Simulated leaderboard data (in a real app, this would come from a database)
const generateLeaderboardData = (category: string): LeaderboardEntry[] => {
  const names = [
    'ShadowMonarch', 'IronWill', 'PhoenixRise', 'DarkHunter', 'StormBreaker',
    'NightBlade', 'FrostBite', 'ThunderStrike', 'SilentAssassin', 'GoldenWarrior',
    'CrimsonKnight', 'AzurePhoenix', 'EternalFlame', 'VoidWalker', 'StarSeeker'
  ];
  
  const baseValues: Record<string, number[]> = {
    level: [87, 72, 65, 58, 52, 48, 43, 39, 35, 31, 28, 25, 22, 19, 16],
    dedication: [156, 124, 98, 87, 76, 65, 54, 45, 38, 32, 27, 22, 18, 14, 10],
    quests: [1247, 985, 834, 723, 612, 534, 467, 398, 342, 289, 245, 198, 156, 124, 89],
    achievements: [78, 65, 54, 47, 42, 38, 34, 30, 27, 24, 21, 18, 15, 12, 9],
    credits: [8750, 6234, 5123, 4567, 3890, 3245, 2876, 2456, 2123, 1876, 1567, 1234, 987, 765, 543],
  };
  
  return names.map((name, index) => ({
    id: `${category}-${index}`,
    rank: index + 1,
    username: name,
    avatarId: ['bottts', 'avataaars', 'lorelei', 'micah', 'adventurer'][index % 5],
    value: baseValues[category]?.[index] || 100 - index * 5,
    label: categories.find(c => c.id === category)?.valueLabel || 'Points',
  }));
};

interface LeaderboardProps {
  currentUsername?: string;
  currentLevel?: number;
}

export const Leaderboard = ({ currentUsername = 'You', currentLevel = 1 }: LeaderboardProps) => {
  const [selectedCategory, setSelectedCategory] = useState('level');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setLeaderboardData(generateLeaderboardData(selectedCategory));
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
      <div className="space-y-2">
        {leaderboardData.slice(0, 10).map((entry, index) => (
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
            {/* Rank */}
            <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center">
              {getRankIcon(entry.rank)}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
              <img 
                src={`https://api.dicebear.com/7.x/${entry.avatarId}/svg?seed=${entry.username}`}
                alt={entry.username}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Username */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{entry.username}</p>
              <p className="text-xs text-muted-foreground">{entry.label}: {entry.value.toLocaleString()}</p>
            </div>

            {/* Value */}
            <div className="text-right">
              <p className="font-bold text-primary text-lg">{entry.value.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Your Position */}
      <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">You</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{currentUsername}</p>
            <p className="text-xs text-muted-foreground">Keep pushing to climb the ranks!</p>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <span className="font-bold">Level {currentLevel}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
