import { useId, useRef, useState, useCallback, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Navigation, ShieldCheck, TrendingUp, TrendingDown, Crosshair } from "lucide-react";
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

const WIDTH = 760;
const HEIGHT = 320;

/**
 * Maps an actual TrajectoryPoint to an SVG x coordinate using its real
 * timestamp relative to cycle start (first evidence point = Day 1 proxy).
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
    const ptDay = Math.min(safeElapsed, Math.max(1, 1 + daysSinceStart));
    return xOrigin + (spanX * ptDay) / cycleTotalDays;
  }
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
  const xOrigin = 52;
  const xGoal = 688;
  const spanX = xGoal - xOrigin;

  const yOrigin = 250; // 0 anchors baseline
  const yGoal = 82;    // Target baseline
  const spanY = yOrigin - yGoal;

  const safeElapsed = Math.max(1, Math.min(cycleTotalDays, elapsedDays));
  const targetAnchors = Math.max(1, targetQuests || 72);
  const safeCompleted = Math.max(0, completedQuests);

  const xCurrent = xOrigin + (spanX * safeElapsed) / cycleTotalDays;
  const yCurrent = Math.max(40, yOrigin - (spanY * Math.min(targetAnchors, safeCompleted)) / targetAnchors);

  // ±10% buffer corridor bounds
  const yGoalCeiling = 46;
  const yGoalFloor = 118;

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

  // Real Historical Trail using actual timestamps
  const sortedPoints = useMemo(() => {
    return [...actualPoints].sort((a, b) =>
      (a.timestamp || "").localeCompare(b.timestamp || "")
    );
  }, [actualPoints]);

  const firstTimestamp = sortedPoints.length > 0 ? sortedPoints[0].timestamp : null;

  const { historicTrailPath, trailDots } = useMemo(() => {
    const dots: Array<{ x: number; y: number; outcome: "completed" | "failed" }> = [];
    let path = "";

    if (sortedPoints.length > 0) {
      path = `M ${xOrigin} ${yOrigin}`;
      sortedPoints.forEach((pt, i) => {
        const px = pointToX(pt, i, sortedPoints.length, safeElapsed, xOrigin, spanX, cycleTotalDays, firstTimestamp);
        const py = Math.max(40, yOrigin - (spanY * Math.min(targetAnchors, pt.position)) / targetAnchors);
        path += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
        dots.push({ x: px, y: py, outcome: pt.outcome });
      });
      path += ` L ${xCurrent.toFixed(1)} ${yCurrent.toFixed(1)}`;
    } else {
      const trailC1x = xOrigin + (xCurrent - xOrigin) * 0.5;
      const trailC2x = xOrigin + (xCurrent - xOrigin) * 0.75;
      path = `M ${xOrigin} ${yOrigin} C ${trailC1x} ${yOrigin}, ${trailC2x} ${yCurrent + (yOrigin - yCurrent) * 0.2}, ${xCurrent} ${yCurrent}`;
    }
    return { historicTrailPath: path, trailDots: dots };
  }, [sortedPoints, safeElapsed, xOrigin, yOrigin, spanX, spanY, cycleTotalDays, firstTimestamp, targetAnchors, xCurrent, yCurrent]);

  // Scrubbing coordinate computation
  const updateScrubFromClientX = useCallback(
    (clientX: number, targetWidth: number, targetLeft: number) => {
      const scale = WIDTH / targetWidth;
      const relX = (clientX - targetLeft) * scale;
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

  const handleSvgScrub = useCallback(
    (clientX: number) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      if (!rect.width) return;
      updateScrubFromClientX(clientX, rect.width, rect.left);
    },
    [updateScrubFromClientX],
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

  const variancePct = Math.abs(Math.round((paceRatio - 1) * 100));
  const paceSign = paceRatio >= 1 ? "+" : "-";

  // Milestones: 15, 30, 45, 60, 75, 90
  const milestoneDays = useMemo(() => {
    return [15, 30, 45, 60, 75];
  }, []);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-card/90 border border-border/80 shadow-[var(--shadow-card)] backdrop-blur-xl transition-all duration-300",
        className,
      )}
    >
      {/* Specular highlight rim */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
        aria-hidden="true"
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-25"
        style={{
          background:
            "radial-gradient(ellipse 650px 320px at 70% 15%, hsl(var(--primary) / 0.12), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* ── Top Flight Bar: System Label & Primary Flight Status ── */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-7 rounded-xl border border-border/70 bg-background flex items-center justify-center text-primary shadow-xs shrink-0">
            <Navigation className="size-3.5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-foreground block truncate">
              {cycleTotalDays}-Day Flight Vector Plotter
            </span>
            {goalLabel && (
              <span className="text-[11px] text-muted-foreground truncate block">
                Targeting: <strong className="text-foreground font-medium">{goalLabel}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Buffer Bank Status */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-2.5 py-1 font-mono text-[11px]">
            <ShieldCheck className="size-3.5 text-emerald-500" aria-hidden="true" />
            <span className="text-muted-foreground">
              <strong className="text-foreground font-semibold">{bufferDaysRemaining}</strong>/18 flex days
            </span>
          </div>

          {/* Precision Flight Status Badge */}
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider transition-all",
              isOnTrack
                ? "border border-success/40 bg-success/15 text-success shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                : "border border-warning/40 bg-warning/15 text-warning shadow-[0_0_12px_rgba(245,158,11,0.15)]",
            )}
          >
            <span className="relative flex size-2">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  isOnTrack ? "bg-success" : "bg-warning",
                )}
              />
              <span
                className={cn(
                  "relative inline-flex size-2 rounded-full",
                  isOnTrack ? "bg-success" : "bg-warning",
                )}
              />
            </span>
            <span>{isOnTrack ? "Trajectory Nominal" : "Thrust Required"}</span>
          </div>
        </div>
      </div>

      {/* ── Trajectory Coordinate Telemetry Strip (Decoupled from SVG for flawless mobile view) ── */}
      <div className="mt-3 min-h-[30px] flex items-center justify-between text-xs font-mono px-1">
        {activeScrubDay !== null ? (
          <div className="flex flex-wrap items-center justify-between w-full gap-2 text-foreground bg-primary/10 border border-primary/30 rounded-xl px-3.5 py-1.5 animate-in fade-in duration-150">
            <span className="flex items-center gap-2 font-bold">
              <Crosshair className="size-3.5 text-primary shrink-0 animate-pulse" />
              <span>
                DAY {activeScrubDay} OF {cycleTotalDays} ·{" "}
                <span className="text-muted-foreground">
                  {isPastOrToday ? "RECORDED" : "PROJECTED FLIGHT"}
                </span>
              </span>
            </span>
            <span className="font-semibold">
              {isPastOrToday ? (
                <>
                  PROOF: <strong className="text-primary font-bold">{scrubAnchors}</strong> / {targetAnchors} ANCHORS
                </>
              ) : (
                <>
                  NOMINAL TARGET: <strong className="text-primary font-bold">{scrubAnchors}</strong> / {targetAnchors}
                </>
              )}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between w-full gap-2 text-muted-foreground py-0.5">
            <span className="flex items-center gap-2">
              <span>
                DAY <strong className="text-foreground">{safeElapsed}</strong> OF {cycleTotalDays}
              </span>
              <span className="text-border">·</span>
              <span>{daysRemaining}d to horizon</span>
              <span className="text-border">·</span>
              <span
                className={cn(
                  "font-semibold",
                  isOnTrack ? "text-success" : "text-warning",
                )}
              >
                {paceSign}{variancePct}% vs nominal vector
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground/75 hidden md:inline">
              Hover curve or drag timeline rail to scrub
            </span>
          </div>
        )}
      </div>

      {/* ── SVG Flight Canvas ── */}
      <div className="relative mt-1 w-full touch-pan-y">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto overflow-visible select-none cursor-crosshair"
          role="img"
          aria-label={`Interactive ${cycleTotalDays}-Day Trajectory Plotter`}
          onMouseMove={(e) => handleSvgScrub(e.clientX)}
          onMouseLeave={() => {
            setScrubX(null);
            lastMilestoneRef.current = null;
          }}
        >
          <defs>
            {/* 80% Buffer Corridor Gradient */}
            <linearGradient id={coneGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.22} />
              <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity={0.10} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.03} />
            </linearGradient>

            {/* Predictive Vector Path Gradient */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={1} />
            </linearGradient>

            {/* Historical Trail Gradient */}
            <linearGradient id={trailGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0.8} />
            </linearGradient>

            {/* Subtle glow filter */}
            <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="4"
                floodColor="hsl(var(--primary))"
                floodOpacity={0.35}
              />
            </filter>
          </defs>

          {/* Altitude grid baselines */}
          {[yGoalCeiling, yGoal, (yOrigin + yGoal) / 2, yOrigin].map((y, idx) => (
            <line
              key={idx}
              x1={40}
              y1={y}
              x2={WIDTH - 30}
              y2={y}
              stroke="hsl(var(--foreground))"
              strokeOpacity={0.07}
              strokeDasharray="4 8"
              strokeWidth={1}
            />
          ))}

          {/* Milestone day vertical markers */}
          {milestoneDays.map((d) => {
            const mx = xOrigin + (spanX * d) / cycleTotalDays;
            const isPast = d <= safeElapsed;
            return (
              <g key={d}>
                <line
                  x1={mx}
                  y1={42}
                  x2={mx}
                  y2={yOrigin + 6}
                  stroke="hsl(var(--foreground))"
                  strokeOpacity={isPast ? 0.12 : 0.05}
                  strokeDasharray="2 4"
                  strokeWidth={1}
                />
                <text
                  x={mx}
                  y={yOrigin + 20}
                  textAnchor="middle"
                  fill="hsl(var(--muted-foreground))"
                  fontSize="11"
                  fontFamily="monospace"
                  opacity={isPast ? 0.9 : 0.45}
                >
                  D{d}
                </text>
              </g>
            );
          })}

          {/* 1. The 80% Buffer Corridor Cone */}
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
            transition={{ duration: 0.65, delay: 0.1 }}
          />
          <motion.path
            d={`M ${xCurrent} ${yCurrent} C ${c1x} ${c1yLower}, ${c2x} ${c2yLower}, ${xGoal} ${yGoalFloor}`}
            fill="none"
            stroke="hsl(var(--primary) / 0.35)"
            strokeWidth={1.5}
            strokeDasharray="4 5"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.1 }}
          />

          {/* Buffer Bracket at Goal */}
          <line
            x1={xGoal}
            y1={yGoalCeiling}
            x2={xGoal}
            y2={yGoalFloor}
            stroke="hsl(var(--primary) / 0.6)"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <text
            x={xGoal - 8}
            y={(yGoalCeiling + yGoalFloor) / 2 + 4}
            textAnchor="end"
            fill="hsl(var(--foreground))"
            fontSize="10"
            fontWeight="600"
            fontFamily="monospace"
            opacity={0.7}
          >
            ±10% Buffer
          </text>

          {/* 2. Historical Evidence Trail */}
          <motion.path
            d={historicTrailPath}
            fill="none"
            stroke={`url(#${trailGradId})`}
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: TIS_EASINGS.subtleEntrance }}
          />

          {/* Historical Evidence Points */}
          {trailDots.map((dot, i) => (
            <motion.circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={3}
              fill={dot.outcome === "completed" ? "hsl(var(--foreground))" : "none"}
              stroke={dot.outcome === "completed" ? "hsl(var(--background))" : "hsl(var(--muted-foreground))"}
              strokeWidth={1.5}
              initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: dot.outcome === "completed" ? 0.9 : 0.5 }}
              transition={{ delay: 0.4 + i * 0.02, ...TIS_SPRINGS.snap }}
            />
          ))}

          {/* 3. Predictive Pursuit Vector */}
          <motion.path
            d={predictiveCurvePath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={3}
            strokeLinecap="round"
            filter={`url(#${glowFilterId})`}
            initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0.2 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.65, ease: TIS_EASINGS.precisionInOut }}
          />

          {/* Origin Marker */}
          <g transform={`translate(${xOrigin}, ${yOrigin})`}>
            <circle r={4} fill="hsl(var(--muted-foreground))" opacity={0.6} />
            <text
              y={20}
              textAnchor="middle"
              fill="hsl(var(--muted-foreground))"
              fontSize="11"
              fontWeight="500"
              fontFamily="monospace"
            >
              Day 0
            </text>
          </g>

          {/* Current In-Flight Position Node */}
          <motion.g
            transform={`translate(${xCurrent}, ${yCurrent})`}
            initial={shouldReduceMotion ? false : { scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={TIS_SPRINGS.settle}
          >
            <circle r={7} fill="hsl(var(--primary) / 0.25)">
              <animate attributeName="r" values="7;20;7" dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.8s" repeatCount="indefinite" />
            </circle>
            <circle
              r={7}
              fill="hsl(var(--foreground))"
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
            <circle r={3} fill="hsl(var(--background))" />

            {/* Clean compact coordinate marker */}
            <g transform="translate(0, -18)">
              <rect
                x={-28}
                y={-14}
                width={56}
                height={18}
                rx={9}
                fill="hsl(var(--card))"
                stroke="hsl(var(--border))"
                strokeWidth={1}
                className="drop-shadow-xs"
              />
              <text
                y={-2}
                textAnchor="middle"
                fill="hsl(var(--foreground))"
                fontSize="10"
                fontWeight="700"
                fontFamily="monospace"
              >
                D{safeElapsed}
              </text>
            </g>
          </motion.g>

          {/* 90-Day Destination Target Node */}
          <g transform={`translate(${xGoal}, ${yGoal})`}>
            <circle r={8} fill="hsl(var(--primary) / 0.18)" stroke="hsl(var(--primary))" strokeWidth={1.5} />
            <circle r={3.5} fill="hsl(var(--primary))" />
            <g transform="translate(0, -18)">
              <rect
                x={-42}
                y={-14}
                width={84}
                height={18}
                rx={9}
                fill="hsl(var(--card))"
                stroke="hsl(var(--border))"
                strokeWidth={1}
                className="drop-shadow-xs"
              />
              <text
                y={-2}
                textAnchor="middle"
                fill="hsl(var(--foreground))"
                fontSize="10"
                fontWeight="700"
                fontFamily="monospace"
              >
                {targetAnchors} ANCHORS
              </text>
            </g>
            <text
              y={20}
              textAnchor="middle"
              fill="hsl(var(--muted-foreground))"
              fontSize="11"
              fontWeight="500"
              fontFamily="monospace"
            >
              Day {cycleTotalDays}
            </text>
          </g>

          {/* Active Scrub Hairline Cursor */}
          {scrubX !== null && (
            <g pointerEvents="none">
              <line
                x1={scrubX}
                y1={32}
                x2={scrubX}
                y2={yOrigin + 6}
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

      {/* ── Touch-Friendly Dedicated Scrub Track (Reliable on mobile & desktop) ── */}
      <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground px-1">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <span>Timeline Detents</span>
          </span>
          <span>15-Day Milestone Grid</span>
        </div>

        {/* Tactile Scrub Slider Rail */}
        <div className="relative py-1">
          <input
            type="range"
            min={1}
            max={cycleTotalDays}
            value={activeScrubDay ?? safeElapsed}
            onChange={(e) => {
              const day = Number(e.target.value);
              const mappedX = xOrigin + (spanX * day) / cycleTotalDays;
              setScrubX(mappedX);
              if (day % 15 === 0 && day !== lastMilestoneRef.current) {
                triggerHaptic("light");
                lastMilestoneRef.current = day;
              }
            }}
            onMouseUp={() => setScrubX(null)}
            onTouchEnd={() => setScrubX(null)}
            className="w-full h-2 bg-muted/60 rounded-lg appearance-none cursor-pointer accent-foreground focus:outline-none"
            aria-label="Timeline scrub rail"
          />

          {/* Milestone tick marks */}
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground pt-1.5 px-0.5">
            <span>Day 1</span>
            <span>D15</span>
            <span>D30</span>
            <span>D45</span>
            <span>D60</span>
            <span>D75</span>
            <span>Day 90</span>
          </div>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground border-t border-border/60 pt-3">
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
              <span className="inline-block size-2 rounded-full bg-foreground/70" />
              <span>Anchor Locked</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-transparent border border-muted-foreground/50" />
              <span>Buffer Absorbed</span>
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
