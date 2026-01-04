import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Gamepad2, Coffee, Film, Music, ShoppingBag, Clock, Sparkles, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reward {
  id: string;
  name: string;
  icon: React.ReactNode;
  cost: number;
  description: string;
  soldOutUntil?: Date | null;
}

const REWARDS_STORAGE_KEY = 'the-system-rewards-sold-out';

const getStoredSoldOut = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(REWARDS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveSoldOut = (soldOut: Record<string, string>) => {
  localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(soldOut));
};

const defaultRewards: Omit<Reward, 'soldOutUntil'>[] = [
  { id: '1', name: '1 Hour Free Time', icon: <Clock className="w-6 h-6" />, cost: 50, description: 'Take a guilt-free break' },
  { id: '2', name: 'Gaming Session', icon: <Gamepad2 className="w-6 h-6" />, cost: 100, description: '2 hours of gaming' },
  { id: '3', name: 'Coffee Break', icon: <Coffee className="w-6 h-6" />, cost: 25, description: 'Treat yourself to coffee' },
  { id: '4', name: 'Movie Night', icon: <Film className="w-6 h-6" />, cost: 75, description: 'Watch any movie' },
  { id: '5', name: 'Music Time', icon: <Music className="w-6 h-6" />, cost: 30, description: 'Listen to music guilt-free' },
  { id: '6', name: 'Shopping Treat', icon: <ShoppingBag className="w-6 h-6" />, cost: 150, description: 'Buy something nice' },
];

interface RewardCenterProps {
  credits: number;
  onSpend: (amount: number) => void;
}

export const RewardCenter = ({ credits, onSpend }: RewardCenterProps) => {
  const [soldOutMap, setSoldOutMap] = useState<Record<string, string>>(() => getStoredSoldOut());

  const rewards: Reward[] = defaultRewards.map(r => ({
    ...r,
    soldOutUntil: soldOutMap[r.id] ? new Date(soldOutMap[r.id]) : null,
  }));

  const handlePurchase = (reward: Reward) => {
    if (credits >= reward.cost && !isRewardSoldOut(reward)) {
      onSpend(reward.cost);
      
      // Mark as sold out for 1 week
      const soldOutDate = new Date();
      soldOutDate.setDate(soldOutDate.getDate() + 7);
      
      const newSoldOut = { ...soldOutMap, [reward.id]: soldOutDate.toISOString() };
      setSoldOutMap(newSoldOut);
      saveSoldOut(newSoldOut);
    }
  };

  const isRewardSoldOut = (reward: Reward): boolean => {
    if (!reward.soldOutUntil) return false;
    return new Date(reward.soldOutUntil) > new Date();
  };

  const getSoldOutDaysLeft = (reward: Reward): number => {
    if (!reward.soldOutUntil) return 0;
    const diff = new Date(reward.soldOutUntil).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-display text-lg font-bold text-foreground">Reward Center</h3>
          <span className="text-sm text-muted-foreground font-jp">報酬センター</span>
        </div>
        <div className="flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-lg border border-accent/30">
          <Coins className="w-5 h-5 text-accent" />
          <span className="font-display font-bold text-accent text-lg">{credits}</span>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {rewards.map((reward, index) => {
          const canAfford = credits >= reward.cost;
          const isSoldOut = isRewardSoldOut(reward);
          const daysLeft = getSoldOutDaysLeft(reward);
          
          return (
            <motion.button
              key={reward.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: (canAfford && !isSoldOut) ? 1.02 : 1 }}
              whileTap={{ scale: (canAfford && !isSoldOut) ? 0.98 : 1 }}
              onClick={() => handlePurchase(reward)}
              disabled={!canAfford || isSoldOut}
              className={cn(
                "p-4 rounded-xl border transition-all text-left relative overflow-hidden",
                isSoldOut
                  ? "bg-card/30 border-destructive/20 opacity-60"
                  : canAfford
                    ? "bg-card hover:bg-card-elevated border-white/10 hover:border-accent/30"
                    : "bg-card/50 border-white/5 opacity-50 cursor-not-allowed"
              )}
            >
              {/* Sold Out Overlay */}
              {isSoldOut && (
                <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center z-10">
                  <div className="bg-destructive/90 text-destructive-foreground px-3 py-1 rounded-lg transform -rotate-12 flex items-center gap-2">
                    <Ban className="w-4 h-4" />
                    <span className="text-xs font-bold">SOLD OUT ({daysLeft}d)</span>
                  </div>
                </div>
              )}
              
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center mb-3",
                isSoldOut
                  ? "bg-muted text-muted-foreground"
                  : canAfford 
                    ? "bg-accent/20 text-accent" 
                    : "bg-muted text-muted-foreground"
              )}>
                {reward.icon}
              </div>
              
              <h4 className="font-semibold text-foreground text-sm mb-1">{reward.name}</h4>
              <p className="text-xs text-muted-foreground mb-3">{reward.description}</p>
              
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-accent" />
                <span className="font-display font-bold text-accent">{reward.cost}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
