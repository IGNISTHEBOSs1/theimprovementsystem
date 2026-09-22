import { useId } from "react";
import { Compass, Radio, Target, Sparkles, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrajectoryVisualizerProps {
  completedQuests: number;
  targetQuests: number;
  isOnTrack: boolean;
  variancePct?: number;
  goalLabel?: string;
  className?: string;
}

const WIDTH = 720;
const HEIGHT = 340;

export function TrajectoryVisualizer({
  completedQuests,
  targetQuests,
  isOnTrack,
  variancePct = 10,
  goalLabel,
  className,
}: TrajectoryVisualizerProps) {
  const gradientId = useId();
  const coneGradId = useId();
  const glowFilterId = useId();

  const progressRatio = Math.min(Math.max(completedQuests / (targetQuests || 1), 0), 1);

  // Coordinate geometry with enhanced vertical amplitude
  const xOrigin = 55;
  const yOrigin = 270;

  const xCurrent = 260;
  // y position: higher progress = lower y (higher altitude on the chart)
  const yCurrent = yOrigin - progressRatio * 150;

  const xGoal = 650;
  const yGoal = 60;

  // Predictive Bezier Curve: Smooth glide slope from current position to destination
  const dx = xGoal - xCurrent;
  const dy = yGoal - yCurrent;

  const c1x = xCurrent + dx * 0.40;
  const c1y = yCurrent + dy * 0.18;
  const c2x = xCurrent + dx * 0.72;
  const c2y = yGoal + (yCurrent - yGoal) * 0.08;

  const predictiveCurvePath = `M ${xCurrent} ${yCurrent} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${xGoal} ${yGoal}`;

  // Cone of Possibility: 10% acceptable variance corridor expanding from Current to Goal
  const varianceSpan = 42; // +/- 10% variance expansion at horizon
  const yGoalUpper = yGoal - varianceSpan;
  const yGoalLower = yGoal + varianceSpan;

  const c1yUpper = c1y - varianceSpan * 0.40;
  const c2yUpper = c2y - varianceSpan * 0.85;

  const c1yLower = c1y + varianceSpan * 0.40;
  const c2yLower = c2y + varianceSpan * 0.85;

  // Closed cone path: Current -> Upper Curve -> Goal Top -> Goal Bottom -> Lower Curve -> Current
  const conePath = `
    M ${xCurrent} ${yCurrent}
    C ${c1x} ${c1yUpper}, ${c2x} ${c2yUpper}, ${xGoal} ${yGoalUpper}
    L ${xGoal} ${yGoalLower}
    C ${c2x} ${c2yLower}, ${c1x} ${c1yLower}, ${xCurrent} ${yCurrent}
    Z
  `;

  // Historic Flight Trail from departure to current position
  const trailC1x = xOrigin + (xCurrent - xOrigin) * 0.5;
  const trailC1y = yOrigin;
  const trailC2x = xOrigin + (xCurrent - xOrigin) * 0.75;
  const trailC2y = yCurrent + (yOrigin - yCurrent) * 0.2;
  const historicTrailPath = `M ${xOrigin} ${yOrigin} C ${trailC1x} ${trailC1y}, ${trailC2x} ${trailC2y}, ${xCurrent} ${yCurrent}`;

  return (
    <div className={cn("relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-card/80 border border-border/80 shadow-md", className)}>
      {/* Ambient background illumination */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(ellipse 700px 380px at 70% 20%, hsl(var(--primary) / 0.12), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Progress Status Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4 text-xs">
        <div className="flex items-center gap-2.5">
          <Navigation className="size-4 text-primary" aria-hidden="true" />
          <span className="font-mono text-xs font-bold tracking-wider uppercase text-foreground">
            Goal Trajectory Visualizer
          </span>
          {goalLabel && (
            <span className="hidden sm:inline-block rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
              {goalLabel}
            </span>
          )}
        </div>

        {/* Dynamic Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider transition-all",
              isOnTrack
                ? "border border-success/40 bg-success/15 text-success shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                : "border border-warning/40 bg-warning/15 text-warning shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            )}
          >
            <span className="relative flex size-2.5">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  isOnTrack ? "bg-success" : "bg-warning"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex size-2.5 rounded-full",
                  isOnTrack ? "bg-success" : "bg-warning"
                )}
              />
            </span>
            <span>{isOnTrack ? "On Track" : "Needs Focus"}</span>
          </div>
        </div>
      </div>

      {/* Trajectory Canvas */}
      <div className="relative mt-5 w-full">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-label="Progress trajectory visualizer"
        >
          <defs>
            {/* Cone Frosted Glass Gradient */}
            <linearGradient id={coneGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.22} />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.12} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.04} />
            </linearGradient>

            {/* Glowing Trajectory Stroke Gradient */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.75} />
              <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={1} />
            </linearGradient>

            {/* Neon Flight Filter */}
            <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="hsl(var(--primary))" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Ambient Altitude Guide Grids */}
          {[80, 160, 240].map((y) => (
            <line
              key={y}
              x1={40}
              y1={y}
              x2={WIDTH - 30}
              y2={y}
              stroke="hsl(var(--border))"
              strokeOpacity={0.25}
              strokeDasharray="4 8"
              strokeWidth={1}
            />
          ))}

          {/* 1. THE CONE OF POSSIBILITY (Corridor +/- 10% variance) */}
          <path
            d={conePath}
            fill={`url(#${coneGradId})`}
            className="transition-all duration-500"
          />

          {/* Cone Boundary Hairlines */}
          <path
            d={`M ${xCurrent} ${yCurrent} C ${c1x} ${c1yUpper}, ${c2x} ${c2yUpper}, ${xGoal} ${yGoalUpper}`}
            fill="none"
            stroke="hsl(var(--primary) / 0.4)"
            strokeWidth={1.5}
            strokeDasharray="4 5"
          />
          <path
            d={`M ${xCurrent} ${yCurrent} C ${c1x} ${c1yLower}, ${c2x} ${c2yLower}, ${xGoal} ${yGoalLower}`}
            fill="none"
            stroke="hsl(var(--primary) / 0.4)"
            strokeWidth={1.5}
            strokeDasharray="4 5"
          />

          {/* Cone Tolerance Bracket at Goal */}
          <line
            x1={xGoal}
            y1={yGoalUpper}
            x2={xGoal}
            y2={yGoalLower}
            stroke="hsl(var(--primary) / 0.5)"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <text
            x={xGoal + 8}
            y={yGoal + 4}
            fill="hsl(var(--foreground))"
            fontSize="12"
            fontWeight="600"
            fontFamily="monospace"
            opacity={0.85}
          >
            ±{variancePct}% corridor
          </text>

          {/* 2. RECENT PROGRESS TRAIL */}
          <path
            d={historicTrailPath}
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeOpacity={0.3}
            strokeWidth={2.5}
            strokeDasharray="5 4"
          />

          {/* 3. PROJECTED PATH (Prominent, High-Contrast) */}
          <path
            d={predictiveCurvePath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={4}
            strokeLinecap="round"
            filter={`url(#${glowFilterId})`}
          />

          {/* Origin Start Point */}
          <g transform={`translate(${xOrigin}, ${yOrigin})`}>
            <circle r={4.5} fill="hsl(var(--muted-foreground))" opacity={0.6} />
            <text
              y={20}
              textAnchor="middle"
              fill="hsl(var(--muted-foreground))"
              fontSize="12"
              fontWeight="500"
              fontFamily="monospace"
            >
              Start
            </text>
          </g>

          {/* Current Progress Node */}
          <g transform={`translate(${xCurrent}, ${yCurrent})`}>
            {/* Outer radar pulse circles */}
            <circle r={8} fill="hsl(var(--primary) / 0.25)">
              <animate attributeName="r" values="8;24;8" dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0;0.7" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle r={8} fill="none" stroke="hsl(var(--primary) / 0.5)" strokeWidth={1.5}>
              <animate attributeName="r" values="8;30;8" dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle r={8} fill="hsl(var(--foreground))" stroke="hsl(var(--background))" strokeWidth={2.5} />
            <circle r={3.5} fill="hsl(var(--background))" />

            {/* Pill Backdrop for "Today" label */}
            <rect
              x={-34}
              y={-38}
              width={68}
              height={24}
              rx={12}
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth={1}
            />
            <text
              y={-22}
              textAnchor="middle"
              fill="hsl(var(--foreground))"
              fontSize="14"
              fontWeight="700"
              fontFamily="sans-serif"
            >
              Today
            </text>

            {/* Sub-label for Progress Count */}
            <rect
              x={-68}
              y={16}
              width={136}
              height={24}
              rx={6}
              fill="hsl(var(--card))"
              stroke="hsl(var(--border) / 0.6)"
              strokeWidth={1}
            />
            <text
              y={32}
              textAnchor="middle"
              fill="hsl(var(--foreground))"
              fontSize="12"
              fontWeight="600"
              fontFamily="monospace"
            >
              {completedQuests} of {targetQuests} Quests
            </text>
          </g>

          {/* Destination Milestone Star */}
          <g transform={`translate(${xGoal}, ${yGoal})`}>
            <circle
              r={9}
              fill="hsl(var(--primary) / 0.2)"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
            />
            <circle r={4} fill="hsl(var(--primary))" />

            {/* Pill Backdrop for "Goal Target" label */}
            <rect
              x={-102}
              y={-38}
              width={92}
              height={24}
              rx={12}
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth={1}
            />
            <text
              x={-56}
              y={-22}
              textAnchor="middle"
              fill="hsl(var(--foreground))"
              fontSize="14"
              fontWeight="700"
              fontFamily="sans-serif"
            >
              Target
            </text>
          </g>
        </svg>
      </div>

      {/* Legend & Status */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground border-t border-white/[0.06] dark:border-white/[0.04] pt-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1 w-3.5 rounded-full bg-primary" />
            <span>Projected path</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm bg-primary/20 border border-primary/40" />
            <span>Target range (±10%)</span>
          </span>
        </div>
        <span className="font-mono text-[10px] text-foreground/80">
          Status: {isOnTrack ? "On track" : "Pace adjusted"}
        </span>
      </div>
    </div>
  );
}
