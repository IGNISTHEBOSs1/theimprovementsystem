import { motion } from 'framer-motion';
import { Habit } from '@/hooks/useGameState';
import { cn } from '@/lib/utils';
import { Flame, Zap, Lock } from 'lucide-react';

interface HabitHeatmapProps {
  habit: Habit;
  onToggleDay: (habitId: string, dayIndex: number) => void;
  index: number;
  userTimezone?: string;
}

export const HabitHeatmap = ({ habit, onToggleDay, index, userTimezone }: HabitHeatmapProps) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Get today's index in the 30-day window using user's timezone
  const getTodayIndex = () => {
    const tz = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD
    
    // The last index (29) always represents today
    // Previous indexes represent previous days
    return habit.completedDays.length - 1;
  };

  const todayIndex = getTodayIndex();

  const isPastDay = (absoluteIndex: number) => absoluteIndex < todayIndex;
  const isFutureDay = (absoluteIndex: number) => absoluteIndex > todayIndex;
  const isToday = (absoluteIndex: number) => absoluteIndex === todayIndex;

  const weeks = [];
  for (let i = 0; i < habit.completedDays.length; i += 7) {
    weeks.push(habit.completedDays.slice(i, i + 7));
  }

  const handleToggle = (absoluteIndex: number) => {
    // Only allow toggling TODAY — past and future are locked
    if (isToday(absoluteIndex)) {
      onToggleDay(habit.id, absoluteIndex);
    }
  };

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
        <div className="text-right">
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <Zap className="w-4 h-4" />
            <span className="font-display font-bold">+{habit.winXp} XP</span>
          </div>
          <div className="text-red-400 text-sm font-display font-semibold mt-0.5">
            -{habit.loseXp} XP
          </div>
        </div>
      </div>

      {/* Day labels */}
      <div className="flex gap-1 mb-1">
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
              const past = isPastDay(absoluteIndex);
              const future = isFutureDay(absoluteIndex);
              const today = isToday(absoluteIndex);

              return (
                <div key={dayIndex} className="relative group">
                  <motion.button
                    whileHover={today ? { scale: 1.2 } : {}}
                    whileTap={today ? { scale: 0.9 } : {}}
                    onClick={() => handleToggle(absoluteIndex)}
                    disabled={!today}
                    className={cn(
                      "w-6 h-6 rounded-sm transition-all duration-200 border",
                      // Today — interactive
                      today && completed && "bg-green-500 border-green-400/50 shadow-[0_0_8px_rgba(34,197,94,0.4)]",
                      today && !completed && "bg-primary/20 border-primary/50 ring-1 ring-primary/50 animate-pulse cursor-pointer",
                      // Past days — locked, show completion state dimly
                      past && completed && "bg-green-600/50 border-green-500/30 cursor-not-allowed",
                      past && !completed && "bg-red-900/30 border-red-800/20 cursor-not-allowed",
                      // Future days — greyed out
                      future && "bg-muted/20 border-muted/10 cursor-not-allowed opacity-30",
                    )}
                  >
                    {/* Lock icon on past days */}
                    {past && (
                      <Lock className="w-2.5 h-2.5 mx-auto text-white/20" />
                    )}
                  </motion.button>

                  {/* Tooltip */}
                  {(past || today) && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-[9px] bg-card border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {today ? (completed ? '✓ Done today!' : 'Click to complete') : past && completed ? '✓ Completed' : '✗ Missed'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Today indicator */}
      <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
        <span className="w-2 h-2 rounded-sm bg-primary/50 inline-block" />
        Today's cell is highlighted — only today can be marked
      </p>
    </motion.div>
  );
};
