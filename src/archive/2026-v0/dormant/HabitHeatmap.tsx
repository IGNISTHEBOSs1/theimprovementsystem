import { motion } from 'framer-motion';
import { Habit } from './useGameState';
import { cn } from '@/lib/utils';
import { Flame, Zap, TrendingUp } from 'lucide-react';

interface HabitHeatmapProps {
  habit: Habit;
  onToggleDay: (habitId: string, dayIndex: number) => void;
  index: number;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_ABBR = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export const HabitHeatmap = ({ habit, onToggleDay, index }: HabitHeatmapProps) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun

  // completedDays[0] = day 1 of this month
  // completedDays[todayDate-1] = today
  // completedDays has daysInMonth entries (or 30, whichever we filled)
  const todayIndex = todayDate - 1; // 0-based index for today

  const getCompletion = (calDay: number): boolean => {
    const idx = calDay - 1;
    return idx < habit.completedDays.length ? habit.completedDays[idx] : false;
  };

  const isToday = (d: number) => d === todayDate;
  const isFuture = (d: number) => d > todayDate;
  const completedThisMonth = habit.completedDays.slice(0, todayDate).filter(Boolean).length;
  const completionRate = todayDate > 0 ? Math.round((completedThisMonth / todayDate) * 100) : 0;
  const todayDone = getCompletion(todayDate);

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null); // empty leading cells
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null); // trailing empty

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass rounded-2xl p-4 border border-white/10 hover:border-primary/20 transition-all duration-250 top-light relative overflow-hidden"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{habit.icon}</span>
          <div>
            <h4 className="font-display font-bold text-foreground text-sm leading-none">{habit.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-0.5 text-orange-400 text-[10px]">
                <Flame className="w-3 h-3" />{habit.streak}d
              </span>
              <span className="flex items-center gap-0.5 text-muted-foreground text-[10px]">
                <TrendingUp className="w-3 h-3" />{completionRate}%
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-green-400 text-xs justify-end">
            <Zap className="w-3 h-3" /><span className="font-bold">+{habit.winXp}</span>
          </div>
          <div className="text-red-400 text-[10px]">-{habit.loseXp} miss</div>
        </div>
      </div>

      {/* Today action */}
      <div className={cn(
        'flex items-center justify-between p-2.5 rounded-xl mb-3 border',
        todayDone ? 'bg-green-500/10 border-green-500/30' : 'bg-primary/5 border-primary/20'
      )}>
        <div>
          <p className="text-xs font-bold text-foreground">Today · {MONTH_NAMES[month]} {todayDate}</p>
          <p className="text-[10px] text-muted-foreground">
            {todayDone ? `✅ Done! +${habit.winXp} XP` : `Complete for +${habit.winXp} XP`}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
          onClick={() => onToggleDay(habit.id, todayIndex)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0',
            todayDone
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-primary text-white shadow-md shadow-primary/25'
          )}
        >
          {todayDone ? 'Undo' : 'Done'}
        </motion.button>
      </div>

      {/* Calendar */}
      <div>
        <p className="text-label text-muted-foreground font-bold uppercase tracking-widest mb-1.5">
          {MONTH_NAMES[month]} {year}
        </p>
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_ABBR.map(d => (
            <div key={d} className="text-[9px] text-center text-muted-foreground/40 font-medium">{d}</div>
          ))}
        </div>
        {/* Calendar rows */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0.5 mb-0.5">
            {week.map((day, ci) => {
              if (day === null) return <div key={ci} />;
              const done = getCompletion(day);
              const tod = isToday(day);
              const fut = isFuture(day);
              const past = day < todayDate;

              return (
                <div key={ci} className="relative group">
                  <div
                    onClick={() => tod && onToggleDay(habit.id, day - 1)}
                    className={cn(
                      'h-6 w-full rounded-sm flex items-center justify-center text-[9px] font-medium select-none transition-all',
                      tod && done  && 'bg-green-500 text-white cursor-pointer shadow-[0_0_8px_rgba(34,197,94,0.7)]',
                      tod && !done && 'bg-primary/25 border border-primary/50 text-primary ring-1 ring-primary/30 cursor-pointer',
                      past && done  && 'bg-green-600/40 text-green-300/70 shadow-[0_0_4px_rgba(34,197,94,0.3)]',
                      past && !done && 'bg-red-900/15 text-red-400/30',
                      fut && 'bg-white/3 text-muted-foreground/20',
                    )}
                  >
                    {tod ? (done ? '✓' : day) : past ? (done ? '✓' : day) : day}
                  </div>
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-md text-[9px] bg-background/95 border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg">
                    {MONTH_NAMES[month]} {day}
                    {fut ? ' · Future' : tod ? (done ? ' · Done ✓' : ' · Today') : done ? ' · Done ✓' : ' · Missed'}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <p className="text-[9px] text-muted-foreground/30 mt-1.5">Past days locked · Only today is editable</p>
      </div>
    </motion.div>
  );
};
