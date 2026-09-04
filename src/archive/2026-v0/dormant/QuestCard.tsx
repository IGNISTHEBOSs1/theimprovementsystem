import { motion } from 'framer-motion';
import { Check, X, Clock, Coins, Zap } from 'lucide-react';
import { Quest } from './useGameState';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuestCardProps {
  quest: Quest;
  onComplete: (id: string) => void;
  onFail: (id: string) => void;
  index: number;
}

const difficultyConfig = {
  Easy:   { style: 'bg-green-500/20 text-green-400 border-green-500/30',    bar: 'bg-green-500',   barGlow: 'shadow-green-500/50' },
  Normal: { style: 'bg-blue-500/20 text-blue-400 border-blue-500/30',       bar: 'bg-blue-500',    barGlow: 'shadow-blue-500/50' },
  Hard:   { style: 'bg-purple-500/20 text-purple-400 border-purple-500/30', bar: 'bg-purple-500',  barGlow: 'shadow-purple-500/50' },
  Urgent: { style: 'bg-red-500/20 text-red-400 border-red-500/30',          bar: 'bg-red-500',     barGlow: 'shadow-red-500/50' },
};

export const QuestCard = ({ quest, onComplete, onFail, index }: QuestCardProps) => {
  const isActionable = !quest.completed && !quest.failed;
  const diff = difficultyConfig[quest.difficulty] || difficultyConfig.Normal;

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
        whileHover={isActionable ? { y: -1, boxShadow: 'var(--shadow-glow-primary)' } : undefined}
        className={cn(
          'relative rounded-xl border transition-all duration-200 group overflow-hidden',
          quest.completed && 'border-success/40 bg-success/5',
          quest.failed   && 'border-destructive/30 bg-destructive/5 opacity-60',
          isActionable   && 'border-white/8 bg-card hover:border-primary/30 hover:bg-card-elevated hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
        )}
      >
        {/* Left accent bar */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1 rounded-l-xl',
            quest.completed && 'bg-success',
            quest.failed    && 'bg-destructive',
            isActionable    && diff.bar
          )}
          style={{ boxShadow: isActionable ? `0 0 8px ${diff.barGlow}` : undefined }}
        />

        <div className="pl-4 pr-4 py-4 flex items-start justify-between gap-4">
          {/* Left side */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {quest.completed ? (
                <span className="text-label px-2 py-0.5 rounded border bg-success/20 text-success border-success/30 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Completed
                </span>
              ) : quest.failed ? (
                <span className="text-label px-2 py-0.5 rounded border bg-destructive/20 text-destructive border-destructive/30 flex items-center gap-1">
                  <X className="w-3 h-3" /> Failed
                </span>
              ) : (
                <span className={cn('text-label px-2 py-0.5 rounded border', diff.style)}>
                  {quest.difficulty}
                </span>
              )}
              <span className="text-caption text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {quest.timeFrame}
              </span>
            </div>

            <h4 className={cn(
              'font-semibold text-foreground mb-2 text-body-sm',
              (quest.completed || quest.failed) && 'line-through text-muted-foreground'
            )}>
              {quest.title}
            </h4>

            {/* Rewards — right-aligned within left col */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="font-display font-semibold text-primary text-caption">+{quest.xpReward} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-accent" />
                <span className="font-display font-semibold text-accent text-caption">+{quest.creditReward}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {isActionable ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => onComplete(quest.id)}
                      className="w-11 h-11 rounded-xl bg-success/20 text-success border border-success/30 flex-center hover:bg-success/30 hover:shadow-[0_0_12px_hsl(var(--success)/0.4)] transition-all touch-target"
                      aria-label="Complete quest"
                    >
                      <Check className="w-5 h-5" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Complete</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => onFail(quest.id)}
                      className="w-11 h-11 rounded-xl bg-destructive/20 text-destructive border border-destructive/30 flex-center hover:bg-destructive/30 hover:shadow-[0_0_12px_hsl(var(--destructive)/0.4)] transition-all touch-target"
                      aria-label="Abandon quest"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Abandon</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <div className={cn(
                'w-11 h-11 rounded-xl flex-center border',
                quest.completed && 'bg-success/20 text-success border-success/30',
                quest.failed    && 'bg-destructive/20 text-destructive border-destructive/30'
              )}>
                {quest.completed ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};
