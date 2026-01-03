import { motion } from 'framer-motion';
import { Lock, Shield, Skull, Check, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export const GateEncounter = () => {
  const weekProgress = [true, true, true, false, false, false, false];
  const daysCompleted = weekProgress.filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Boss Header */}
      <div className="relative h-48 bg-gradient-to-br from-red-950/50 via-card to-purple-950/30 p-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-display font-semibold">
                GATE BOSS
              </div>
              <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-display font-semibold">
                A-RANK
              </div>
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">Hollow Magician</h2>
            <p className="text-muted-foreground font-jp text-lg mt-1">ホロウ・マジシャン</p>
          </div>
          
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500/20 to-purple-500/20 border border-red-500/30 flex items-center justify-center">
            <Skull className="w-14 h-14 text-red-400" />
          </div>
        </div>
      </div>

      {/* Challenge Info */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-foreground">7-Day Challenge</h3>
        </div>

        <p className="text-muted-foreground mb-6">
          Complete all daily quests for 7 consecutive days to defeat this boss and unlock the next gate.
        </p>

        {/* Progress tracker */}
        <div className="flex items-center gap-2 mb-6">
          {weekProgress.map((completed, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold border-2",
                completed
                  ? "bg-success/20 border-success text-success"
                  : index === daysCompleted
                    ? "bg-primary/20 border-primary text-primary animate-pulse"
                    : "bg-muted/50 border-muted text-muted-foreground"
              )}
            >
              {completed ? <Check className="w-5 h-5" /> : index + 1}
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-display font-bold text-foreground">{daysCompleted}/7 Days</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(daysCompleted / 7) * 100}%` }}
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
            />
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-card rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-accent" />
            <h4 className="font-display font-bold text-foreground">Victory Rewards</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <RewardItem label="XP" value="+500" color="primary" />
            <RewardItem label="Credits" value="+100" color="accent" />
            <RewardItem label="Title" value="Boss Slayer" color="secondary" />
          </div>
        </div>

        {/* Locked notice */}
        <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
          <Lock className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-destructive font-semibold">Gate Locked</p>
            <p className="text-sm text-muted-foreground">Complete the challenge to unlock</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RewardItem = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="text-center">
    <div className={cn(
      "font-display font-bold text-lg",
      color === 'primary' && "text-primary",
      color === 'accent' && "text-accent",
      color === 'secondary' && "text-secondary"
    )}>
      {value}
    </div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);
