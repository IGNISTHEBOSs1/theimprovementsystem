import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Clock, Gamepad2, Film, Music, Pizza, Coffee, ShoppingBag, Dumbbell, Plane, Book, Heart, Star, Sparkles, Ban, Search, Crown, Zap, Trophy, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface Reward {
  id: string;
  name: string;
  icon: React.ReactNode;
  cost: number;
  description: string;
  category: string;
  cooldownDays: number;
  soldOutUntil?: Date | null;
}

const REWARDS_STORAGE_KEY = 'the-system-rewards-sold-out';
const getStoredSoldOut = (): Record<string, string> => {
  try { return JSON.parse(localStorage.getItem(REWARDS_STORAGE_KEY) || '{}'); }
  catch { return {}; }
};
const saveSoldOut = (soldOut: Record<string, string>) => {
  localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(soldOut));
};

const CATEGORIES = ['All', 'Rest', 'Food', 'Entertainment', 'Fitness', 'Social', 'Shopping', 'Premium'];

const defaultRewards: Omit<Reward, 'soldOutUntil'>[] = [
  // Rest & Recovery (earned, not lazy)
  { id: 'r1', name: '1 Hour Off Screen', icon: <Clock className="w-5 h-5"/>, cost: 30, description: 'Guilt-free screen break — walk, nap, breathe', category: 'Rest', cooldownDays: 1 },
  { id: 'r2', name: 'Extra Hour Sleep', icon: <Star className="w-5 h-5"/>, cost: 50, description: 'Sleep in 1 hour without guilt tomorrow', category: 'Rest', cooldownDays: 3 },
  { id: 'r3', name: 'Full Rest Day', icon: <Shield className="w-5 h-5"/>, cost: 150, description: 'Zero obligations — recharge completely', category: 'Rest', cooldownDays: 7 },
  { id: 'r4', name: 'Skip One Task', icon: <Zap className="w-5 h-5"/>, cost: 80, description: 'Remove one quest without penalty today', category: 'Rest', cooldownDays: 3 },

  // Food & Treats
  { id: 'f1', name: 'Your Favorite Meal', icon: <Pizza className="w-5 h-5"/>, cost: 60, description: 'Order exactly what you crave — no compromise', category: 'Food', cooldownDays: 3 },
  { id: 'f2', name: 'Fancy Coffee/Tea', icon: <Coffee className="w-5 h-5"/>, cost: 25, description: 'That premium drink you always skip', category: 'Food', cooldownDays: 2 },
  { id: 'f3', name: 'Dessert Of Choice', icon: <Sparkles className="w-5 h-5"/>, cost: 40, description: 'Cake, ice cream, whatever hits — earned it', category: 'Food', cooldownDays: 3 },
  { id: 'f4', name: 'Restaurant Dinner', icon: <Trophy className="w-5 h-5"/>, cost: 180, description: 'Sit-down dinner at a place you actually like', category: 'Food', cooldownDays: 14 },
  { id: 'f5', name: 'Snack Haul', icon: <ShoppingBag className="w-5 h-5"/>, cost: 45, description: 'Stock up on all your favorite snacks', category: 'Food', cooldownDays: 5 },

  // Entertainment
  { id: 'e1', name: '2 Hours Gaming', icon: <Gamepad2 className="w-5 h-5"/>, cost: 80, description: 'Uninterrupted gaming session — no guilt', category: 'Entertainment', cooldownDays: 3 },
  { id: 'e2', name: 'Movie Night', icon: <Film className="w-5 h-5"/>, cost: 60, description: 'Any movie, full attention, snacks included', category: 'Entertainment', cooldownDays: 5 },
  { id: 'e3', name: 'Show Binge (3 eps)', icon: <Star className="w-5 h-5"/>, cost: 70, description: '3 episodes of whatever you\'re watching', category: 'Entertainment', cooldownDays: 4 },
  { id: 'e4', name: 'Music Session', icon: <Music className="w-5 h-5"/>, cost: 20, description: 'Just listen — no multitasking, pure enjoyment', category: 'Entertainment', cooldownDays: 1 },
  { id: 'e5', name: 'YouTube Rabbit Hole', icon: <Zap className="w-5 h-5"/>, cost: 35, description: '1 hour of guilt-free YouTube/social browsing', category: 'Entertainment', cooldownDays: 2 },

  // Fitness Rewards (reward good fitness behavior)
  { id: 'fit1', name: 'Skip Gym Once', icon: <Dumbbell className="w-5 h-5"/>, cost: 100, description: 'One guilt-free rest day from working out', category: 'Fitness', cooldownDays: 7 },
  { id: 'fit2', name: 'New Gym Gear', icon: <Shield className="w-5 h-5"/>, cost: 200, description: 'One piece of fitness gear you\'ve been eyeing', category: 'Fitness', cooldownDays: 30 },
  { id: 'fit3', name: 'Protein Shake Treat', icon: <Trophy className="w-5 h-5"/>, cost: 30, description: 'That premium protein/supplement you want', category: 'Fitness', cooldownDays: 3 },
  { id: 'fit4', name: 'Outdoor Adventure', icon: <Plane className="w-5 h-5"/>, cost: 75, description: 'Hike, bike ride, swim — your choice', category: 'Fitness', cooldownDays: 7 },

  // Social
  { id: 's1', name: 'Friend Hangout', icon: <Heart className="w-5 h-5"/>, cost: 60, description: 'Plan something fun with people you like', category: 'Social', cooldownDays: 5 },
  { id: 's2', name: 'Call Someone You Miss', icon: <Star className="w-5 h-5"/>, cost: 20, description: 'Reach out — you know who', category: 'Social', cooldownDays: 3 },
  { id: 's3', name: 'Game Night', icon: <Gamepad2 className="w-5 h-5"/>, cost: 70, description: 'Board games or online with friends', category: 'Social', cooldownDays: 7 },
  { id: 's4', name: 'Group Outing', icon: <Plane className="w-5 h-5"/>, cost: 120, description: 'Plan a group activity — bowling, escape room, etc', category: 'Social', cooldownDays: 14 },

  // Shopping (meaningful, not frivolous)
  { id: 'sh1', name: 'New Book', icon: <Book className="w-5 h-5"/>, cost: 50, description: 'Buy that book you\'ve been meaning to read', category: 'Shopping', cooldownDays: 7 },
  { id: 'sh2', name: 'Useful Gadget', icon: <Zap className="w-5 h-5"/>, cost: 200, description: 'Something that actually improves your life', category: 'Shopping', cooldownDays: 30 },
  { id: 'sh3', name: 'New Outfit Piece', icon: <ShoppingBag className="w-5 h-5"/>, cost: 150, description: 'One item that makes you feel good', category: 'Shopping', cooldownDays: 14 },
  { id: 'sh4', name: 'Art/Hobby Supplies', icon: <Sparkles className="w-5 h-5"/>, cost: 80, description: 'Materials for your creative hobby', category: 'Shopping', cooldownDays: 14 },
  { id: 'sh5', name: 'Subscription Month', icon: <Star className="w-5 h-5"/>, cost: 120, description: 'One month of a service you actually use', category: 'Shopping', cooldownDays: 30 },

  // Premium (big milestones)
  { id: 'p1', name: 'Day Trip', icon: <Plane className="w-5 h-5"/>, cost: 300, description: 'Go somewhere new for the day — explore', category: 'Premium', cooldownDays: 30 },
  { id: 'p2', name: 'Spa/Self Care Day', icon: <Heart className="w-5 h-5"/>, cost: 250, description: 'Full self-care day — massage, grooming, relax', category: 'Premium', cooldownDays: 30 },
  { id: 'p3', name: 'Major Purchase', icon: <Crown className="w-5 h-5"/>, cost: 400, description: 'That one thing you\'ve been saving for', category: 'Premium', cooldownDays: 60 },
  { id: 'p4', name: 'Weekend Getaway', icon: <Plane className="w-5 h-5"/>, cost: 500, description: 'Book a weekend trip — you\'ve earned this', category: 'Premium', cooldownDays: 90 },
  { id: 'p5', name: 'Ultimate Cheat Day', icon: <Crown className="w-5 h-5"/>, cost: 350, description: 'No rules, no tracking, no guilt — full freedom', category: 'Premium', cooldownDays: 30 },
];

