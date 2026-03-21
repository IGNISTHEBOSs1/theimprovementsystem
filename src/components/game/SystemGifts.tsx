import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Clock, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SystemGift {
  id: string;
  type: string;
  title: string;
  description: string;
  xpBonus: number;
  creditsBonus: number;
  xpMultiplier?: number;
  multiplierHours?: number;
  expiresAt: Date;
  claimed: boolean;
}

interface SystemGiftsProps {
  currentStreak: number;
  totalQuestsCompleted: number;
  level: number;
  onClaimGift: (xp: number, credits: number, multiplier?: number, hours?: number) => void;
}

const GIFTS_STORAGE_KEY = 'the-system-gifts-v2';

// Milestone definitions — checked against current stats
const MILESTONES = [
  { type: 'quest_10',    check: (s: number, q: number, l: number) => q >= 10,  title: '⚔️ Quest Veteran!',     desc: 'Completed 10 quests.',              xp: 100,  credits: 30  },
  { type: 'quest_50',    check: (s: number, q: number, l: number) => q >= 50,  title: '⚔️ Quest Master!',      desc: 'Completed 50 quests.',              xp: 300,  credits: 80  },
  { type: 'quest_100',   check: (s: number, q: number, l: number) => q >= 100, title: '⚔️ Quest Legend!',      desc: 'Completed 100 quests.',             xp: 600,  credits: 150, multiplier: 1.5, hours: 24 },
  { type: 'streak_7',    check: (s: number, q: number, l: number) => s >= 7,   title: '🔥 7-Day Streak!',      desc: '7 days of consistency.',            xp: 150,  credits: 50  },
  { type: 'streak_30',   check: (s: number, q: number, l: number) => s >= 30,  title: '🌟 Monthly Master!',    desc: '30 days unbroken.',                 xp: 500,  credits: 120, multiplier: 2,   hours: 48 },
  { type: 'streak_100',  check: (s: number, q: number, l: number) => s >= 100, title: '👑 Century Streak!',    desc: '100 days. You are the System.',     xp: 2000, credits: 500, multiplier: 3,   hours: 72 },
  { type: 'level_5',     check: (s: number, q: number, l: number) => l >= 5,   title: '⚡ Level 5 Reached!',   desc: 'First major milestone.',            xp: 200,  credits: 60  },
  { type: 'level_10',    check: (s: number, q: number, l: number) => l >= 10,  title: '⚡ D-Rank Achieved!',   desc: 'Rank up: E → D.',                   xp: 400,  credits: 100, multiplier: 1.5, hours: 12 },
  { type: 'level_20',    check: (s: number, q: number, l: number) => l >= 20,  title: '💥 C-Rank Hunter!',     desc: 'Rank up: D → C.',                   xp: 800,  credits: 200, multiplier: 2,   hours: 24 },
  { type: 'level_30',    check: (s: number, q: number, l: number) => l >= 30,  title: '🔮 B-Rank Achieved!',   desc: 'Rank up: C → B.',                   xp: 1500, credits: 400, multiplier: 2,   hours: 48 },
  { type: 'level_40',    check: (s: number, q: number, l: number) => l >= 40,  title: '🌊 A-Rank Hunter!',     desc: 'The elite few.',                    xp: 3000, credits: 800, multiplier: 2.5, hours: 48 },
  { type: 'level_50',    check: (s: number, q: number, l: number) => l >= 50,  title: '☀️ S-Rank Hunter!',     desc: 'You have surpassed all limits.',    xp: 5000, credits: 1500, multiplier: 3,  hours: 72 },
];

export const SystemGifts = ({ currentStreak, totalQuestsCompleted, level, onClaimGift }: SystemGiftsProps) => {
  const [gifts, setGifts] = useState<SystemGift[]>(() => {
    try {
      const saved = localStorage.getItem(GIFTS_STORAGE_KEY);
      if (!saved) return [];
      return JSON.parse(saved).map((g: any) => ({ ...g, expiresAt: new Date(g.expiresAt) }))
        .filter((g: SystemGift) => new Date(g.expiresAt) > new Date() || g.claimed);
    } catch { return []; }
  });

  // Check milestones
  useEffect(() => {
    const claimedTypes = new Set(gifts.map(g => g.type));
    const newGifts: SystemGift[] = [];
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    for (const m of MILESTONES) {
      if (!claimedTypes.has(m.type) && m.check(currentStreak, totalQuestsCompleted, level)) {
        newGifts.push({
          id: `${m.type}_${Date.now()}`,
          type: m.type,
          title: m.title,
          description: m.desc,
          xpBonus: m.xp,
          creditsBonus: m.credits,
          xpMultiplier: m.multiplier,
          multiplierHours: m.hours,
          expiresAt: expires,
          claimed: false,
        });
      }
    }

    if (newGifts.length > 0) setGifts(prev => [...prev, ...newGifts]);
  }, [currentStreak, totalQuestsCompleted, level]);

  useEffect(() => {
    localStorage.setItem(GIFTS_STORAGE_KEY, JSON.stringify(gifts));
  }, [gifts]);

  const activeGifts = gifts.filter(g => !g.claimed && new Date(g.expiresAt) > new Date());

  const claimGift = (gift: SystemGift) => {
    onClaimGift(gift.xpBonus, gift.creditsBonus, gift.xpMultiplier, gift.multiplierHours);
    setGifts(prev => prev.map(g => g.id === gift.id ? { ...g, claimed: true } : g));
  };

  const dismissGift = (giftId: string) => setGifts(prev => prev.filter(g => g.id !== giftId));

  const getTimeRemaining = (expiresAt: Date) => {
    const diff = expiresAt.getTime() - Date.now();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
  };

  if (activeGifts.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {activeGifts.map(gift => (
          <motion.div
            key={gift.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="glass-strong rounded-xl border border-primary/30 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Gift className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="font-display font-bold text-sm text-foreground">Milestone Reward!</span>
              </div>
              <button onClick={() => dismissGift(gift.id)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-foreground mb-1">{gift.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{gift.description}</p>
              <div className="flex items-center gap-4 mb-3 flex-wrap">
                <div className="flex items-center gap-1 text-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-bold text-primary">+{gift.xpBonus} XP</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Gift className="w-4 h-4 text-accent" />
                  <span className="font-bold text-accent">+{gift.creditsBonus} Credits</span>
                </div>
                {gift.xpMultiplier && (
                  <div className="flex items-center gap-1 text-sm">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold text-yellow-400">{gift.xpMultiplier}x XP for {gift.multiplierHours}h</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {getTimeRemaining(gift.expiresAt)}
                </div>
                <Button size="sm" onClick={() => claimGift(gift)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Claim Reward
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
