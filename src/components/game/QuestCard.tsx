import { motion } from 'framer-motion';
import { Check, X, Clock, Coins, Zap } from 'lucide-react';
import { Quest } from '@/hooks/useGameState';
import { cn } from '@/lib/utils';

interface QuestCardProps {
  quest: Quest;
  onComplete: (id: string) => void;
  onFail: (id: string) => void;
  index: number;
}

const difficultyStyles = {
  Easy: { badge: 'bg-green-500/20 text-green-400 border-green-500/30', border: 'border-l-green-500' },
  Normal: { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', border: 'border-l-blue-500' },
  Hard: { badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30', border: 'border-l-purple-500' },
  Urgent: { badge: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse', border: 'border-l-red-500' },
};

export const QuestCard = ({ quest, onComplete, onFail, index }: QuestCardProps) => {
  const isActionable = !quest.completed && !quest.failed;
  const styles = difficultyStyles[quest.difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.3), type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        "glass rounded-xl p-4 border-l-4 border transition-all duration-200 group",
        styles.border,
        quest.completed && "border-success/50 bg-success/5",
        quest.failed && "border-destructive/50 bg-destructive/5 opacity-60",
        isActionable && "border-white/10 hover:border-primary/30 hover:bg-card-elevated/30"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left side */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn(
              "text-xs font-display font-semibold px-2 py-0.5 rounded border",
              styles.badge
            )}>
              {quest.difficulty}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {quest.timeFrame}
            </span>
          </div>
          
          <h4 className={cn(
            "font-semibold text-foreground mb-2",
            quest.completed && "line-through text-muted-foreground"
          )}>
            {quest.title}
          </h4>

          {/* Rewards */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-display font-semibold text-primary">+{quest.xpReward} XP</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Coins className="w-4 h-4 text-accent" />
              <span className="font-display font-semibold text-accent">+{quest.creditReward}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {isActionable ? (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onComplete(quest.id)}
                className="w-10 h-10 rounded-lg bg-success/20 text-success border border-success/30 flex items-center justify-center hover:bg-success/30 transition-colors duration-150"
              >
                <Check className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onFail(quest.id)}
                className="w-10 h-10 rounded-lg bg-destructive/20 text-destructive border border-destructive/30 flex items-center justify-center hover:bg-destructive/30 transition-colors duration-150"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </>
          ) : (
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              quest.completed && "bg-success/20 text-success",
              quest.failed && "bg-destructive/20 text-destructive"
            )}>
              {quest.completed ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
