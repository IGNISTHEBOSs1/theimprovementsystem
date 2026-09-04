import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { PlayerStats } from './useGameState';
import { Button } from '@/components/ui/button';
import { Timer, Clock, Calendar, CalendarDays, Infinity } from 'lucide-react';

interface RadarChartProps {
  stats: PlayerStats;
  pomodoroStats?: {
    totalSessions: number;
    totalMinutes: number;
    todaySessions: number;
    todayMinutes: number;
  };
}

type TimeFilter = 'today' | 'month' | 'year' | 'all';

const statLabels: Record<keyof PlayerStats, { full: string; jp: string }> = {
  FIT: { full: 'Fitness', jp: 'フィットネス' },
  SOC: { full: 'Social', jp: 'ソーシャル' },
  INT: { full: 'Intelligence', jp: '知性' },
  DIS: { full: 'Discipline', jp: '規律' },
  FOC: { full: 'Focus', jp: '集中' },
  FIN: { full: 'Finance', jp: '財務' },
};

const timeFilters: { key: TimeFilter; label: string; icon: React.ReactNode }[] = [
  { key: 'today', label: 'Today', icon: <Clock className="w-3 h-3" /> },
  { key: 'month', label: 'Month', icon: <Calendar className="w-3 h-3" /> },
  { key: 'year', label: 'Year', icon: <CalendarDays className="w-3 h-3" /> },
  { key: 'all', label: 'All Time', icon: <Infinity className="w-3 h-3" /> },
];

export const RadarChartComponent = ({ stats, pomodoroStats }: RadarChartProps) => {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('all');

  // For now, we show the same stats for all filters
  // In a real implementation, you'd fetch historical data
  const safeStats = stats || { FIT: 0, SOC: 0, INT: 0, DIS: 0, FOC: 0, FIN: 0 };
  const data = Object.entries(safeStats).map(([key, value]) => ({
    stat: key,
    value,
    fullMark: 100,
    label: statLabels[key as keyof PlayerStats]?.full || key,
    jp: statLabels[key as keyof PlayerStats]?.jp || key,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass rounded-lg p-3 border border-primary/30">
          <p className="font-display font-bold text-primary">{data.label}</p>
          <p className="text-xs text-muted-foreground font-jp">{data.jp}</p>
          <p className="text-lg font-bold mt-1">{data.value}/100</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-6 border-glow-secondary"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Player Stats</h3>
          <p className="text-sm text-muted-foreground font-jp">ステータス</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-display font-bold text-gradient-blue">
            {Math.round(Object.values(safeStats).reduce((a, b) => a + b, 0) / 6)}
          </span>
          <p className="text-xs text-muted-foreground">AVG</p>
        </div>
      </div>

      {/* Time Filter Tabs */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-lg mb-4">
        {timeFilters.map((filter) => (
          <Button
            key={filter.key}
            variant="ghost"
            size="sm"
            onClick={() => setActiveFilter(filter.key)}
            className={`flex-1 text-xs gap-1 ${
              activeFilter === filter.key
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter.icon}
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid 
              stroke="hsl(var(--border))" 
              strokeOpacity={0.3}
            />
            <PolarAngleAxis
              dataKey="stat"
              tick={{ 
                fill: 'hsl(var(--muted-foreground))', 
                fontSize: 12,
                fontFamily: 'Orbitron',
                fontWeight: 600,
              }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickCount={5}
              stroke="hsl(var(--border))"
            />
            <Radar
              name="Stats"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>

      {/* Stat bars below chart */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {data.map((stat) => (
          <div key={stat.stat} className="flex items-center gap-2">
            <span className="text-xs font-display font-semibold text-muted-foreground w-8">{stat.stat}</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.value}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="h-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
            <span className="text-xs font-display font-bold text-foreground w-6">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Pomodoro Stats Section */}
      {pomodoroStats && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Timer className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold text-foreground">Focus Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="font-display font-bold text-foreground">
                {pomodoroStats.todaySessions} <span className="text-xs text-muted-foreground">sessions</span>
              </p>
              <p className="text-xs text-muted-foreground">{pomodoroStats.todayMinutes} mins</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">All Time</p>
              <p className="font-display font-bold text-foreground">
                {pomodoroStats.totalSessions} <span className="text-xs text-muted-foreground">sessions</span>
              </p>
              <p className="text-xs text-muted-foreground">{pomodoroStats.totalMinutes} mins</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
