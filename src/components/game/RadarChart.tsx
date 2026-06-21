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
import { PlayerStats } from '@/hooks/useGameState';
import { getHunterPower, getStatProgress, getStatXpRequired, zeroStat } from '@/lib/attributeXp';
import { Button } from '@/components/ui/button';
import { Timer, Clock, Calendar, CalendarDays, Infinity, Zap } from 'lucide-react';

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
  FIT: { full: 'Fitness',      jp: 'フィットネス' },
  SOC: { full: 'Social',       jp: 'ソーシャル'   },
  INT: { full: 'Intelligence', jp: '知性'         },
  DIS: { full: 'Discipline',   jp: '規律'         },
  FOC: { full: 'Focus',        jp: '集中'         },
  FIN: { full: 'Finance',      jp: '財務'         },
};

const timeFilters: { key: TimeFilter; label: string; icon: React.ReactNode }[] = [
  { key: 'today', label: 'Today',    icon: <Clock       className="w-3 h-3" /> },
  { key: 'month', label: 'Month',    icon: <Calendar    className="w-3 h-3" /> },
  { key: 'year',  label: 'Year',     icon: <CalendarDays className="w-3 h-3" /> },
  { key: 'all',   label: 'All Time', icon: <Infinity    className="w-3 h-3" /> },
];

// Fallback stat for safety — starts at level 1 per design decision
const FALLBACK_STATS: PlayerStats = {
  FIT: zeroStat(), SOC: zeroStat(), INT: zeroStat(),
  DIS: zeroStat(), FOC: zeroStat(), FIN: zeroStat(),
};

export const RadarChartComponent = ({ stats, pomodoroStats }: RadarChartProps) => {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('all');

  const safeStats: PlayerStats = stats || FALLBACK_STATS;

  // Fixed soft-cap domain: 0–50.
  // chartValue is clamped to 50 for rendering — prevents one outlier stat
  // from compressing all other stats into the bottom 10% of the chart.
  // The real level is always preserved in .value and shown in tooltip/bars.
  const CHART_DOMAIN_MAX = 50;

  const data = (Object.entries(safeStats) as [keyof PlayerStats, PlayerStats[keyof PlayerStats]][]).map(([key, stat]) => ({
    stat:       key,
    chartValue: Math.min(stat.level, CHART_DOMAIN_MAX), // drives chart shape only
    value:      stat.level,                              // real level — used in display
    progress:   getStatProgress(stat),                   // 0–100% within current level
    xp:         stat.xp,
    overflow:   stat.level > CHART_DOMAIN_MAX,           // true when stat exceeds soft cap
    multiplier: stat.level > CHART_DOMAIN_MAX
      ? (stat.level / CHART_DOMAIN_MAX).toFixed(1)
      : null,
    label: statLabels[key]?.full ?? key,
    jp:    statLabels[key]?.jp   ?? key,
  }));

  const hunterPower = getHunterPower(safeStats);
  const avgLevel    = Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length);

  // Tooltip always shows the real stat level and XP — never the clamped chartValue.
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const statObj = safeStats[d.stat as keyof PlayerStats];
    const xpRequired = getStatXpRequired(statObj.level);
    return (
      <div className="glass rounded-lg p-3 border border-primary/30 min-w-[160px]">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="font-display font-bold text-primary text-sm">{d.label}</p>
          {/* Overflow badge — only shown when stat exceeds the chart soft cap */}
          {d.overflow && (
            <span className="text-[10px] font-display font-bold text-accent bg-accent/15 border border-accent/30 px-1.5 py-0.5 rounded-full">
              ×{d.multiplier}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-jp mb-2">{d.jp}</p>
        {/* Real level — always the actual value, not the clamped chartValue */}
        <p className="text-lg font-display font-bold">
          Lv. <span className="text-primary">{d.value}</span>
          {d.overflow && (
            <span className="text-[10px] text-muted-foreground font-sans ml-1.5">
              (chart capped at 50)
            </span>
          )}
        </p>
        {/* XP progress bar within current level */}
        <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            style={{ width: `${d.progress}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {statObj.xp} / {xpRequired} XP to next level
        </p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-6 border-glow-secondary"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Player Stats</h3>
          <p className="text-sm text-muted-foreground font-jp">ステータス</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="font-display font-bold text-primary text-xl">
              {hunterPower}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground text-right">
            Hunter Power · Avg Lv.{avgLevel}
          </p>
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

      {/* Radar Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
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
              domain={[0, CHART_DOMAIN_MAX]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickCount={6}
              stroke="hsl(var(--border))"
            />
            {/* dataKey uses chartValue (clamped to 50), not value (real level) */}
            <Radar
              name="Stats"
              dataKey="chartValue"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>

      {/* Stat bars — always show real level and XP progress within that level.
          Overflow badge (×N.N) appears when stat.level > 50 (the chart soft cap). */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {data.map((stat) => (
          <div key={stat.stat}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-display font-semibold text-muted-foreground">
                {stat.stat}
              </span>
              <div className="flex items-center gap-1.5">
                {/* Overflow badge — visible when stat has exceeded the soft cap */}
                {stat.overflow && (
                  <span className="text-[9px] font-display font-bold text-accent bg-accent/15 border border-accent/25 px-1 py-0.5 rounded-full leading-none">
                    ×{stat.multiplier}
                  </span>
                )}
                <span className={`text-xs font-display font-bold ${stat.overflow ? 'text-accent' : 'text-foreground'}`}>
                  Lv.{stat.value}
                </span>
              </div>
            </div>
            {/* XP progress within the current level */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.progress}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className={`h-full rounded-full ${
                  stat.overflow
                    ? 'bg-gradient-to-r from-accent to-yellow-400'
                    : 'bg-gradient-to-r from-primary to-accent'
                }`}
              />
            </div>
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
                {pomodoroStats.todaySessions}{' '}
                <span className="text-xs text-muted-foreground">sessions</span>
              </p>
              <p className="text-xs text-muted-foreground">{pomodoroStats.todayMinutes} mins</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">All Time</p>
              <p className="font-display font-bold text-foreground">
                {pomodoroStats.totalSessions}{' '}
                <span className="text-xs text-muted-foreground">sessions</span>
              </p>
              <p className="text-xs text-muted-foreground">{pomodoroStats.totalMinutes} mins</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
