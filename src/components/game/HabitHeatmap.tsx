import { motion } from 'framer-motion';
import { Habit } from '@/hooks/useGameState';
import { cn } from '@/lib/utils';
import { Flame, Zap, Lock, TrendingUp } from 'lucide-react';

interface HabitHeatmapProps {
  habit: Habit;
  onToggleDay: (habitId: string, dayIndex: number) => void;
  index: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HabitHeatmap = ({ habit, onToggleDay, index }: HabitHeatmapProps) => {
  // Always use the last index as "today" — the array is a rolling 30-day window
  // Index 29 = today, 28 = yesterday, etc.
  const todayIndex = habit.completedDays.length - 1;

  // Get day labels based on real dates
  const getDayLabel = (offsetFromToday: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offsetFromToday);
    return DAYS[date.getDay()];
  };

  const getDateLabel = (absoluteIndex: number) => {
    const offsetFromToday = absoluteIndex - todayIndex;
    const date = new Date();
    date.setDate(date.getDate() + offsetFromToday);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isPast = (i: number) => i < todayIndex;
  const isToday = (i: number) => i === todayIndex;
  const isFuture = (i: number) => i > todayIndex;

  // Build weeks grid
  const weeks: { index: number }[][] = [];
  let week: { index: number }[] = [];
  for (let i = 0; i < habit.completedDays.length; i++) {
    week.push({ index: i });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) weeks.push(week);

  const completedCount = habit.completedDays.filter(Boolean).length;
  const completionRate = Math.round((completedCount / habit.completedDays.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#080810] rounded-2xl p-5 border border-white/8 hover:border-primary/20 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{habit.icon}</span>
          <div>
            <h4 className="font-display font-bold text-foreground text-base">{habit.name}</h4>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs text-orange-400 font-bold">{habit.streak} day streak</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-primary/60" />
                <span className="text-xs text-muted-foreground">{completionRate}% rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* XP stakes - unique per habit */}
        <div className="text-right">
          <div className="flex items-center gap-1 text-green-400 text-sm justify-end">
            <Zap className="w-3.5 h-3.5" />
            <span className="font-display font-bold">+{habit.winXp} XP</span>
          </div>
          <div className="text-red-400 text-xs font-semibold mt-0.5">
            -{habit.loseXp} XP if missed
          </div>
        </div>
      </div>

      {/* Today's action - prominent */}
      <div className={cn(
        'flex items-center justify-between p-3 rounded-xl mb-4 border transition-all',
        habit.completedDays[todayIndex]
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-primary/5 border-primary/20'
      )}>
        <div>
          <p className="text-xs font-bold text-foreground">Today — {getDateLabel(todayIndex)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {habit.completedDays[todayIndex] ? '✅ Completed! +' + habit.winXp + ' XP earned' : 'Mark complete to earn +' + habit.winXp + ' XP'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggleDay(habit.id, todayIndex)}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all',
            habit.completedDays[todayIndex]
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-primary text-white shadow-lg shadow-primary/20'
          )}
        >
          {habit.completedDays[todayIndex] ? 'Undo' : 'Complete'}
        </motion.button>
      </div>

      {/* 30-day heatmap */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">30-Day History</p>
        <div className="space-y-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex gap-1">
              {week.map(({ index: di }) => {
                const completed = habit.completedDays[di];
                const past = isPast(di);
                const today = isToday(di);
                const future = isFuture(di);

                return (
                  <div key={di} className="relative group">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-sm border transition-all',
                        today && completed && 'bg-green-500 border-green-400/60 shadow-[0_0_8px_rgba(34,197,94,0.4)] cursor-pointer',
                        today && !completed && 'bg-primary/30 border-primary/60 ring-1 ring-primary animate-pulse cursor-pointer',
                        past && completed && 'bg-green-600/40 border-green-500/20 cursor-default',
                        past && !completed && 'bg-red-900/20 border-red-800/15 cursor-default',
                        future && 'bg-white/3 border-white/5 cursor-default opacity-20',
                      )}
                      onClick={() => today && onToggleDay(habit.id, di)}
                    >
                      {past && <Lock className="w-2.5 h-2.5 mx-auto mt-1.5 text-white/15" />}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-lg text-[9px] bg-[#0d0d14] border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                      <p className="font-medium">{getDateLabel(di)}</p>
                      <p className={completed ? 'text-green-400' : past ? 'text-red-400' : today ? 'text-primary' : 'text-muted-foreground'}>
                        {future ? 'Future' : today ? (completed ? 'Done ✓' : 'Today') : completed ? 'Completed ✓' : 'Missed ✗'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          🔒 Past days locked · Only today can be marked
        </p>
      </div>
    </motion.div>
  );
};
