import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Clock, Gamepad2, Film, Pizza, Coffee, ShoppingBag, Dumbbell, Heart, Star, Crown, Zap, Ban, Search, Lock } from 'lucide-react';
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
  unlockQuests?: number;
  unlockLevel?: number;
  soldOutUntil?: Date | null;
}

const STORAGE_KEY = 'system-rewards-v3';
const getSoldOut = (): Record<string, string> => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
};

// Rewards are unlocked at milestones, not all available from the start
const ALL_REWARDS: Omit<Reward, 'soldOutUntil'>[] = [
  // Always available (level 1)
  { id: 'r1',  name: '30min Screen Break',   icon: <Clock className="w-4 h-4"/>,    cost: 20,  description: 'Guilt-free break from all tasks',                 category: 'Rest',    cooldownDays: 1 },
  { id: 'r2',  name: 'Favorite Snack',        icon: <Pizza className="w-4 h-4"/>,    cost: 30,  description: 'Buy yourself one snack you like',                 category: 'Food',    cooldownDays: 2 },
  { id: 'r3',  name: 'Music Session',         icon: <Star className="w-4 h-4"/>,     cost: 15,  description: 'One hour of pure music, no multitasking',         category: 'Enjoy',   cooldownDays: 1 },
  { id: 'r4',  name: 'Skip One Task',         icon: <Zap className="w-4 h-4"/>,      cost: 50,  description: 'Remove one quest today without penalty',          category: 'Rest',    cooldownDays: 3 },
  // Unlocked at 10 quests
  { id: 'r5',  name: 'Favorite Coffee/Tea',   icon: <Coffee className="w-4 h-4"/>,   cost: 40,  description: 'That premium drink you always skip',              category: 'Food',    cooldownDays: 2,  unlockQuests: 10 },
  { id: 'r6',  name: '1hr Gaming',            icon: <Gamepad2 className="w-4 h-4"/>, cost: 60,  description: 'Uninterrupted gaming — zero guilt',               category: 'Enjoy',   cooldownDays: 2,  unlockQuests: 10 },
  { id: 'r7',  name: 'Extra Hour Sleep',      icon: <Clock className="w-4 h-4"/>,    cost: 55,  description: 'Sleep in one hour tomorrow — guilt-free',         category: 'Rest',    cooldownDays: 4,  unlockQuests: 10 },
  // Unlocked at 25 quests
  { id: 'r8',  name: 'Movie Night',           icon: <Film className="w-4 h-4"/>,     cost: 75,  description: 'Any movie, full attention, snacks included',      category: 'Enjoy',   cooldownDays: 4,  unlockQuests: 25 },
  { id: 'r9',  name: 'Your Favorite Meal',    icon: <Pizza className="w-4 h-4"/>,    cost: 80,  description: 'Order exactly what you crave',                    category: 'Food',    cooldownDays: 4,  unlockQuests: 25 },
  { id: 'r10', name: 'Skip Workout Once',     icon: <Dumbbell className="w-4 h-4"/>, cost: 90,  description: 'One rest day from exercise, no guilt',            category: 'Rest',    cooldownDays: 7,  unlockQuests: 25 },
  // Unlocked at 50 quests
  { id: 'r11', name: 'Friend Hangout',        icon: <Heart className="w-4 h-4"/>,    cost: 100, description: 'Plan something fun with people you like',         category: 'Social',  cooldownDays: 5,  unlockQuests: 50 },
  { id: 'r12', name: '3hr Gaming Session',    icon: <Gamepad2 className="w-4 h-4"/>, cost: 120, description: 'Extended session — you\'ve earned it',            category: 'Enjoy',   cooldownDays: 5,  unlockQuests: 50 },
  { id: 'r13', name: 'New Book',              icon: <ShoppingBag className="w-4 h-4"/>,cost:100,'description': 'Buy that book you\'ve been meaning to read',     category: 'Buy',     cooldownDays: 7,  unlockQuests: 50 },
  // Unlocked at level 10
  { id: 'r14', name: 'Full Rest Day',         icon: <Clock className="w-4 h-4"/>,    cost: 150, description: 'Zero obligations. Full recharge.',                category: 'Rest',    cooldownDays: 7,  unlockLevel: 10 },
  { id: 'r15', name: 'Restaurant Dinner',     icon: <Pizza className="w-4 h-4"/>,    cost: 180, description: 'Sit-down dinner at a place you actually like',    category: 'Food',    cooldownDays: 14, unlockLevel: 10 },
  { id: 'r16', name: 'Useful Gadget',         icon: <ShoppingBag className="w-4 h-4"/>,cost:200,'description': 'Something that actually improves your life',     category: 'Buy',     cooldownDays: 30, unlockLevel: 10 },
  // Unlocked at 100 quests
  { id: 'r17', name: 'New Outfit Piece',      icon: <ShoppingBag className="w-4 h-4"/>,cost:160,'description': 'One item that makes you feel good',             category: 'Buy',     cooldownDays: 14, unlockQuests: 100 },
  { id: 'r18', name: 'Subscription Month',    icon: <Star className="w-4 h-4"/>,     cost: 130, description: 'One month of a service you actually use',         category: 'Buy',     cooldownDays: 30, unlockQuests: 100 },
  { id: 'r19', name: 'Spa / Self-Care Day',   icon: <Heart className="w-4 h-4"/>,    cost: 220, description: 'Full self-care day \u2014 massage, grooming, relax',  category: 'Rest',    cooldownDays: 21, unlockQuests: 100 },
  // Unlocked at level 20
  { id: 'r20', name: 'Day Trip',              icon: <Star className="w-4 h-4"/>,     cost: 300, description: 'Go somewhere new for the day \u2014 explore',        category: 'Social',  cooldownDays: 30, unlockLevel: 20 },
  { id: 'r21', name: 'Major Purchase',        icon: <Crown className="w-4 h-4"/>,    cost: 400, description: 'That one thing you\'ve been saving for',           category: 'Buy',     cooldownDays: 60, unlockLevel: 20 },
  // Unlocked at 200 quests
  { id: 'r22', name: 'Full Cheat Day',        icon: <Crown className="w-4 h-4"/>,    cost: 350, description: 'No rules, no tracking, no guilt \u2014 full freedom', category: 'Rest',    cooldownDays: 30, unlockQuests: 200 },
  { id: 'r23', name: 'Weekend Getaway',       icon: <Star className="w-4 h-4"/>,     cost: 500, description: 'Book a weekend trip \u2014 you\'ve genuinely earned this', category: 'Social', cooldownDays: 90, unlockQuests: 200 },
];

