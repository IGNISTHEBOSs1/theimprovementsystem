import { motion } from 'framer-motion';
import { Habit } from '@/hooks/useGameState';
import { cn } from '@/lib/utils';
import { Flame, Zap } from 'lucide-react';

interface HabitHeatmapProps {
  habit: Habit;
  onToggleDay: (habitId: string, dayIndex: number) => void;
  index: number;
}

export const HabitHeatmap = ({ habit, onToggleDay, index }: HabitHeatmapProps) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Generate weeks (4 weeks = 28-30 days)
  const weeks = [];
  for (let i = 0; i < habit.completedDays.length; i += 7) {
    weeks.push(habit.completedDays.slice(i, i + 7));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-2xl p-5 border border-white/10 hover:border-primary/20 transition-colors"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{habit.icon}</span>
          <div>
            <h4 className="font-display font-bold text-foreground text-lg">{habit.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-400 font-display font-semibold">
                {habit.streak} day streak
              </span>
            </div>
          </div>
        </div>

        {/* XP Stakes */}
        <div className="text-right">
          <div className="flex items-center gap-1 text-success text-sm">
            <Zap className="w-4 h-4" />
            <span className="font-display font-bold">+{habit.winXp} XP</span>
          </div>
          <div className="text-destructive text-sm font-display font-semibold mt-0.5">
            -{habit.loseXp} XP
          </div>
        </div>
      </div>

      {/* Day labels */}
      <div className="flex gap-1 mb-1 ml-0">
        {days.map((day, i) => (
          <div key={i} className="w-6 h-4 flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground font-medium">{day}</span>
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-1">
            {week.map((completed, dayIndex) => {
              const absoluteIndex = weekIndex * 7 + dayIndex;
              return (
                <motion.button
                  key={dayIndex}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onToggleDay(habit.id, absoluteIndex)}
                  className={cn(
                    "w-6 h-6 rounded-sm transition-all duration-200 border",
                    completed
                      ? "bg-success border-success/50 shadow-[0_0_8px_hsl(var(--success)/0.3)]"
                      : "bg-muted/50 border-muted hover:border-muted-foreground/30"
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <div className="text-sm">
          <span className="text-muted-foreground">Completion: </span>
          <span className="font-display font-bold text-foreground">
            {Math.round((habit.completedDays.filter(Boolean).length / habit.completedDays.length) * 100)}%
          </span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">This month: </span>
          <span className="font-display font-bold text-success">
            +{habit.completedDays.filter(Boolean).length * habit.winXp} XP
          </span>
        </div>
      </div>
    </motion.div>
  );
};
