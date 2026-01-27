import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Gamepad2, Coffee, Film, Music, ShoppingBag, Clock, Sparkles, Ban, Pizza, Plane, Book, Dumbbell, Palette, Camera, Heart, Star, Headphones, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
  // Time-based rewards
  { id: '1', name: '1 Hour Free Time', icon: <Clock className="w-6 h-6" />, cost: 50, description: 'Take a guilt-free break' },
  { id: '2', name: '2 Hour Gaming Session', icon: <Gamepad2 className="w-6 h-6" />, cost: 100, description: 'Immersive gaming time' },
  { id: '3', name: 'Extended Sleep-In', icon: <Star className="w-6 h-6" />, cost: 40, description: 'Sleep an extra hour' },
  
  // Food & Drink
  { id: '4', name: 'Coffee Break', icon: <Coffee className="w-6 h-6" />, cost: 25, description: 'Treat yourself to coffee' },
  { id: '5', name: 'Favorite Meal', icon: <Pizza className="w-6 h-6" />, cost: 80, description: 'Order your favorite food' },
  { id: '6', name: 'Dessert Treat', icon: <Gift className="w-6 h-6" />, cost: 35, description: 'Enjoy a sweet treat' },
  
  // Entertainment
  { id: '7', name: 'Movie Night', icon: <Film className="w-6 h-6" />, cost: 75, description: 'Watch any movie' },
  { id: '8', name: 'Music Session', icon: <Music className="w-6 h-6" />, cost: 30, description: 'Listen to music guilt-free' },
  { id: '9', name: 'Podcast Marathon', icon: <Headphones className="w-6 h-6" />, cost: 45, description: 'Binge your favorite podcasts' },
  
  // Shopping & Material
  { id: '10', name: 'Small Shopping Treat', icon: <ShoppingBag className="w-6 h-6" />, cost: 150, description: 'Buy something nice under $20' },
  { id: '11', name: 'Book Purchase', icon: <Book className="w-6 h-6" />, cost: 60, description: 'Get a new book to read' },
  { id: '12', name: 'Art Supplies', icon: <Palette className="w-6 h-6" />, cost: 70, description: 'Creative materials' },
  
  // Health & Wellness
  { id: '13', name: 'Spa Day', icon: <Heart className="w-6 h-6" />, cost: 200, description: 'Relaxation and self-care' },
  { id: '14', name: 'Skip Workout', icon: <Dumbbell className="w-6 h-6" />, cost: 120, description: 'Guilt-free rest day' },
  
  // Experience
  { id: '15', name: 'Photo Walk', icon: <Camera className="w-6 h-6" />, cost: 55, description: 'Explore and take photos' },
  { id: '16', name: 'Day Trip Planning', icon: <Plane className="w-6 h-6" />, cost: 90, description: 'Plan a future adventure' },
  
  // Premium
  { id: '17', name: 'Full Cheat Day', icon: <Sparkles className="w-6 h-6" />, cost: 300, description: 'No rules for a whole day' },
  { id: '18', name: 'Subscription Month', icon: <Star className="w-6 h-6" />, cost: 250, description: 'One month of any streaming service' },
];

interface RewardCenterProps {
  credits: number;
  onSpend: (amount: number) => void;
}

export const RewardCenter = ({ credits, onSpend }: RewardCenterProps) => {
  const [soldOutMap, setSoldOutMap] = useState<Record<string, string>>(() => getStoredSoldOut());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

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
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-lg border border-accent/30">
            <Coins className="w-5 h-5 text-accent" />
            <span className="font-display font-bold text-accent text-lg">{credits}</span>
          </div>
          <span className="text-xs text-muted-foreground">{format(currentTime, 'MMM d, yyyy • h:mm a')}</span>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {rewards.map((reward, index) => {
          const canAfford = credits >= reward.cost;
          const isSoldOut = isRewardSoldOut(reward);
          const daysLeft = getSoldOutDaysLeft(reward);
          
          return (
            <motion.button
              key={reward.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: (canAfford && !isSoldOut) ? 1.02 : 1 }}
              whileTap={{ scale: (canAfford && !isSoldOut) ? 0.98 : 1 }}
              onClick={() => handlePurchase(reward)}
              disabled={!canAfford || isSoldOut}
              className={cn(
                "p-3 rounded-xl border transition-all text-left relative overflow-hidden",
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
                  <div className="bg-destructive/90 text-destructive-foreground px-2 py-0.5 rounded transform -rotate-12 flex items-center gap-1">
                    <Ban className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{daysLeft}d</span>
                  </div>
                </div>
              )}
              
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
                isSoldOut
                  ? "bg-muted text-muted-foreground"
                  : canAfford 
                    ? "bg-accent/20 text-accent" 
                    : "bg-muted text-muted-foreground"
              )}>
                {reward.icon}
              </div>
              
              <h4 className="font-semibold text-foreground text-xs mb-0.5 line-clamp-1">{reward.name}</h4>
              <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">{reward.description}</p>
              
              <div className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-accent" />
                <span className="font-display font-bold text-accent text-sm">{reward.cost}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
