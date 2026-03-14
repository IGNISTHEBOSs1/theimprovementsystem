import { motion } from 'framer-motion';
import { AlertTriangle, Gift, Flame, Trophy, Bell } from 'lucide-react';
import { SystemMessage } from '@/hooks/useGameState';
import { cn } from '@/lib/utils';

interface SystemLogProps {
  messages: SystemMessage[];
}

const messageStyles = {
  streak: { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  boost: { icon: Gift, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  achievement: { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
};

export const SystemLog = ({ messages }: SystemLogProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-2xl border-glow-primary h-full flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-bold text-foreground">System Log</h3>
        </div>
        <p className="text-sm text-muted-foreground font-jp mt-1">システムメッセージ</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => {
          const style = messageStyles[msg.type];
          const Icon = style.icon;
          
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-3 rounded-lg border border-white/5",
                style.bg
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg bg-card/50", style.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{msg.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Active Boosts Section */}
        <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
          <h4 className="font-display text-sm font-bold text-primary mb-3">Active Boosts</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">XP Multiplier</span>
              <span className="font-display font-bold text-accent">1.2x</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Streak Bonus</span>
              <span className="font-display font-bold text-success">+10%</span>
            </div>
          </div>
        </div>

        {/* Daily Progress */}
        <div className="p-4 rounded-lg bg-card border border-white/5">
          <h4 className="font-display text-sm font-bold text-foreground mb-3">Today's Progress</h4>
          <div className="space-y-3">
            <ProgressItem label="Quests" current={3} total={5} color="primary" />
            <ProgressItem label="Habits" current={4} total={4} color="success" />
            <ProgressItem label="Focus Time" current={3.5} total={6} color="secondary" suffix="h" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProgressItem = ({ 
  label, 
  current, 
  total, 
  color,
  suffix = ''
}: { 
  label: string; 
  current: number; 
  total: number; 
  color: string;
  suffix?: string;
}) => {
  const percentage = (current / total) * 100;
  
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-display font-semibold">
          {current}{suffix} / {total}{suffix}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className={cn(
            "h-full rounded-full",
            color === 'primary' && "bg-primary",
            color === 'success' && "bg-success",
            color === 'secondary' && "bg-secondary"
          )}
        />
      </div>
    </div>
  );
};
