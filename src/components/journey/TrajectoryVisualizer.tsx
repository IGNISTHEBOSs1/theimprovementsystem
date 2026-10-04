import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Compass, Radio, Target, Sparkles, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { TIS_SPRINGS, TIS_EASINGS } from "@/lib/motion-tokens";

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
  const shouldReduceMotion = useReducedMotion();

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

  // Cone of Possibility: 10% acceptable variance buffer expanding from Current to Goal
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
    <div className={cn("relative overflow-hidden rounded-[28px] p-6 sm:p-8 bg-[#12141A] border border-white/10 shadow-2xl specular-top", className)}>
      {/* Ambient background illumination */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(ellipse 700px 380px at 70% 20%, rgba(16, 185, 129, 0.15), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Progress Status Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl border border-white/10 bg-[#181B24] flex items-center justify-center text-white shadow-sm">
            <Navigation className="size-4" aria-hidden="true" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold tracking-wider uppercase text-foreground">
              Goal Trajectory Visualizer
            </span>
          </div>
          {goalLabel && (
            <span className="hidden sm:inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono font-medium text-white text-xs">
              {goalLabel}
            </span>
          )}
        </div>

        {/* Dynamic Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all",
              isOnTrack
                ? "border border-white/20 bg-white/10 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                : "border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
            )}
          >
            <span className="relative flex size-2.5">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  isOnTrack ? "bg-white" : "bg-amber-400"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex size-2.5 rounded-full",
                  isOnTrack ? "bg-white" : "bg-amber-400"
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
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.15} />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.06} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.01} />
            </linearGradient>

            {/* Glowing Trajectory Stroke Gradient */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A1A1AA" stopOpacity={0.8} />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity={1} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity={1} />
            </linearGradient>

            {/* Specular White Flight Filter */}
            <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FFFFFF" floodOpacity={0.4} />
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
              stroke="rgba(255, 255, 255, 0.08)"
              strokeDasharray="4 8"
              strokeWidth={1}
            />
          ))}

          {/* 1. THE CONE OF POSSIBILITY (Buffer +/- 10% variance) */}
          <motion.path
            d={conePath}
            fill={`url(#${coneGradId})`}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: TIS_EASINGS.subtleEntrance }}
          />

          {/* Cone Boundary Hairlines */}
          <motion.path
            d={`M ${xCurrent} ${yCurrent} C ${c1x} ${c1yUpper}, ${c2x} ${c2yUpper}, ${xGoal} ${yGoalUpper}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth={1.5}
            strokeDasharray="4 5"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          />
          <motion.path
            d={`M ${xCurrent} ${yCurrent} C ${c1x} ${c1yLower}, ${c2x} ${c2yLower}, ${xGoal} ${yGoalLower}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth={1.5}
            strokeDasharray="4 5"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          />

          {/* Cone Tolerance Bracket at Goal */}
          <line
            x1={xGoal}
            y1={yGoalUpper}
            x2={xGoal}
            y2={yGoalLower}
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <text
            x={xGoal + 8}
            y={yGoal + 4}
            fill="#F8FAFC"
            fontSize="12"
            fontWeight="600"
            className="tnum font-mono"
            opacity={0.9}
          >
            ±{variancePct}% buffer cone
          </text>

          {/* 2. RECENT PROGRESS TRAIL */}
          <motion.path
            d={historicTrailPath}
            fill="none"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth={2.5}
            strokeDasharray="5 4"
            initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: TIS_EASINGS.subtleEntrance }}
          />

          {/* 3. PROJECTED PATH (Prominent White Kinetic Contrast) */}
          <motion.path
            d={predictiveCurvePath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={4}
            strokeLinecap="round"
            filter={`url(#${glowFilterId})`}
            initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0.2 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Origin Start Point */}
          <g transform={`translate(${xOrigin}, ${yOrigin})`}>
            <circle r={4.5} fill="#64748B" opacity={0.7} />
            <text
              y={20}
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="12"
              fontWeight="500"
              fontFamily="monospace"
            >
              Start
            </text>
          </g>

          {/* Current Progress Node */}
          <motion.g
            transform={`translate(${xCurrent}, ${yCurrent})`}
            initial={shouldReduceMotion ? false : { scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={TIS_SPRINGS.settle}
          >
            {/* Outer radar pulse circles */}
            <circle r={8} fill="rgba(255, 255, 255, 0.2)">
              <animate attributeName="r" values="8;24;8" dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0;0.7" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle r={8} fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1.5} vectorEffect="non-scaling-stroke">
              <animate attributeName="r" values="8;30;8" dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle r={8} fill="#FFFFFF" stroke="#090A0F" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
            <circle r={3.5} fill="#090A0F" />

            {/* Pill Backdrop for "Today" label */}
            <rect
              x={-34}
              y={-38}
              width={68}
              height={24}
              rx={12}
              fill="#181B24"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth={1}
            />
            <text
              y={-22}
              textAnchor="middle"
              fill="#F8FAFC"
              fontSize="13"
              fontWeight="700"
            >
              Today
            </text>

            {/* Sub-label for Progress Count */}
            <rect
              x={-72}
              y={16}
              width={144}
              height={24}
              rx={8}
              fill="#181B24"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth={1}
            />
            <text
              y={32}
              textAnchor="middle"
              fill="#F8FAFC"
              fontSize="12"
              fontWeight="600"
              className="tnum font-mono"
            >
              {completedQuests} of {targetQuests} Quests
            </text>
          </motion.g>

          {/* Destination Milestone Star */}
          <g transform={`translate(${xGoal}, ${yGoal})`}>
            <circle
              r={10}
              fill="rgba(255, 255, 255, 0.15)"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
            <circle r={4.5} fill="#FFFFFF" />

            {/* Pill Backdrop for "Goal Target" label */}
            <rect
              x={-102}
              y={-38}
              width={92}
              height={24}
              rx={12}
              fill="#181B24"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth={1}
            />
            <text
              x={-56}
              y={-22}
              textAnchor="middle"
              fill="#F8FAFC"
              fontSize="13"
              fontWeight="700"
            >
              Target
            </text>
          </g>
        </svg>
      </div>

      {/* Legend & Status */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground border-t border-white/10 pt-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-4 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            <span className="font-medium text-foreground/90">Projected trajectory</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-3.5 rounded-sm bg-white/20 border border-white/40" />
            <span className="font-medium text-foreground/90">Buffer cone (±10%)</span>
          </span>
        </div>
        <span className="font-mono tnum text-[11px] text-foreground/80">
          Status: {isOnTrack ? "On track" : "Pace adjusted"}
        </span>
      </div>
    </div>
  );
}