interface RewardCenterProps {
  credits: number;
  onSpend: (amount: number) => void;
}

export const RewardCenter = ({ credits, onSpend }: RewardCenterProps) => {
  const [soldOutMap, setSoldOutMap] = useState<Record<string, string>>(() => getStoredSoldOut());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [purchasedId, setPurchasedId] = useState<string | null>(null);

  const rewards: Reward[] = defaultRewards.map(r => ({
    ...r,
    soldOutUntil: soldOutMap[r.id] ? new Date(soldOutMap[r.id]) : null,
  }));

  const filteredRewards = useMemo(() => {
    let list = rewards;
    if (activeCategory !== 'All') list = list.filter(r => r.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    return list;
  }, [rewards, searchQuery, activeCategory]);

  const isOnCooldown = (reward: Reward) => reward.soldOutUntil ? new Date(reward.soldOutUntil) > new Date() : false;

  const getCooldownDays = (reward: Reward) => {
    if (!reward.soldOutUntil) return 0;
    return Math.max(0, Math.ceil((new Date(reward.soldOutUntil).getTime() - Date.now()) / 86400000));
  };

  const handlePurchase = (reward: Reward) => {
    if (credits < reward.cost || isOnCooldown(reward)) return;
    onSpend(reward.cost);
    const cooldownDate = new Date();
    cooldownDate.setDate(cooldownDate.getDate() + reward.cooldownDays);
    const newMap = { ...soldOutMap, [reward.id]: cooldownDate.toISOString() };
    setSoldOutMap(newMap);
    saveSoldOut(newMap);
    setPurchasedId(reward.id);
    setTimeout(() => setPurchasedId(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#080810] rounded-2xl border border-white/8 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/25 to-accent/8 border border-accent/25 flex items-center justify-center">
              <Crown className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground tracking-wide">REWARD CENTER</h3>
              <p className="text-[11px] text-muted-foreground font-jp">報酬センター</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-accent/15 border border-accent/25 px-4 py-2 rounded-xl">
            <Coins className="w-5 h-5 text-accent" />
            <span className="font-display font-bold text-accent text-xl">{credits}</span>
            <span className="text-xs text-muted-foreground">credits</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search rewards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/4 border-white/8 focus:border-accent h-9 text-sm rounded-xl"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'bg-white/4 text-muted-foreground border border-transparent hover:bg-white/8'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rewards grid */}
      <div className="p-5 max-h-[480px] overflow-y-auto">
        {filteredRewards.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">No rewards found</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredRewards.map((reward, i) => {
              const canAfford = credits >= reward.cost;
              const onCooldown = isOnCooldown(reward);
              const daysLeft = getCooldownDays(reward);
              const justPurchased = purchasedId === reward.id;

              return (
                <motion.button
                  key={reward.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ scale: canAfford && !onCooldown ? 1.02 : 1, y: canAfford && !onCooldown ? -2 : 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handlePurchase(reward)}
                  disabled={!canAfford || onCooldown}
                  className={cn(
                    'relative p-4 rounded-2xl border text-left transition-all overflow-hidden',
                    justPurchased ? 'border-green-500/60 bg-green-500/10' :
                    onCooldown ? 'border-white/5 bg-white/2 opacity-50 cursor-not-allowed' :
                    canAfford ? 'border-white/10 bg-white/3 hover:border-accent/30 hover:bg-accent/5 cursor-pointer' :
                    'border-white/5 bg-white/2 opacity-40 cursor-not-allowed'
                  )}
                >
                  {onCooldown && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-destructive/80 px-1.5 py-0.5 rounded-md">
                      <Ban className="w-2.5 h-2.5 text-white" />
                      <span className="text-[9px] font-bold text-white">{daysLeft}d</span>
                    </div>
                  )}
                  {justPurchased && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-2xl z-10">
                      <span className="text-2xl">✅</span>
                    </div>
                  )}

                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                    canAfford && !onCooldown ? 'bg-accent/20 text-accent' : 'bg-muted/30 text-muted-foreground'
                  )}>
                    {reward.icon}
                  </div>

                  <p className="font-bold text-sm text-foreground mb-1 line-clamp-1">{reward.name}</p>
                  <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{reward.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-accent" />
                      <span className={cn('font-display font-bold text-sm', canAfford ? 'text-accent' : 'text-muted-foreground')}>{reward.cost}</span>
                    </div>
                    {reward.cooldownDays > 1 && (
                      <span className="text-[10px] text-muted-foreground/50">{reward.cooldownDays}d cooldown</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
