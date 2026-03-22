import { motion } from 'framer-motion';
import { Habit } from '@/hooks/useGameState';
import { cn } from '@/lib/utils';
import { Flame, Zap, Lock, TrendingUp } from 'lucide-react';

interface HabitHeatmapProps {
  habit: Habit;
  onToggleDay: (habitId: string, dayIndex: number) => void;
  index: number;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS = ['S','M','T','W','T','F','S'];

export const HabitHeatmap = ({ habit, onToggleDay, index }: HabitHeatmapProps) => {
  // Build a real calendar for the current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const todayDate = now.getDate(); // 1-indexed

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

  // The habit.completedDays array is 30 days rolling ending at today
  // Map array index to calendar day:
  // todayIndex in array = habit.completedDays.length - 1
  // that corresponds to calendar day = todayDate
  // so array[i] corresponds to date: todayDate - (todayIndex - i)
  const todayIndex = habit.completedDays.length - 1;

  const getArrayIndexForDate = (calDay: number): number | null => {
    const offset = todayDate - calDay; // how many days ago
    const arrayIdx = todayIndex - offset;
    if (arrayIdx < 0 || arrayIdx > todayIndex) return null;
    return arrayIdx;
  };

  const isToday = (calDay: number) => calDay === todayDate;
  const isFuture = (calDay: number) => calDay > todayDate;
  const isPast = (calDay: number) => calDay < todayDate;

  const getDateLabel = (calDay: number) =>
    `${MONTH_NAMES[month]} ${calDay}, ${year}`;

  // Build calendar grid rows
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null); // padding
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  // Pad to complete last week
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  const completedCount = habit.completedDays.filter(Boolean).length;
  const completionRate = Math.round((completedCount / Math.max(1, habit.completedDays.length)) * 100);
  const todayArrayIdx = getArrayIndexForDate(todayDate);
  const todayCompleted = todayArrayIdx !== null && habit.completedDays[todayArrayIdx];

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
          <span className="text-2xl">{habit.icon}</span>
          <div>
            <h4 className="font-display font-bold text-foreground text-sm">{habit.name}</h4>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs text-orange-400 font-bold">{habit.streak} day streak</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-primary/60" />
                <span className="text-xs text-muted-foreground">{completionRate}% this month</span>
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

      {/* Today action */}
      <div className={cn(
        'flex items-center justify-between p-3 rounded-xl mb-4 border transition-all',
        todayCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-primary/5 border-primary/20'
      )}>
        <div>
          <p className="text-xs font-bold text-foreground">
            Today — {MONTH_NAMES[month]} {todayDate}, {year}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {todayCompleted
              ? `✅ Completed! +${habit.winXp} XP earned`
              : `Tap to complete · earn +${habit.winXp} XP`}
          </p>
        </div>
        {todayArrayIdx !== null && (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onToggleDay(habit.id, todayArrayIdx)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0',
              todayCompleted
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-primary text-white shadow-lg shadow-primary/20'
            )}
          >
            {todayCompleted ? 'Undo' : 'Complete'}
          </motion.button>
        )}
      </div>

      {/* Month calendar */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-bold">
          {MONTH_NAMES[month]} {year}
        </p>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="text-[9px] text-center text-muted-foreground/40 font-medium py-0.5">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0.5 mb-0.5">
            {week.map((calDay, ci) => {
              if (calDay === null) return <div key={ci} />;

              const arrayIdx = getArrayIndexForDate(calDay);
              const completed = arrayIdx !== null && habit.completedDays[arrayIdx];
              const today = isToday(calDay);
              const future = isFuture(calDay);
              const past = isPast(calDay);
              const inRange = arrayIdx !== null; // within 30-day window

              return (
                <div key={ci} className="relative group">
                  <div
                    onClick={() => today && arrayIdx !== null && onToggleDay(habit.id, arrayIdx)}
                    className={cn(
                      'w-7 h-7 rounded-sm flex items-center justify-center text-[9px] font-medium transition-all',
                      today && completed && 'bg-green-500 text-white shadow-[0_0_6px_rgba(34,197,94,0.6)] cursor-pointer',
                      today && !completed && 'bg-primary/30 border border-primary/60 text-primary ring-1 ring-primary/40 animate-pulse cursor-pointer',
                      past && inRange && completed && 'bg-green-600/30 text-green-400/70',
                      past && inRange && !completed && 'bg-red-900/15 text-red-400/30',
                      past && !inRange && 'bg-white/3 text-muted-foreground/20',
                      future && 'bg-white/2 text-muted-foreground/15',
                    )}
                  >
                    {today ? (completed ? '✓' : calDay) : past && !inRange ? '' : future ? '' : completed ? '✓' : calDay}
                  </div>

                  {/* Tooltip */}
                  {!future && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-lg text-[9px] bg-background/95 border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                      <p className="font-medium">{getDateLabel(calDay)}</p>
                      <p className={
                        today ? 'text-primary' :
                        completed ? 'text-green-400' :
                        inRange ? 'text-red-400/70' : 'text-muted-foreground/50'
                      }>
                        {today ? (completed ? 'Done ✓' : 'Today — tap to complete') : completed ? 'Done ✓' : inRange ? 'Missed ✗' : 'Before tracking'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <p className="text-[9px] text-muted-foreground/40 mt-2">🔒 Past days are locked · only today is editable</p>
      </div>
    </motion.div>
  );
};
