import { motion } from 'framer-motion';
import { Coins, Gamepad2, Coffee, Film, Music, ShoppingBag, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reward {
  id: string;
  name: string;
  icon: React.ReactNode;
  cost: number;
  description: string;
}

const rewards: Reward[] = [
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
  const handlePurchase = (reward: Reward) => {
    if (credits >= reward.cost) {
      onSpend(reward.cost);
    }
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
          
          return (
            <motion.button
              key={reward.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: canAfford ? 1.02 : 1 }}
              whileTap={{ scale: canAfford ? 0.98 : 1 }}
              onClick={() => handlePurchase(reward)}
              disabled={!canAfford}
              className={cn(
                "p-4 rounded-xl border transition-all text-left",
                canAfford
                  ? "bg-card hover:bg-card-elevated border-white/10 hover:border-accent/30"
                  : "bg-card/50 border-white/5 opacity-50 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center mb-3",
                canAfford ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
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
