import { useId } from "react";
import { Compass, Radio, Target, Sparkles, Navigation } from "lucide-react";
import type { TrajectoryEngineState } from "@/lib/trajectoryEngine";
import { cn } from "@/lib/utils";

interface TrajectoryVisualizerProps {
  engine: TrajectoryEngineState;
  goalLabel?: string;
  className?: string;
}

const WIDTH = 680;
const HEIGHT = 260;

export function TrajectoryVisualizer({ engine, goalLabel, className }: TrajectoryVisualizerProps) {
  const gradientId = useId();
  const coneGradId = useId();
  const glowFilterId = useId();

  const { completedQuests, targetQuests, isOnTrack, variancePct } = engine;
  const progressRatio = Math.min(Math.max(completedQuests / (targetQuests || 1), 0), 1);

  // Coordinate geometry
  const xOrigin = 45;
  const yOrigin = 200;

  const xCurrent = 230;
  // y position: higher progress = lower y (higher altitude on the chart)
  const yCurrent = yOrigin - progressRatio * 110;

  const xGoal = 635;
  const yGoal = 46;

  // Predictive Bezier Curve: Smooth glide slope from current position to destination
  const dx = xGoal - xCurrent;
  const dy = yGoal - yCurrent;

  const c1x = xCurrent + dx * 0.40;
  const c1y = yCurrent + dy * 0.18;
  const c2x = xCurrent + dx * 0.72;
  const c2y = yGoal + (yCurrent - yGoal) * 0.08;

  const predictiveCurvePath = `M ${xCurrent} ${yCurrent} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${xGoal} ${yGoal}`;

  // Cone of Possibility: 10% acceptable variance corridor expanding from Current to Goal
  const varianceSpan = 32; // +/- 10% variance expansion at horizon
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
    <div className={cn("relative overflow-hidden rounded-2xl p-5 sm:p-7 liquid-glass", className)}>
      {/* Ambient background illumination */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(ellipse 600px 300px at 70% 20%, hsl(var(--primary) / 0.12), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Progress Status Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] dark:border-white/[0.04] pb-4 text-xs">
        <div className="flex items-center gap-2">
          <Navigation className="size-4 text-primary animate-pulse" aria-hidden="true" />
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-foreground">
            Goal Trajectory
          </span>
          {goalLabel && (
            <span className="hidden sm:inline-block rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-[11px]">
              {goalLabel}
            </span>
          )}
        </div>

        {/* Dynamic Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider transition-all",
              isOnTrack
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                : "border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            )}
          >
            <span className="relative flex size-2">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  isOnTrack ? "bg-emerald-400" : "bg-amber-400"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex size-2 rounded-full",
                  isOnTrack ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
            </span>
            <span>{isOnTrack ? "On Track • Steady Progress" : "Needs Focus • Pacing Recalibrated"}</span>
          </div>
        </div>
      </div>

      {/* Trajectory Canvas */}
      <div className="relative mt-4 w-full">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-label="Progress trajectory visualizer"
        >
          <defs>
            {/* Cone Frosted Glass Gradient */}
            <linearGradient id={coneGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.18} />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.10} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.03} />
            </linearGradient>

            {/* Glowing Trajectory Stroke Gradient */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
              <stop offset="70%" stopColor="hsl(var(--primary))" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(var(--primary-glow, var(--primary)))" stopOpacity={1} />
            </linearGradient>

            {/* Neon Flight Filter */}
            <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="hsl(var(--primary))" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Ambient Altitude Guide Grids */}
          {[60, 120, 180].map((y) => (
            <line
              key={y}
              x1={35}
              y1={y}
              x2={WIDTH - 35}
              y2={y}
              stroke="hsl(var(--border))"
              strokeOpacity={0.15}
              strokeDasharray="4 8"
              strokeWidth={1}
            />
          ))}

          {/* 1. THE CONE OF POSSIBILITY (Frosted-glass corridor +/- 10% variance) */}
          <path
            d={conePath}
            fill={`url(#${coneGradId})`}
            className="transition-all duration-500 backdrop-blur-md"
          />

          {/* Cone Boundary Hairlines */}
          <path
            d={`M ${xCurrent} ${yCurrent} C ${c1x} ${c1yUpper}, ${c2x} ${c2yUpper}, ${xGoal} ${yGoalUpper}`}
            fill="none"
            stroke="hsl(var(--primary) / 0.35)"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
          <path
            d={`M ${xCurrent} ${yCurrent} C ${c1x} ${c1yLower}, ${c2x} ${c2yLower}, ${xGoal} ${yGoalLower}`}
            fill="none"
            stroke="hsl(var(--primary) / 0.35)"
            strokeWidth={1}
            strokeDasharray="3 4"
          />

          {/* Cone Tolerance Bracket at Goal */}
          <line
            x1={xGoal}
            y1={yGoalUpper}
            x2={xGoal}
            y2={yGoalLower}
            stroke="hsl(var(--primary) / 0.4)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <text
            x={xGoal + 6}
            y={yGoal + 4}
            fill="hsl(var(--muted-foreground))"
            fontSize="9"
            fontFamily="monospace"
            opacity={0.7}
          >
            ±{variancePct}% range
          </text>

          {/* 2. RECENT PROGRESS TRAIL */}
          <path
            d={historicTrailPath}
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeOpacity={0.25}
            strokeWidth={2}
            strokeDasharray="4 3"
          />

          {/* 3. PROJECTED PATH */}
          <path
            d={predictiveCurvePath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={3}
            strokeLinecap="round"
            filter={`url(#${glowFilterId})`}
          />

          {/* Origin Start Point */}
          <g transform={`translate(${xOrigin}, ${yOrigin})`}>
            <circle r={3} fill="hsl(var(--muted-foreground))" opacity={0.5} />
            <text
              y={16}
              textAnchor="middle"
              fill="hsl(var(--muted-foreground))"
              fontSize="9"
              fontFamily="monospace"
              opacity={0.6}
            >
              Start
            </text>
          </g>

          {/* Current Progress Node */}
          <g transform={`translate(${xCurrent}, ${yCurrent})`}>
            {/* Outer radar pulse circle */}
            <circle
              r={12}
              fill="hsl(var(--primary) / 0.15)"
              className="animate-ping"
              style={{ transformOrigin: "center", animationDuration: "2.5s" }}
            />
            <circle r={6} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2} />
            <circle r={2.5} fill="#ffffff" />
            <text
              y={-14}
              textAnchor="middle"
              fill="hsl(var(--foreground))"
              fontSize="10"
              fontWeight="600"
              fontFamily="sans-serif"
            >
              Where you are
            </text>
            <text
              y={20}
              textAnchor="middle"
              fill="hsl(var(--muted-foreground))"
              fontSize="9"
              fontFamily="monospace"
            >
              {completedQuests} of {targetQuests} Quests
            </text>
          </g>

          {/* Destination Milestone Star */}
          <g transform={`translate(${xGoal}, ${yGoal})`}>
            <circle
              r={7}
              fill="hsl(var(--primary) / 0.2)"
              stroke="hsl(var(--primary))"
              strokeWidth={1.5}
            />
            <circle r={2.5} fill="hsl(var(--primary))" />
            <text
              x={-8}
              y={-14}
              textAnchor="end"
              fill="hsl(var(--foreground))"
              fontSize="10"
              fontWeight="600"
              fontFamily="sans-serif"
            >
              Goal Target
            </text>
            <text
              x={-8}
              y={-2}
              textAnchor="end"
              fill="hsl(var(--muted-foreground))"
              fontSize="9"
              fontFamily="monospace"
            >
              Target Milestone
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
            <span>Acceptable range (±10%)</span>
          </span>
        </div>
        <span className="font-mono text-[10px] text-foreground/80">
          Status: {isOnTrack ? "On track" : "Pace adjusted"}
        </span>
      </div>
    </div>
  );
}
