import { useId, useRef, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Navigation, ShieldCheck, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TIS_SPRINGS, TIS_EASINGS } from "@/lib/motion-tokens";
import { triggerHaptic } from "@/lib/haptics";
import type { TrajectoryPoint } from "@/lib/trajectory";

interface TrajectoryVisualizerProps {
  completedQuests: number;
  targetQuests?: number; // default 72 target anchors
  elapsedDays?: number; // 1 to 90
  daysRemaining?: number;
  actualPoints?: TrajectoryPoint[];
  bufferDaysRemaining?: number; // out of 18 flex days
  paceRatio?: number;
  isOnTrack: boolean;
  goalLabel?: string;
  className?: string;
  // Total days in cycle (defaults to 90)
  cycleTotalDays?: number;
}

const WIDTH = 720;
const HEIGHT = 340;

/**
 * Maps an actual TrajectoryPoint to an SVG x coordinate using its real
 * timestamp relative to cycle start (first evidence point = Day 1 proxy).
 * Falls back to fractional index positioning only when timestamps are absent.
 */
function pointToX(
  pt: TrajectoryPoint,
  index: number,
  total: number,
  safeElapsed: number,
  xOrigin: number,
  spanX: number,
  cycleTotalDays: number,
  firstTimestamp: string | null,
): number {
  if (firstTimestamp && pt.timestamp) {
    const startMs = new Date(firstTimestamp).getTime();
    const ptMs = new Date(pt.timestamp).getTime();
    const daysSinceStart = Math.max(0, (ptMs - startMs) / (1000 * 60 * 60 * 24));
    // Pin to elapsed range: day 1..safeElapsed
    const ptDay = Math.min(safeElapsed, Math.max(1, 1 + daysSinceStart));
    return xOrigin + (spanX * ptDay) / cycleTotalDays;
  }
  // Fallback: distribute evenly across the elapsed range
  const ptDay = Math.min(safeElapsed, Math.max(1, ((index + 1) / total) * safeElapsed));
  return xOrigin + (spanX * ptDay) / cycleTotalDays;
}

