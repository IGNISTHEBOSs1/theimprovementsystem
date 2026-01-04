import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SystemGift {
  id: string;
  type: 'streak_7' | 'streak_30' | 'first_login' | 'comeback';
  title: string;
  description: string;
  xpBonus: number;
  creditsBonus: number;
  expiresAt: Date;
  claimed: boolean;
}

interface SystemGiftsProps {
  currentStreak: number;
  onClaimGift: (xp: number, credits: number) => void;
}

const GIFTS_STORAGE_KEY = 'the-system-gifts';

export const SystemGifts = ({ currentStreak, onClaimGift }: SystemGiftsProps) => {
  const [gifts, setGifts] = useState<SystemGift[]>(() => {
    const saved = localStorage.getItem(GIFTS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((g: any) => ({
          ...g,
          expiresAt: new Date(g.expiresAt),
        })).filter((g: SystemGift) => new Date(g.expiresAt) > new Date() || g.claimed);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Check for new gifts based on streak
  useEffect(() => {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

    const newGifts: SystemGift[] = [];

    // 7-day streak gift
    if (currentStreak >= 7 && !gifts.some(g => g.type === 'streak_7')) {
      newGifts.push({
        id: `streak_7_${Date.now()}`,
        type: 'streak_7',
        title: '🔥 7-Day Streak Reward!',
        description: 'You maintained a 7-day streak! Here\'s your reward.',
        xpBonus: 150,
        creditsBonus: 50,
        expiresAt: expiryDate,
        claimed: false,
      });
    }

    // 30-day streak gift
    if (currentStreak >= 30 && !gifts.some(g => g.type === 'streak_30')) {
      newGifts.push({
        id: `streak_30_${Date.now()}`,
        type: 'streak_30',
        title: '👑 Monthly Master Reward!',
        description: 'Incredible! 30 days of consistency! You\'re a legend.',
        xpBonus: 500,
        creditsBonus: 150,
        expiresAt: expiryDate,
        claimed: false,
      });
    }

    if (newGifts.length > 0) {
      setGifts(prev => [...prev, ...newGifts]);
    }
  }, [currentStreak]);

  // Save gifts to localStorage
  useEffect(() => {
    localStorage.setItem(GIFTS_STORAGE_KEY, JSON.stringify(gifts));
  }, [gifts]);

  // Filter active unclaimed gifts
  const activeGifts = gifts.filter(
    g => !g.claimed && new Date(g.expiresAt) > new Date()
  );

  const claimGift = (gift: SystemGift) => {
    onClaimGift(gift.xpBonus, gift.creditsBonus);
    setGifts(prev =>
      prev.map(g => (g.id === gift.id ? { ...g, claimed: true } : g))
    );
  };

  const dismissGift = (giftId: string) => {
    setGifts(prev => prev.filter(g => g.id !== giftId));
  };

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h left`;
    return `${hours}h left`;
  };

  if (activeGifts.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {activeGifts.map((gift) => (
          <motion.div
            key={gift.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="glass-strong rounded-xl border border-primary/30 overflow-hidden"
          >
            {/* Header with sparkle effect */}
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Gift className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="font-display font-bold text-sm text-foreground">
                  System Gift!
                </span>
              </div>
              <button
                onClick={() => dismissGift(gift.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <h4 className="font-bold text-foreground mb-1">{gift.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {gift.description}
              </p>

              {/* Rewards */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1 text-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-bold text-primary">+{gift.xpBonus} XP</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Gift className="w-4 h-4 text-accent" />
                  <span className="font-bold text-accent">+{gift.creditsBonus} Credits</span>
                </div>
              </div>

              {/* Timer and claim button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {getTimeRemaining(gift.expiresAt)}
                </div>
                <Button
                  size="sm"
                  onClick={() => claimGift(gift)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
                >
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
