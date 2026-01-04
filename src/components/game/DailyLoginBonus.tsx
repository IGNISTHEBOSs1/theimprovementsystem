import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Coins, Zap, X, Gift, Calendar } from 'lucide-react';
import { LoginBonusData } from '@/hooks/useDailyLoginBonus';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DailyLoginBonusProps {
  isVisible: boolean;
  bonusData: LoginBonusData;
  onClaim: () => void;
  onDismiss: () => void;
}

const STREAK_DAYS = [1, 2, 3, 4, 5, 6, 7];

export const DailyLoginBonus = ({ isVisible, bonusData, onClaim, onDismiss }: DailyLoginBonusProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="relative w-full max-w-md glass rounded-2xl border border-primary/30 overflow-hidden"
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/30 blur-3xl rounded-full" />
            
            {/* Close button */}
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative p-6 text-center">
              {/* Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">Daily Login Bonus!</h2>
                <p className="text-muted-foreground mt-1">Welcome back, Hunter!</p>
              </motion.div>

              {/* Streak indicator */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <Flame className="w-6 h-6 text-orange-500" />
                <span className="font-display text-3xl font-bold text-orange-500">
                  {bonusData.currentStreak} Day Streak!
                </span>
              </motion.div>

              {/* Streak progress */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center gap-2 mb-6"
              >
                {STREAK_DAYS.map((day) => (
                  <div
                    key={day}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all",
                      day <= bonusData.currentStreak
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {day === 7 ? '🎁' : day}
                  </div>
                ))}
              </motion.div>

              {/* Rewards */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-4 mb-6"
              >
                <div className="glass rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">XP Bonus</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-primary">
                    +{bonusData.bonusXp}
                  </p>
                </div>
                <div className="glass rounded-xl p-4 border border-accent/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted-foreground">Credits</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-accent">
                    +{bonusData.bonusCredits}
                  </p>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-6 mb-6 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Total: {bonusData.totalLogins} logins</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>Best: {bonusData.longestStreak} days</span>
                </div>
              </motion.div>

              {/* Claim button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={onClaim}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold py-6 text-lg"
                >
                  Claim Rewards!
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