export function TrajectoryVisualizer({
  completedQuests,
  targetQuests = 72,
  elapsedDays = 1,
  daysRemaining = 89,
  actualPoints = [],
  bufferDaysRemaining = 18,
  paceRatio = 1.0,
  isOnTrack,
  goalLabel,
  className,
  cycleTotalDays = 90,
}: TrajectoryVisualizerProps) {
  const gradientId = useId();
  const coneGradId = useId();
  const glowFilterId = useId();
  const trailGradId = useId();
  const shouldReduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [scrubX, setScrubX] = useState<number | null>(null);
  const lastMilestoneRef = useRef<number | null>(null);

  // Coordinate geometry
  const xOrigin = 55;
  const xGoal = 650;
  const spanX = xGoal - xOrigin;

  const yOrigin = 270; // 0 anchors
  const yGoal = 95;    // 72 Target Anchors baseline
  const spanY = yOrigin - yGoal;

  const safeElapsed = Math.max(1, Math.min(cycleTotalDays, elapsedDays));
  const targetAnchors = Math.max(1, targetQuests || 72);
  const safeCompleted = Math.max(0, completedQuests);

  const xCurrent = xOrigin + (spanX * safeElapsed) / cycleTotalDays;
  const yCurrent = Math.max(40, yOrigin - (spanY * Math.min(targetAnchors, safeCompleted)) / targetAnchors);

  // Buffer corridor bounds
  const yGoalCeiling = 50;
  const yGoalFloor = 135;

  // Predictive curve control points
  const dx = xGoal - xCurrent;
  const dyGoal = yGoal - yCurrent;
  const c1x = xCurrent + dx * 0.40;
  const c1y = yCurrent + dyGoal * 0.22;
  const c2x = xCurrent + dx * 0.75;
  const c2y = yGoal - dyGoal * 0.12;
  const predictiveCurvePath = `M ${xCurrent} ${yCurrent} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${xGoal} ${yGoal}`;

  // Cone boundary paths
  const dyCeil = yGoalCeiling - yCurrent;
  const dyFloor = yGoalFloor - yCurrent;
  const c1yUpper = yCurrent + dyCeil * 0.35;
  const c2yUpper = yGoalCeiling - dyCeil * 0.15;
  const c1yLower = yCurrent + dyFloor * 0.35;
  const c2yLower = yGoalFloor - dyFloor * 0.15;
  const conePath = `
    M ${xCurrent} ${yCurrent}
    C ${c1x} ${c1yUpper}, ${c2x} ${c2yUpper}, ${xGoal} ${yGoalCeiling}
    L ${xGoal} ${yGoalFloor}
    C ${c2x} ${c2yLower}, ${c1x} ${c1yLower}, ${xCurrent} ${yCurrent}
    Z
  `;

  // ── Real Historical Trail using actual timestamps ──
  // Sort by timestamp (already sorted in deriveTrajectory, but be defensive)
  const sortedPoints = [...actualPoints].sort((a, b) =>
    (a.timestamp || "").localeCompare(b.timestamp || "")
  );
  const firstTimestamp = sortedPoints.length > 0 ? sortedPoints[0].timestamp : null;

  let historicTrailPath: string;
  // Annotate each point so we can render completion/failure dots
  const trailDots: Array<{ x: number; y: number; outcome: "completed" | "failed" }> = [];

  if (sortedPoints.length > 0) {
    historicTrailPath = `M ${xOrigin} ${yOrigin}`;
    sortedPoints.forEach((pt, i) => {
      const px = pointToX(pt, i, sortedPoints.length, safeElapsed, xOrigin, spanX, cycleTotalDays, firstTimestamp);
      const py = Math.max(40, yOrigin - (spanY * Math.min(targetAnchors, pt.position)) / targetAnchors);
      historicTrailPath += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
      trailDots.push({ x: px, y: py, outcome: pt.outcome });
    });
    // Close to current position
    historicTrailPath += ` L ${xCurrent.toFixed(1)} ${yCurrent.toFixed(1)}`;
  } else {
    // Grace curve from origin to today when no evidence yet
    const trailC1x = xOrigin + (xCurrent - xOrigin) * 0.5;
    const trailC2x = xOrigin + (xCurrent - xOrigin) * 0.75;
    historicTrailPath = `M ${xOrigin} ${yOrigin} C ${trailC1x} ${yOrigin}, ${trailC2x} ${yCurrent + (yOrigin - yCurrent) * 0.2}, ${xCurrent} ${yCurrent}`;
  }

  // ── Scrubbing ──
  const handleScrub = useCallback(
    (clientX: number) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      if (!rect.width) return;
      const scale = WIDTH / rect.width;
      const relX = (clientX - rect.left) * scale;
      const clampedX = Math.max(xOrigin, Math.min(xGoal, relX));
      setScrubX(clampedX);
      const scrubDay = Math.round(((clampedX - xOrigin) / spanX) * cycleTotalDays);
      if (scrubDay % 15 === 0 && scrubDay !== lastMilestoneRef.current && scrubDay > 0) {
        triggerHaptic("light");
        lastMilestoneRef.current = scrubDay;
      }
    },
    [xOrigin, xGoal, spanX, cycleTotalDays],
  );

  const activeScrubDay =
    scrubX !== null ? Math.round(((scrubX - xOrigin) / spanX) * cycleTotalDays) : null;
  const isPastOrToday = activeScrubDay !== null && activeScrubDay <= safeElapsed;

  const scrubAnchors =
    activeScrubDay !== null
      ? isPastOrToday
        ? Math.min(
            safeCompleted,
            Math.round((activeScrubDay / safeElapsed) * safeCompleted),
          )
        : Math.min(
            targetAnchors,
            Math.round(
              safeCompleted +
                ((targetAnchors - safeCompleted) /
                  Math.max(1, cycleTotalDays - safeElapsed)) *
                  (activeScrubDay - safeElapsed),
            ),
          )
      : null;

  // Variance: actual vs intended at current position
  // If paceRatio >= 1 → ahead; < 0.8 → behind; 0.8–1 → within buffer
  const variancePct = Math.abs(Math.round((paceRatio - 1) * 100));
  const paceSign = paceRatio >= 1 ? "+" : "-";
  const bufferUsed = 18 - bufferDaysRemaining;

  // Milestone day lines
  const milestoneDays = cycleTotalDays === 90
    ? [15, 30, 45, 60, 75]
    : [Math.round(cycleTotalDays * 0.17), Math.round(cycleTotalDays * 0.33),
       Math.round(cycleTotalDays * 0.5), Math.round(cycleTotalDays * 0.67),
       Math.round(cycleTotalDays * 0.83)];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-card/80 border border-border/80 shadow-md",
        className,
      )}
    >
      {/* Ambient background illumination */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 700px 380px at 70% 20%, hsl(var(--primary) / 0.12), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* ── Header Row ── */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4 text-xs">
        <div className="flex items-center gap-2.5">
          <Navigation className="size-4 text-primary" aria-hidden="true" />
          <span className="font-mono text-xs font-bold tracking-wider uppercase text-foreground">
            {cycleTotalDays}-Day Trajectory Plotter
          </span>
          {goalLabel && (
            <span className="hidden sm:inline-block rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs truncate max-w-[280px]">
              {goalLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Buffer Bank */}
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3 text-emerald-500" aria-hidden="true" />
            <span>
              <strong className="text-foreground">{bufferDaysRemaining}</strong>/18 flex days
            </span>
            {/* Buffer depletion bar */}
            <span className="flex gap-px ml-0.5">
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-block h-1.5 w-1 rounded-sm",
                    i < bufferUsed ? "bg-warning/60" : "bg-success/60",
                  )}
                />
              ))}
            </span>
          </div>

          {/* Pace status pill */}
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider transition-all",
              isOnTrack
                ? "border border-success/40 bg-success/15 text-success shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                : "border border-warning/40 bg-warning/15 text-warning shadow-[0_0_12px_rgba(245,158,11,0.2)]",
            )}
          >
            <span className="relative flex size-2.5">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  isOnTrack ? "bg-success" : "bg-warning",
                )}
              />
              <span
                className={cn(
                  "relative inline-flex size-2.5 rounded-full",
                  isOnTrack ? "bg-success" : "bg-warning",
                )}
              />
            </span>
            <span>{isOnTrack ? "Within Buffer" : "Needs Thrust"}</span>
          </div>
        </div>
      </div>

      {/* ── Scrub Readout Bar ── */}
      <div className="mt-3 min-h-[24px] flex items-center justify-between text-[11px] font-mono px-1">
        {activeScrubDay !== null ? (
          <div className="flex flex-wrap items-center justify-between w-full gap-2 text-foreground bg-primary/10 border border-primary/30 rounded-lg px-3 py-1 animate-in fade-in duration-150">
            <span>
              <strong>DAY {activeScrubDay}</strong> OF {cycleTotalDays} /{" "}
              {isPastOrToday ? "RECORDED" : "PROJECTED"}
            </span>
            <span>
              {isPastOrToday ? (
                <>
                  ACTUAL:{" "}
                  <strong className="text-primary">{scrubAnchors}</strong> /{" "}
                  {targetAnchors} ANCHORS
                </>
              ) : (
                <>
                  PROJECTED:{" "}
                  <strong className="text-primary">{scrubAnchors}</strong> /{" "}
                  {targetAnchors}
                </>
              )}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-muted-foreground">
            <span>
              DAY {safeElapsed} OF {cycleTotalDays} · {daysRemaining}D REMAINING ·{" "}
              <span
                className={cn(
                  "font-semibold",
                  isOnTrack ? "text-success" : "text-warning",
                )}
              >
                {paceSign}{variancePct}% vs NOMINAL
              </span>
            </span>
            <span className="hidden sm:inline">DRAG OR HOVER TO SCRUB VECTOR</span>
          </div>
        )}
      </div>

      {/* ── SVG Canvas ── */}
      <div className="relative mt-2 w-full touch-pan-y">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto overflow-visible select-none cursor-crosshair"
          role="img"
          aria-label={`Interactive ${cycleTotalDays}-Day Trajectory Plotter`}
          onMouseMove={(e) => handleScrub(e.clientX)}
          onMouseLeave={() => {
            setScrubX(null);
            lastMilestoneRef.current = null;
          }}
          onTouchMove={(e) => {
            if (e.touches[0]) handleScrub(e.touches[0].clientX);
          }}
          onTouchEnd={() => {
            setScrubX(null);
            lastMilestoneRef.current = null;
          }}
        >
          <defs>
            {/* Cone gradient */}
            <linearGradient id={coneGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.22} />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.12} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.04} />
            </linearGradient>

            {/* Predictive path gradient */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.75} />
              <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={1} />
            </linearGradient>

            {/* Historical trail gradient — dimmer to distinguish from projection */}
            <linearGradient id={trailGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0.7} />
            </linearGradient>

            {/* Glow filter */}
            <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="5"
                floodColor="hsl(var(--primary))"
                floodOpacity={0.4}
              />
            </filter>
          </defs>

          {/* Altitude guide lines */}
          {[yGoalCeiling, yGoal, (yOrigin + yGoal) / 2, yOrigin].map((y, idx) => (
            <line
              key={idx}
              x1={40}
              y1={y}
              x2={WIDTH - 30}
              y2={y}
              stroke="hsl(var(--foreground))"
              strokeOpacity={0.08}
              strokeDasharray="4 8"
              strokeWidth={1}
            />
          ))}

          {/* Milestone verticals */}
          {milestoneDays.map((d) => {
            const mx = xOrigin + (spanX * d) / cycleTotalDays;
            const isPast = d <= safeElapsed;
            return (
              <g key={d}>
                <line
                  x1={mx}
                  y1={45}
                  x2={mx}
                  y2={yOrigin + 10}
                  stroke="hsl(var(--foreground))"
                  strokeOpacity={isPast ? 0.12 : 0.06}
                  strokeDasharray="2 4"
                  strokeWidth={1}
                />
                <text
                  x={mx}
                  y={yOrigin + 24}
                  textAnchor="middle"
                  fill="hsl(var(--muted-foreground))"
                  fontSize="10"
                  fontFamily="monospace"
                  opacity={isPast ? 0.9 : 0.5}
                >
                  D{d}
                </text>
              </g>
            );
          })}

          {/* 1. Cone of Possibility */}
          <motion.path
            d={conePath}
            fill={`url(#${coneGradId})`}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: TIS_EASINGS.subtleEntrance }}
          />
          <motion.path
            d={`M ${xCurrent} ${yCurrent} C ${c1x} ${c1yUpper}, ${c2x} ${c2yUpper}, ${xGoal} ${yGoalCeiling}`}
            fill="none"
            stroke="hsl(var(--primary) / 0.35)"
            strokeWidth={1.5}
            strokeDasharray="4 5"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          />
          <motion.path
            d={`M ${xCurrent} ${yCurrent} C ${c1x} ${c1yLower}, ${c2x} ${c2yLower}, ${xGoal} ${yGoalFloor}`}
            fill="none"
            stroke="hsl(var(--primary) / 0.35)"
            strokeWidth={1.5}
            strokeDasharray="4 5"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          />

          {/* Tolerance bracket */}
          <line
            x1={xGoal}
            y1={yGoalCeiling}
            x2={xGoal}
            y2={yGoalFloor}
            stroke="hsl(var(--primary) / 0.5)"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <text
            x={xGoal + 8}
            y={yGoal + 4}
            fill="hsl(var(--foreground))"
            fontSize="11"
            fontWeight="600"
            fontFamily="monospace"
            opacity={0.85}
          >
            ±10% buffer
          </text>

          {/* 2. Historical evidence trail */}
          <motion.path
            d={historicTrailPath}
            fill="none"
            stroke={`url(#${trailGradId})`}
            strokeWidth={2.5}
            initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: TIS_EASINGS.subtleEntrance }}
          />

          {/* Evidence dots on the trail — completed=filled, failed=hollow */}
          {trailDots.map((dot, i) => (
            <motion.circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={3.5}
              fill={
                dot.outcome === "completed"
                  ? "hsl(var(--foreground))"
                  : "none"
              }
              stroke={
                dot.outcome === "completed"
                  ? "hsl(var(--background))"
                  : "hsl(var(--muted-foreground))"
              }
              strokeWidth={dot.outcome === "completed" ? 1.5 : 1.5}
              initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: dot.outcome === "completed" ? 0.8 : 0.5 }}
              transition={{ delay: 0.6 + i * 0.03, ...TIS_SPRINGS.snap }}
            />
          ))}

          {/* 3. Predictive path */}
          <motion.path
            d={predictiveCurvePath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={3.5}
            strokeLinecap="round"
            filter={`url(#${glowFilterId})`}
            initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0.2 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.65, ease: TIS_EASINGS.precisionInOut }}
          />

          {/* Origin */}
          <g transform={`translate(${xOrigin}, ${yOrigin})`}>
            <circle r={4.5} fill="hsl(var(--muted-foreground))" opacity={0.6} />
            <text
              y={24}
              textAnchor="middle"
              fill="hsl(var(--muted-foreground))"
              fontSize="11"
              fontWeight="500"
              fontFamily="monospace"
            >
              Day 0
            </text>
          </g>

          {/* Current node */}
          <motion.g
            transform={`translate(${xCurrent}, ${yCurrent})`}
            initial={shouldReduceMotion ? false : { scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={TIS_SPRINGS.settle}
          >
            <circle r={8} fill="hsl(var(--primary) / 0.25)">
              <animate attributeName="r" values="8;24;8" dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0;0.7" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle
              r={8}
              fill="none"
              stroke="hsl(var(--primary) / 0.5)"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            >
              <animate attributeName="r" values="8;30;8" dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle
              r={8}
              fill="hsl(var(--foreground))"
              stroke="hsl(var(--background))"
              strokeWidth={2.5}
              vectorEffect="non-scaling-stroke"
            />
            <circle r={3.5} fill="hsl(var(--background))" />

            <rect x={-34} y={-38} width={68} height={24} rx={12} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} />
            <text y={-22} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="13" fontWeight="700" fontFamily="sans-serif">
              Day {safeElapsed}
            </text>

            <rect x={-68} y={16} width={136} height={24} rx={6} fill="hsl(var(--card))" stroke="hsl(var(--border) / 0.6)" strokeWidth={1} />
            <text y={32} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="12" fontWeight="600" fontFamily="monospace">
              {safeCompleted} of {targetAnchors}
            </text>
          </motion.g>

          {/* Destination */}
          <g transform={`translate(${xGoal}, ${yGoal})`}>
            <circle r={9} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={2} />
            <circle r={4} fill="hsl(var(--primary))" />
            <rect x={-102} y={-38} width={92} height={24} rx={12} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} />
            <text x={-56} y={-22} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="13" fontWeight="700" fontFamily="sans-serif">
              {targetAnchors} Anchors
            </text>
            <text x={0} y={24} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="11" fontWeight="500" fontFamily="monospace">
              Day {cycleTotalDays}
            </text>
          </g>

          {/* Scrub hairline */}
          {scrubX !== null && (
            <g pointerEvents="none">
              <line
                x1={scrubX}
                y1={35}
                x2={scrubX}
                y2={yOrigin + 10}
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <circle
                cx={scrubX}
                cy={
                  isPastOrToday
                    ? Math.max(
                        40,
                        yOrigin -
                          (spanY * Math.min(targetAnchors, scrubAnchors ?? 0)) /
                            targetAnchors,
                      )
                    : yGoal
                }
                r={4}
                fill="hsl(var(--primary))"
              />
            </g>
          )}
        </svg>
      </div>

      {/* ── Legend ── */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground border-t border-border/80 pt-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1 w-3.5 rounded-full bg-primary" />
            <span>Target vector (0.80/day)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm bg-primary/20 border border-primary/40" />
            <span>80% buffer corridor (18 flex days)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-foreground/60" />
              <span>Done</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-transparent border border-muted-foreground/50" />
              <span>Missed</span>
            </span>
          </span>
        </div>
        <span className="font-mono text-[10px] text-foreground/80 flex items-center gap-1">
          {paceRatio >= 1 ? (
            <TrendingUp className="size-3 text-success" />
          ) : (
            <TrendingDown className="size-3 text-warning" />
          )}
          Velocity: <strong className={paceRatio >= 1 ? "text-success" : "text-warning"}>{paceRatio}x</strong> nominal · {daysRemaining}d to horizon
        </span>
      </div>
    </div>
  );
}
