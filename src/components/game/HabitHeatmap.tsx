import { motion } from 'framer-motion';
import { Habit } from '@/hooks/useGameState';
import { cn } from '@/lib/utils';
import { Flame, Zap, Lock, TrendingUp } from 'lucide-react';

interface HabitHeatmapProps {
  habit: Habit;
  onToggleDay: (habitId: string, dayIndex: number) => void;
  index: number;
}

export const HabitHeatmap = ({ habit, onToggleDay, index }: HabitHeatmapProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // The habit was created on a specific date — compute which calendar day each array index maps to
  const createdAt = habit.completedDays.length > 0
    ? (() => {
        // Index 0 = first day of the month the habit was created
        // We store 30 days. Index (today - createdDate) = today's index
        const d = new Date(today);
        d.setDate(d.getDate() - (habit.completedDays.length - 1));
        return d;
      })()
    : today;

  // Today is always the last index
  const todayIndex = habit.completedDays.length - 1;

  const getDate = (arrayIndex: number): Date => {
    const d = new Date(createdAt);
    d.setDate(d.getDate() + arrayIndex);
    return d;
  };

  const getDateLabel = (arrayIndex: number): string => {
    return getDate(arrayIndex).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  };

  const isToday = (i: number) => i === todayIndex;
  const isPast = (i: number) => i < todayIndex;
  const isFuture = (i: number) => i > todayIndex;

  // Build weeks grid from array
  const weeks: number[][] = [];
  let week: number[] = [];

  // Start grid from the weekday of the first entry
  const firstDay = createdAt.getDay(); // 0=Sun
  for (let pad = 0; pad < firstDay; pad++) week.push(-1); // padding

  for (let i = 0; i < habit.completedDays.length; i++) {
    week.push(i);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) weeks.push(week);

  const completedCount = habit.completedDays.filter(Boolean).length;
  const completionRate = Math.round((completedCount / Math.max(1, habit.completedDays.length)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-2xl p-5 border border-white/10 hover:border-primary/20 transition-colors"
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
        <div className="text-right">
          <div className="flex items-center gap-1 text-green-400 text-sm justify-end">
            <Zap className="w-3.5 h-3.5" />
            <span className="font-display font-bold">+{habit.winXp} XP</span>
          </div>
          <div className="text-red-400 text-xs font-semibold mt-0.5">-{habit.loseXp} XP miss</div>
        </div>
      </div>

      {/* Today's action */}
      <div className={cn(
        'flex items-center justify-between p-3 rounded-xl mb-4 border transition-all',
        habit.completedDays[todayIndex]
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-primary/5 border-primary/20'
      )}>
        <div>
          <p className="text-xs font-bold text-foreground">Today — {getDateLabel(todayIndex)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {habit.completedDays[todayIndex]
              ? `✅ Done! +${habit.winXp} XP earned`
              : `Tap to complete · earn +${habit.winXp} XP`}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
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

      {/* Calendar grid */}
      <div>
        {/* Day headers */}
        <div className="flex gap-1 mb-1">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="w-6 text-[9px] text-center text-muted-foreground/40 font-medium">{d}</div>
          ))}
        </div>

        {weeks.map((wk, wi) => (
          <div key={wi} className="flex gap-1 mb-1">
            {wk.map((di, ci) => {
              if (di === -1) return <div key={ci} className="w-6 h-6" />;
              const completed = habit.completedDays[di];
              const past = isPast(di);
              const tod = isToday(di);
              const future = isFuture(di);

              return (
                <div key={ci} className="relative group">
                  <div
                    onClick={() => tod && onToggleDay(habit.id, di)}
                    className={cn(
                      'w-6 h-6 rounded-sm border transition-all flex items-center justify-center',
                      tod && completed && 'bg-green-500 border-green-400/60 shadow-[0_0_6px_rgba(34,197,94,0.5)] cursor-pointer',
                      tod && !completed && 'bg-primary/30 border-primary/60 ring-1 ring-primary/50 animate-pulse cursor-pointer',
                      past && completed && 'bg-green-600/35 border-green-500/20',
                      past && !completed && 'bg-red-900/15 border-red-800/10',
                      future && 'bg-white/3 border-white/5 opacity-20',
                    )}
                  >
                    {past && <Lock className="w-2 h-2 text-white/15" />}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-lg text-[9px] bg-background/95 border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <p className="font-medium">{getDateLabel(di)}</p>
                    <p className={completed ? 'text-green-400' : past ? 'text-red-400/70' : tod ? 'text-primary' : 'text-muted-foreground'}>
                      {future ? 'Future' : tod ? (completed ? 'Done ✓' : 'Today') : completed ? 'Done ✓' : 'Missed ✗'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <p className="text-[9px] text-muted-foreground/40 mt-1">🔒 Past days locked · Today only</p>
      </div>
    </motion.div>
  );
};