const CATS = ['All', 'Rest', 'Food', 'Enjoy', 'Social', 'Buy'];

interface RewardCenterProps {
  credits: number;
  totalQuestsCompleted: number;
  level: number;
  onSpend: (amount: number) => void;
}

export const RewardCenter = ({ credits, totalQuestsCompleted, level, onSpend }: RewardCenterProps) => {
  const [soldOutMap, setSoldOutMap] = useState(getSoldOut);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [purchasedId, setPurchasedId] = useState<string | null>(null);

  const rewards: Reward[] = ALL_REWARDS.map(r => ({
    ...r,
    soldOutUntil: soldOutMap[r.id] ? new Date(soldOutMap[r.id]) : null,
  }));

  const isLocked = (r: Reward) =>
    (r.unlockQuests && totalQuestsCompleted < r.unlockQuests) ||
    (r.unlockLevel && level < r.unlockLevel);

  const isOnCooldown = (r: Reward) =>
    r.soldOutUntil ? new Date(r.soldOutUntil) > new Date() : false;

  const getDaysLeft = (r: Reward) => {
    if (!r.soldOutUntil) return 0;
    return Math.max(0, Math.ceil((new Date(r.soldOutUntil).getTime() - Date.now()) / 86400000));
  };

  const filtered = useMemo(() => {
    let list = rewards;
    if (cat !== 'All') list = list.filter(r => r.category === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    // Sort: available first, then locked
    return list.sort((a, b) => {
      const aLocked = isLocked(a) ? 1 : 0;
      const bLocked = isLocked(b) ? 1 : 0;
      return aLocked - bLocked;
    });
  }, [rewards, cat, search, totalQuestsCompleted, level]);

  const handleBuy = (r: Reward) => {
    if (credits < r.cost || isOnCooldown(r) || isLocked(r)) return;
    onSpend(r.cost);
    const cooldown = new Date();
    cooldown.setDate(cooldown.getDate() + r.cooldownDays);
    const newMap = { ...soldOutMap, [r.id]: cooldown.toISOString() };
    setSoldOutMap(newMap);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMap));
    setPurchasedId(r.id);
    setTimeout(() => setPurchasedId(null), 2000);
  };

  const unlockLabel = (r: Reward) => {
    if (r.unlockQuests) return `Unlock at ${r.unlockQuests} quests`;
    if (r.unlockLevel) return `Unlock at Level ${r.unlockLevel}`;
    return '';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl border border-white/10 overflow-hidden hover:border-accent/20 transition-all duration-250" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/25 to-accent/8 border border-accent/25 flex items-center justify-center">
              <Crown className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground tracking-wide text-sm">REWARD CENTER</h3>
              <p className="text-label text-muted-foreground font-jp">報酬センター</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-accent/15 border border-accent/25 px-4 py-2 rounded-xl">
            <Coins className="w-4 h-4 text-accent" />
            <span className="font-display font-bold text-accent text-lg">{credits}</span>
          </div>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search rewards..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white/4 border-white/8 focus:border-accent h-9 text-sm rounded-xl" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={cn('flex-shrink-0 px-3 py-1.5 rounded-lg text-label font-semibold transition-all',
                cat === c ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-white/4 text-muted-foreground hover:bg-white/8 border border-transparent'
              )}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="p-5 max-h-[420px] overflow-y-auto">
        {filtered.length === 0
          ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-accent/40" />
              </div>
              <p className="text-body-sm text-muted-foreground">No rewards found</p>
            </div>
          )
          : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filtered.map((r, i) => {
                const locked = isLocked(r);
                const cooldown = isOnCooldown(r);
                const canAfford = credits >= r.cost;
                const purchased = purchasedId === r.id;
                const disabled = locked || cooldown || !canAfford;

                return (
                  <motion.button key={r.id}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                    whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
                    whileTap={{ scale: disabled ? 1 : 0.97 }}
                    onClick={() => handleBuy(r)}
                    disabled={disabled}
                    className={cn(
                      'relative p-4 rounded-2xl border text-left transition-all overflow-hidden',
                      purchased ? 'border-green-500/50 bg-green-500/10' :
                      locked ? 'border-white/5 bg-white/2 opacity-50 cursor-not-allowed' :
                      cooldown ? 'border-white/5 bg-white/2 opacity-50 cursor-not-allowed' :
                      !canAfford ? 'border-white/5 bg-white/2 opacity-40 cursor-not-allowed' :
                      'border-white/10 bg-white/3 hover:border-accent/30 hover:bg-accent/5 hover:shadow-[0_0_12px_hsl(var(--accent)/0.15)] cursor-pointer'
                    )}
                  >
                    {purchased && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-2xl z-10">
                        <span className="text-2xl">✅</span>
                      </div>
                    )}
                    {cooldown && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-destructive/70 px-1.5 py-0.5 rounded-md z-10">
                        <Ban className="w-2.5 h-2.5 text-white" />
                        <span className="text-[9px] font-bold text-white">{getDaysLeft(r)}d</span>
                      </div>
                    )}
                    {locked && (
                      <div className="absolute top-2 right-2">
                        <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
                      </div>
                    )}

                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3',
                      locked || cooldown ? 'bg-muted/20 text-muted-foreground' : canAfford ? 'bg-accent/20 text-accent' : 'bg-muted/20 text-muted-foreground'
                    )}>
                      {r.icon}
                    </div>
                    <p className="font-bold text-caption text-foreground mb-1 line-clamp-1">{r.name}</p>
                    <p className="text-label text-muted-foreground mb-2.5 line-clamp-2 leading-relaxed">{r.description}</p>

                    {locked ? (
                      <p className="text-label text-muted-foreground/50">{unlockLabel(r)}</p>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-accent" />
                          <span className={cn('font-display font-bold text-caption', canAfford ? 'text-accent' : 'text-muted-foreground')}>{r.cost}</span>
                        </div>
                        {r.cooldownDays > 1 && !cooldown && (
                          <span className="text-label text-muted-foreground/40">{r.cooldownDays}d cd</span>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )
        }
      </div>
    </motion.div>
  );
};
