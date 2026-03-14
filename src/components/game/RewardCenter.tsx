import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Coins, Gamepad2, Coffee, Film, Music, ShoppingBag, Clock, Sparkles, Ban, Pizza, Plane, Book, Dumbbell, Palette, Camera, Heart, Star, Headphones, Gift, Search, Utensils, Tv, Shirt, TreePine, Bike, Dog, Flower2, Footprints, Gem, Glasses, Globe, HandMetal, IceCreamCone, Laptop, Mic, Moon, PartyPopper, Puzzle, Sandwich, Smile, Sofa, SunMedium, Ticket, Umbrella, Wine, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

interface Reward {
  id: string;
  name: string;
  icon: React.ReactNode;
  cost: number;
  description: string;
  keywords: string[];
  soldOutUntil?: Date | null;
}

const REWARDS_STORAGE_KEY = 'the-system-rewards-sold-out';

const getStoredSoldOut = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(REWARDS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
};

const saveSoldOut = (soldOut: Record<string, string>) => {
  localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(soldOut));
};

const defaultRewards: Omit<Reward, 'soldOutUntil'>[] = [
  // Time-based rewards
  { id: '1', name: '1 Hour Free Time', icon: <Clock className="w-5 h-5" />, cost: 50, description: 'Take a guilt-free break', keywords: ['time', 'break', 'rest', 'free'] },
  { id: '2', name: '2 Hour Gaming Session', icon: <Gamepad2 className="w-5 h-5" />, cost: 100, description: 'Immersive gaming time', keywords: ['game', 'gaming', 'play', 'fun'] },
  { id: '3', name: 'Extended Sleep-In', icon: <Moon className="w-5 h-5" />, cost: 40, description: 'Sleep an extra hour', keywords: ['sleep', 'rest', 'morning', 'bed'] },
  { id: '4', name: 'Lazy Afternoon', icon: <Sofa className="w-5 h-5" />, cost: 60, description: 'Do absolutely nothing', keywords: ['lazy', 'relax', 'chill', 'rest'] },

  // Food & Drink
  { id: '5', name: 'Coffee Break', icon: <Coffee className="w-5 h-5" />, cost: 25, description: 'Treat yourself to coffee', keywords: ['coffee', 'drink', 'cafe', 'break'] },
  { id: '6', name: 'Favorite Meal', icon: <Pizza className="w-5 h-5" />, cost: 80, description: 'Order your favorite food', keywords: ['food', 'meal', 'pizza', 'order', 'eat'] },
  { id: '7', name: 'Dessert Treat', icon: <IceCreamCone className="w-5 h-5" />, cost: 35, description: 'Enjoy a sweet treat', keywords: ['dessert', 'sweet', 'ice cream', 'treat'] },
  { id: '8', name: 'Fancy Dinner Out', icon: <Utensils className="w-5 h-5" />, cost: 200, description: 'Dine at a nice restaurant', keywords: ['dinner', 'restaurant', 'fancy', 'eat'] },
  { id: '9', name: 'Smoothie Run', icon: <Wine className="w-5 h-5" />, cost: 30, description: 'Get a fresh smoothie', keywords: ['smoothie', 'juice', 'healthy', 'drink'] },
  { id: '10', name: 'Snack Haul', icon: <Sandwich className="w-5 h-5" />, cost: 45, description: 'Buy all your favorite snacks', keywords: ['snack', 'food', 'chips', 'munchies'] },

  // Entertainment
  { id: '11', name: 'Movie Night', icon: <Film className="w-5 h-5" />, cost: 75, description: 'Watch any movie', keywords: ['movie', 'film', 'watch', 'cinema'] },
  { id: '12', name: 'Music Session', icon: <Music className="w-5 h-5" />, cost: 30, description: 'Listen to music guilt-free', keywords: ['music', 'listen', 'songs', 'playlist'] },
  { id: '13', name: 'Podcast Marathon', icon: <Headphones className="w-5 h-5" />, cost: 45, description: 'Binge your favorite podcasts', keywords: ['podcast', 'listen', 'audio', 'show'] },
  { id: '14', name: 'TV Binge Session', icon: <Tv className="w-5 h-5" />, cost: 90, description: 'Watch a full season', keywords: ['tv', 'show', 'binge', 'series', 'netflix'] },
  { id: '15', name: 'Concert Ticket', icon: <Ticket className="w-5 h-5" />, cost: 350, description: 'See a live performance', keywords: ['concert', 'live', 'music', 'event', 'ticket'] },
  { id: '16', name: 'Karaoke Night', icon: <Mic className="w-5 h-5" />, cost: 65, description: 'Sing your heart out', keywords: ['karaoke', 'sing', 'fun', 'night'] },

  // Shopping & Material
  { id: '17', name: 'Small Shopping Treat', icon: <ShoppingBag className="w-5 h-5" />, cost: 150, description: 'Buy something nice under $20', keywords: ['shopping', 'buy', 'treat', 'store'] },
  { id: '18', name: 'Book Purchase', icon: <Book className="w-5 h-5" />, cost: 60, description: 'Get a new book to read', keywords: ['book', 'read', 'novel', 'buy'] },
  { id: '19', name: 'Art Supplies', icon: <Palette className="w-5 h-5" />, cost: 70, description: 'Creative materials', keywords: ['art', 'creative', 'draw', 'paint', 'craft'] },
  { id: '20', name: 'New Outfit Piece', icon: <Shirt className="w-5 h-5" />, cost: 180, description: 'Buy a new clothing item', keywords: ['clothes', 'fashion', 'outfit', 'wear', 'shirt'] },
  { id: '21', name: 'Tech Accessory', icon: <Laptop className="w-5 h-5" />, cost: 250, description: 'A gadget or tech accessory', keywords: ['tech', 'gadget', 'accessory', 'device'] },
  { id: '22', name: 'Plant Purchase', icon: <Flower2 className="w-5 h-5" />, cost: 55, description: 'Add a new plant to your space', keywords: ['plant', 'nature', 'green', 'flower'] },

  // Health & Wellness
  { id: '23', name: 'Spa Day', icon: <Heart className="w-5 h-5" />, cost: 200, description: 'Relaxation and self-care', keywords: ['spa', 'relax', 'self-care', 'wellness'] },
  { id: '24', name: 'Skip Workout', icon: <Dumbbell className="w-5 h-5" />, cost: 120, description: 'Guilt-free rest day', keywords: ['workout', 'rest', 'skip', 'gym', 'exercise'] },
  { id: '25', name: 'Massage Session', icon: <Smile className="w-5 h-5" />, cost: 220, description: 'Professional relaxation', keywords: ['massage', 'relax', 'body', 'spa'] },
  { id: '26', name: 'Yoga Class', icon: <Footprints className="w-5 h-5" />, cost: 50, description: 'A peaceful yoga session', keywords: ['yoga', 'stretch', 'peace', 'calm'] },

  // Experience & Adventure
  { id: '27', name: 'Photo Walk', icon: <Camera className="w-5 h-5" />, cost: 55, description: 'Explore and take photos', keywords: ['photo', 'camera', 'explore', 'walk'] },
  { id: '28', name: 'Day Trip Planning', icon: <Plane className="w-5 h-5" />, cost: 90, description: 'Plan a future adventure', keywords: ['trip', 'travel', 'plan', 'adventure'] },
  { id: '29', name: 'Nature Hike', icon: <TreePine className="w-5 h-5" />, cost: 40, description: 'A refreshing outdoor hike', keywords: ['nature', 'hike', 'outdoor', 'walk', 'trail'] },
  { id: '30', name: 'Bike Ride', icon: <Bike className="w-5 h-5" />, cost: 35, description: 'Scenic cycling adventure', keywords: ['bike', 'cycle', 'ride', 'outdoor'] },
  { id: '31', name: 'Beach Day', icon: <Umbrella className="w-5 h-5" />, cost: 70, description: 'Spend a day at the beach', keywords: ['beach', 'sun', 'swim', 'sand', 'ocean'] },
  { id: '32', name: 'Sunrise Watch', icon: <SunMedium className="w-5 h-5" />, cost: 20, description: 'Wake up early for sunrise', keywords: ['sunrise', 'morning', 'nature', 'view'] },

  // Social
  { id: '33', name: 'Friend Hangout', icon: <PartyPopper className="w-5 h-5" />, cost: 65, description: 'Spend time with friends', keywords: ['friend', 'social', 'hangout', 'fun'] },
  { id: '34', name: 'Game Night', icon: <Puzzle className="w-5 h-5" />, cost: 50, description: 'Board games with friends', keywords: ['game', 'board', 'friends', 'night', 'social'] },
  { id: '35', name: 'Pet Time', icon: <Dog className="w-5 h-5" />, cost: 30, description: 'Extra playtime with pets', keywords: ['pet', 'dog', 'cat', 'animal', 'play'] },

  // Hobbies
  { id: '36', name: 'New Glasses/Sunglasses', icon: <Glasses className="w-5 h-5" />, cost: 160, description: 'Treat yourself to new eyewear', keywords: ['glasses', 'sunglasses', 'eyewear', 'fashion'] },
  { id: '37', name: 'Museum Visit', icon: <Globe className="w-5 h-5" />, cost: 55, description: 'Explore art and culture', keywords: ['museum', 'art', 'culture', 'visit', 'exhibit'] },
  { id: '38', name: 'Rock Climbing', icon: <HandMetal className="w-5 h-5" />, cost: 80, description: 'Indoor rock climbing session', keywords: ['climbing', 'adventure', 'sport', 'indoor'] },

  // Premium
  { id: '39', name: 'Jewelry Piece', icon: <Gem className="w-5 h-5" />, cost: 300, description: 'A small piece of jewelry', keywords: ['jewelry', 'accessory', 'ring', 'necklace'] },
  { id: '40', name: 'Full Cheat Day', icon: <Sparkles className="w-5 h-5" />, cost: 300, description: 'No rules for a whole day', keywords: ['cheat', 'free', 'rules', 'day', 'anything'] },
  { id: '41', name: 'Subscription Month', icon: <Star className="w-5 h-5" />, cost: 250, description: 'One month of any streaming service', keywords: ['subscription', 'streaming', 'month', 'service'] },
  { id: '42', name: 'Weekend Getaway Fund', icon: <Plane className="w-5 h-5" />, cost: 400, description: 'Add to your trip savings', keywords: ['weekend', 'trip', 'travel', 'getaway', 'save'] },
  { id: '43', name: 'Custom Phone Case', icon: <Zap className="w-5 h-5" />, cost: 85, description: 'Design your own phone case', keywords: ['phone', 'case', 'custom', 'design'] },
  { id: '44', name: 'Cooking Class', icon: <Utensils className="w-5 h-5" />, cost: 140, description: 'Learn a new recipe', keywords: ['cooking', 'class', 'recipe', 'food', 'learn'] },
  { id: '45', name: 'Candle & Bath Set', icon: <Sparkles className="w-5 h-5" />, cost: 75, description: 'Aromatherapy relaxation', keywords: ['candle', 'bath', 'relax', 'scent', 'aroma'] },
  { id: '46', name: 'Sticker/Poster Pack', icon: <Gift className="w-5 h-5" />, cost: 40, description: 'Decorate your space', keywords: ['sticker', 'poster', 'decor', 'room'] },
  { id: '47', name: 'Charity Donation', icon: <Heart className="w-5 h-5" />, cost: 100, description: 'Donate to a cause you care about', keywords: ['charity', 'donate', 'give', 'help', 'cause'] },
  { id: '48', name: 'Journal/Notebook', icon: <Book className="w-5 h-5" />, cost: 45, description: 'A fresh journal for thoughts', keywords: ['journal', 'notebook', 'write', 'diary'] },
  { id: '49', name: 'Puzzle/Lego Set', icon: <Puzzle className="w-5 h-5" />, cost: 110, description: 'A challenging build project', keywords: ['puzzle', 'lego', 'build', 'toy', 'hobby'] },
  { id: '50', name: 'Ultimate Reward Day', icon: <Crown className="w-5 h-5" />, cost: 500, description: 'The ultimate day of rewards', keywords: ['ultimate', 'reward', 'best', 'premium', 'special'] },
];

