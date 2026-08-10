import { motion } from 'framer-motion';
import { AlertTriangle, Gift, Flame, Trophy, Terminal } from 'lucide-react';
import { SystemMessage } from '@/hooks/useGameState';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SystemLogProps {
  messages: SystemMessage[];
}

const messageStyles = {
  streak:      { icon: Flame,         color: 'text-orange-400',  dot: 'bg-orange-500',  bg: 'bg-orange-500/8' },
  boost:       { icon: Gift,          color: 'text-purple-400',  dot: 'bg-purple-500',  bg: 'bg-purple-500/8' },
  warning:     { icon: AlertTriangle, color: 'text-yellow-400',  dot: 'bg-yellow-500',  bg: 'bg-yellow-500/8' },
  achievement: { icon: Trophy,        color: 'text-amber-400',   dot: 'bg-amber-500',   bg: 'bg-amber-500/8' },
};

export const SystemLog = ({ messages }: SystemLogProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-2xl border border-primary/20 h-full flex flex-col relative overflow-hidden top-light"
      style={{ boxShadow: 'var(--shadow-glow-primary)' }}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none" />

      {/* Header */}
      <div className="relative p-4 border-b border-white/5 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">System Log</h3>
          <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
        </div>
        <p className="text-label text-muted-foreground font-jp mt-1">システムメッセージ</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2 relative">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Terminal className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-caption text-muted-foreground/50 font-mono">Awaiting system events...</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const style = messageStyles[msg.type];
            const Icon = style.icon;
            const isLatest = index === 0;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'relative p-3 rounded-lg border border-white/5 group',
                  style.bg
                )}
              >
                {/* Left color dot */}
                <div className={cn('absolute left-3 top-4 w-1.5 h-1.5 rounded-full', style.dot)} />

                <div className="pl-4">
                  <p className={cn(
                    'text-body-sm font-mono leading-relaxed',
                    style.color,
                    isLatest && 'cursor-blink'
                  )}>
                    {msg.message}
                  </p>
                  <p className="text-label text-muted-foreground/50 mt-1 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Active Boosts */}
          <div className="mt-3 p-3 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
            <h4 className="font-display text-xs font-bold text-primary mb-2 text-label uppercase tracking-wider">Active Boosts</h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-caption text-muted-foreground font-mono">XP_MULTIPLIER</span>
                <span className="font-display font-bold text-accent text-caption">1.2×</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-caption text-muted-foreground font-mono">STREAK_BONUS</span>
                <span className="font-display font-bold text-success text-caption">+10%</span>
              </div>
            </div>
          </div>

          {/* Daily Progress */}
          <div className="p-3 rounded-lg bg-card border border-white/5">
            <h4 className="font-display text-xs font-bold text-foreground mb-2 text-label uppercase tracking-wider">Daily Progress</h4>
            <div className="space-y-2.5">
              <ProgressItem label="QUESTS" current={3} total={5} color="primary" />
              <ProgressItem label="HABITS" current={4} total={4} color="success" />
              <ProgressItem label="FOCUS_H" current={3.5} total={6} color="secondary" suffix="h" />
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

const ProgressItem = ({ label, current, total, color, suffix = '' }: {
  label: string; current: number; total: number; color: string; suffix?: string;
}) => {
  const pct = (current / total) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-label text-muted-foreground font-mono">{label}</span>
        <span className="font-display font-semibold text-caption">
          {current}{suffix} / {total}{suffix}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full',
            color === 'primary'   && 'bg-primary',
            color === 'success'   && 'bg-success',
            color === 'secondary' && 'bg-secondary'
          )}
        />
      </div>
    </div>
  );
};