// Need Crown import
import { Crown } from 'lucide-react';

interface RewardCenterProps {
  credits: number;
  onSpend: (amount: number) => void;
}

export const RewardCenter = ({ credits, onSpend }: RewardCenterProps) => {
  const [soldOutMap, setSoldOutMap] = useState<Record<string, string>>(() => getStoredSoldOut());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const rewards: Reward[] = defaultRewards.map(r => ({
    ...r,
    soldOutUntil: soldOutMap[r.id] ? new Date(soldOutMap[r.id]) : null,
  }));

  const filteredRewards = useMemo(() => {
    if (!searchQuery.trim()) return rewards;
    const query = searchQuery.toLowerCase();
    return rewards.filter(r =>
      r.name.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.keywords.some(k => k.includes(query))
    );
  }, [rewards, searchQuery]);

  const handlePurchase = (reward: Reward) => {
    if (credits >= reward.cost && !isRewardSoldOut(reward)) {
      onSpend(reward.cost);
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
      <div className="flex items-center justify-between mb-4">
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

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search rewards... (e.g. food, gaming, relax)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted/50 border-white/10 focus:border-accent h-9 text-sm"
        />
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[500px] overflow-y-auto pr-1">
        {filteredRewards.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
            No rewards match "{searchQuery}"
          </div>
        ) : (
          filteredRewards.map((reward, index) => {
            const canAfford = credits >= reward.cost;
            const isSoldOut = isRewardSoldOut(reward);
            const daysLeft = getSoldOutDaysLeft(reward);
            
            return (
              <motion.button
                key={reward.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
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
                
                <h4 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">{reward.name}</h4>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{reward.description}</p>
                
                <div className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-accent" />
                  <span className="font-display font-bold text-accent text-base">{reward.cost}</span>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
