import { useId, useRef, useState, useCallback, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Info, CheckCircle2, Shield, AlertTriangle, Compass, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TIS_SPRINGS, TIS_EASINGS } from "@/lib/motion-tokens";
import { triggerHaptic } from "@/lib/haptics";
import type { TrajectoryPoint, PaceStatus } from "@/lib/trajectory";

interface TrajectoryVisualizerProps {
  completedQuests: number;
  targetQuests?: number; // default 90 target anchors
  elapsedDays?: number; // 1 to 90
  daysRemaining?: number;
  isHorizonExpired?: boolean;
  actualPoints?: TrajectoryPoint[];
  bufferDaysRemaining?: number; // out of 9 flex days
  paceRatio?: number;
  isOnTrack: boolean;
  paceStatus?: PaceStatus;
  goalLabel?: string;
  className?: string;
  // Total days in cycle (defaults to 90 + horizonExtensionDays)
  cycleTotalDays?: number;
  horizonExtensionDays?: number;
  isEarlyArrival?: boolean;
}

const WIDTH = 760;
const HEIGHT = 320;

/**
 * Maps an actual TrajectoryPoint to its day index within the cycle (1..safeElapsed)
 * using its recorded timestamp relative to the current evaluation moment.
 */
function getPointDay(
  pt: TrajectoryPoint,
  index: number,
  total: number,
  safeElapsed: number,
  nowMs: number,
): number {
  if (pt.timestamp) {
    const ptMs = new Date(pt.timestamp).getTime();
    if (!isNaN(ptMs)) {
      const daysAgo = Math.max(0, (nowMs - ptMs) / (1000 * 60 * 60 * 24));
      return Math.min(safeElapsed, Math.max(1, safeElapsed - daysAgo));
    }
  }
  return Math.min(safeElapsed, Math.max(1, ((index + 1) / total) * safeElapsed));
}

export function TrajectoryVisualizer({
  completedQuests,
  targetQuests = 90,
  elapsedDays = 1,
  daysRemaining = 89,
  isHorizonExpired = false,
  actualPoints = [],
  bufferDaysRemaining = 9,
  paceRatio = 1.0,
  isOnTrack,
  paceStatus,
  goalLabel,
  className,
  cycleTotalDays = 90,
  horizonExtensionDays = 0,
  isEarlyArrival = false,
}: TrajectoryVisualizerProps) {
  const gradientId = useId();
  const coneGradId = useId();
  const glowFilterId = useId();
  const trailGradId = useId();
  const shouldReduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [scrubX, setScrubX] = useState<number | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const lastMilestoneRef = useRef<number | null>(null);

  const nowMs = useMemo(() => Date.now(), []);

  // Coordinate geometry
  const xOrigin = 48;
  const xGoal = 688;
  const spanX = xGoal - xOrigin;

  const yOrigin = 250; // 0 anchors baseline
  // Fix 4a: yGoal derived from targetAnchors — not hardcoded to 82.
  // If targetQuests ever changes, the target line moves correctly.
  const yMin = 40;
  const targetAnchors = Math.max(1, targetQuests || 90);
  const yGoal = yMin + (yOrigin - yMin) * 0.20; // 82px — computed
  const spanY = yOrigin - yGoal;

  const safeElapsed = Math.max(1, Math.min(cycleTotalDays, elapsedDays));
  const safeCompleted = Math.max(0, completedQuests);

  const xCurrent = xOrigin + (spanX * safeElapsed) / cycleTotalDays;
  const yCurrent = Math.max(yMin, yOrigin - (spanY * Math.min(targetAnchors, safeCompleted)) / targetAnchors);

  // Fix 4b: ±10% buffer corridor bounds derived from yGoal, not hardcoded.
  const yGoalCeiling = Math.max(yMin, yGoal - spanY * 0.10);
  const yGoalFloor   = Math.min(yOrigin - 8, yGoal + spanY * 0.10);

  // Prevent vertical 90-degree cliff if near horizon without meeting target quota
  const isNearHorizonWithoutTarget = xCurrent >= xGoal - 12 && safeCompleted < targetAnchors;

  // Pace baseline status: fewer than 3 days of data is establishing
  const isEstablishing = (paceStatus ?? (safeElapsed < 3 ? "establishing" : "nominal")) === "establishing";

  // Honest projected forecast vector based on current velocity (when not establishing)
  const effectiveDailyPace = typeof paceRatio === "number" && !isNaN(paceRatio) && paceRatio >= 0 ? paceRatio : 1.0;
  const remainingDaysInCycle = Math.max(0, cycleTotalDays - safeElapsed);
  const projectedAnchors = Math.min(targetAnchors, Math.max(0, safeCompleted + effectiveDailyPace * remainingDaysInCycle));
  const yForecast = Math.max(yMin, yOrigin - (spanY * Math.min(targetAnchors, projectedAnchors)) / targetAnchors);

  // Fix 4c: Cone now fans FORWARD from today's position (xCurrent, yCurrent),
  // not from the chart origin (xOrigin, yOrigin).
  const conePath = `
    M ${xCurrent.toFixed(1)} ${yCurrent.toFixed(1)}
    L ${xGoal} ${yGoalCeiling.toFixed(1)}
    L ${xGoal} ${yGoalFloor.toFixed(1)}
    Z
  `;

  // Real Historical Trail using actual timestamps
  const sortedPoints = useMemo(() => {
    return [...actualPoints].sort((a, b) =>
      (a.timestamp || "").localeCompare(b.timestamp || "")
    );
  }, [actualPoints]);

  const { historicTrailPath, trailDots } = useMemo(() => {
    const dots: Array<{ x: number; y: number; outcome: "completed" | "failed" }> = [];
    let path = "";

    if (sortedPoints.length > 0) {
      path = `M ${xOrigin} ${yOrigin}`;
      sortedPoints.forEach((pt, i) => {
        const ptDay = getPointDay(pt, i, sortedPoints.length, safeElapsed, nowMs);
        const px = xOrigin + (spanX * ptDay) / cycleTotalDays;
        const py = Math.max(yMin, yOrigin - (spanY * Math.min(targetAnchors, pt.position)) / targetAnchors);
        path += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
        dots.push({ x: px, y: py, outcome: pt.outcome });
      });
      path += ` L ${xCurrent.toFixed(1)} ${yCurrent.toFixed(1)}`;
    } else {
      path = `M ${xOrigin} ${yOrigin} L ${xCurrent.toFixed(1)} ${yCurrent.toFixed(1)}`;
    }
    return { historicTrailPath: path, trailDots: dots };
  }, [sortedPoints, safeElapsed, xOrigin, yOrigin, spanX, spanY, cycleTotalDays, targetAnchors, xCurrent, yCurrent, yMin, nowMs]);

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

  const scrubAnchors = useMemo(() => {
    if (activeScrubDay === null) return null;
    if (activeScrubDay === safeElapsed) {
      return safeCompleted;
    }
    if (activeScrubDay < safeElapsed) {
      if (sortedPoints.length === 0) return 0;
      let recorded = 0;
      for (let i = 0; i < sortedPoints.length; i++) {
        const pt = sortedPoints[i];
        const day = Math.floor(getPointDay(pt, i, sortedPoints.length, safeElapsed, nowMs));
        if (day <= activeScrubDay) {
          recorded = pt.position;
        }
      }
      return recorded;
    }
    // Future day (activeScrubDay > safeElapsed): Planned target anchors
    return Math.min(
      targetAnchors,
      Math.round((activeScrubDay / cycleTotalDays) * targetAnchors)
    );
  }, [activeScrubDay, safeElapsed, safeCompleted, sortedPoints, targetAnchors, cycleTotalDays, nowMs]);

  // Milestones: 15, 30, 45, 60, 75
  const milestoneDays = useMemo(() => {
    return [15, 30, 45, 60, 75];
  }, []);

  const badgeConfig = useMemo(() => {
    if (safeCompleted >= targetAnchors) {
      return {
        label: "Goal Completed",
        variant: "success" as const,
        dotClass: "bg-emerald-500",
      };
    }
    const status = paceStatus ?? (isOnTrack ? "nominal" : "critical");
    switch (status) {
      case "establishing":
        return {
          label: "Establishing",
          variant: "neutral" as const,
          dotClass: "bg-muted-foreground/60",
        };
      case "ahead":
        return {
          label: "Ahead of Target",
          variant: "success" as const,
          dotClass: "bg-emerald-500",
        };
      case "behind":
        return {
          label: "Buffer Active",
          variant: "warning" as const,
          dotClass: "bg-amber-500",
        };
      case "critical":
        return {
          label: "Needs Adjustment",
          variant: "destructive" as const,
          dotClass: "bg-rose-500",
        };
      case "nominal":
      default:
        return {
          label: "On Track",
          variant: "success" as const,
          dotClass: "bg-emerald-500",
        };
    }
  }, [paceStatus, isOnTrack, safeCompleted, targetAnchors]);

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

      

      {/* ── Revolut-Style Top KPI Header (Inside the Card) ── */}
      <div className="relative z-10 flex items-start justify-between gap-4 pb-1">
        <div className="min-w-0">
          {/* Eyebrow: Clearly distinguish recorded history from planned target */}
          <span className="text-xs font-semibold text-primary block truncate">
            {activeScrubDay !== null
              ? activeScrubDay === safeElapsed
                ? `Today · Day ${safeElapsed}`
                : activeScrubDay < safeElapsed
                ? `Day ${activeScrubDay} · Recorded`
                : `Day ${activeScrubDay} · Planned Target`
              : "Goal progress"}
          </span>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-foreground tabular-nums">
              {activeScrubDay !== null ? scrubAnchors : completedQuests}
            </span>
            <span className="text-sm font-sans text-muted-foreground">
              / {targetAnchors} completed (
              {Math.round(
                ((activeScrubDay !== null ? scrubAnchors : completedQuests) /
                  Math.max(1, targetAnchors)) *
                  100,
              )}
              %)
            </span>
          </div>
        </div>

        {/* Single Restrained Status Badge */}
        <Badge
          variant={badgeConfig.variant}
          className="gap-1.5 py-1 text-xs font-sans font-medium shrink-0"
        >
          <span className={cn("size-2 rounded-full", badgeConfig.dotClass)} />
          <span>{badgeConfig.label}</span>
        </Badge>
      </div>

      {/* ── SVG Flight Canvas ── */}
      <div className="relative mt-2 w-full touch-pan-y">
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
          onTouchStart={(e) => {
            if (e.touches[0]) handleSvgScrub(e.touches[0].clientX);
          }}
          onTouchMove={(e) => {
            // Fix 7: Touch scrubbing unified onto the SVG — single coordinate system.
            // The <input type="range"> was a second system that mapped day→pixel
            // independently, causing activeScrubDay to jump on narrow screens because
            // the two rect measurements disagreed. One source of truth: SVG clientX.
            if (e.cancelable) e.preventDefault();
            if (e.touches[0]) handleSvgScrub(e.touches[0].clientX);
          }}
          onTouchEnd={() => {
            setScrubX(null);
            lastMilestoneRef.current = null;
          }}
          onTouchCancel={() => {
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

          {/* Altitude grid baselines & Y-axis labels (right-aligned at x=38, chart starts at xOrigin=48) */}
          {[
            { y: yGoal, label: String(targetAnchors) },
            { y: (yOrigin + yGoal) / 2, label: String(Math.round(targetAnchors / 2)) },
            { y: yOrigin, label: "0" },
          ].map((item, idx) => (
            <g key={idx}>
              <line
                x1={42}
                y1={item.y}
                x2={WIDTH - 24}
                y2={item.y}
                stroke="hsl(var(--foreground))"
                strokeOpacity={0.07}
                strokeDasharray="4 8"
                strokeWidth={1}
              />
              <text
                x={38}
                y={item.y + 3}
                textAnchor="end"
                fill="hsl(var(--muted-foreground))"
                className="text-[10px] font-mono fill-muted-foreground/60"
                opacity={0.65}
              >
                {item.label}
              </text>
            </g>
          ))}
          <line
            x1={42}
            y1={yGoalCeiling}
            x2={WIDTH - 24}
            y2={yGoalCeiling}
            stroke="hsl(var(--foreground))"
            strokeOpacity={0.05}
            strokeDasharray="4 8"
            strokeWidth={1}
          />

          {/* Milestone day vertical markers (de-duplicated, scale on timeline rail below) */}
          {milestoneDays.map((d) => {
            const mx = xOrigin + (spanX * d) / cycleTotalDays;
            const isPast = d <= safeElapsed;
            return (
              <line
                key={d}
                x1={mx}
                y1={42}
                x2={mx}
                y2={yOrigin + 6}
                stroke="hsl(var(--foreground))"
                strokeOpacity={isPast ? 0.12 : 0.05}
                strokeDasharray="2 4"
                strokeWidth={1}
              />
            );
          })}

          {/* 1. Shaded ±10% Buffer Cone & Target Vector from Origin to Horizon */}
          <motion.path
            d={conePath}
            fill={`url(#${coneGradId})`}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: TIS_EASINGS.subtleEntrance }}
          />
          <line
            x1={xOrigin}
            y1={yOrigin}
            x2={xGoal}
            y2={yGoalCeiling}
            stroke="hsl(var(--primary) / 0.35)"
            strokeWidth={1.5}
            strokeDasharray="4 5"
          />
          <line
            x1={xOrigin}
            y1={yOrigin}
            x2={xGoal}
            y2={yGoalFloor}
            stroke="hsl(var(--primary) / 0.35)"
            strokeWidth={1.5}
            strokeDasharray="4 5"
          />

          {/* Solid Nominal Target Vector (1.0/day baseline) */}
          <line
            x1={xOrigin}
            y1={yOrigin}
            x2={xGoal}
            y2={yGoal}
            stroke="hsl(var(--primary) / 0.55)"
            strokeWidth={1.5}
            strokeLinecap="round"
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
            fill="hsl(var(--muted-foreground))"
            fontSize="10"
            fontWeight="500"
            fontFamily="sans-serif"
            opacity={0.85}
          >
            ±10% Buffer Zone
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

          {/* 3. Predictive Forecast Vector or Horizon Extension Indicator */}
          {isNearHorizonWithoutTarget ? (
            <g>
              <line
                x1={xCurrent}
                y1={yCurrent}
                x2={Math.min(WIDTH - 20, xCurrent + 40)}
                y2={yCurrent}
                stroke="hsl(var(--warning))"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
              <polygon
                points={`${Math.min(WIDTH - 20, xCurrent + 40)},${yCurrent} ${Math.min(WIDTH - 20, xCurrent + 40) - 7},${yCurrent - 4} ${Math.min(WIDTH - 20, xCurrent + 40) - 7},${yCurrent + 4}`}
                fill="hsl(var(--warning))"
              />
              <text
                x={xCurrent - 8}
                y={yCurrent - 10}
                textAnchor="end"
                fill="hsl(var(--warning))"
                fontSize="10"
                fontWeight="600"
                fontFamily="sans-serif"
              >
                Date Adjustment Recommended →
              </text>
            </g>
          ) : !isEstablishing ? (
            <motion.line
              x1={xCurrent}
              y1={yCurrent}
              x2={xGoal}
              y2={yForecast}
              stroke="hsl(var(--primary))"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              strokeOpacity={0.65}
              strokeLinecap="round"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.65, ease: TIS_EASINGS.precisionInOut }}
            />
          ) : null}

          {/* Origin Marker (minimal dot without crushed labels) */}
          <circle cx={xOrigin} cy={yOrigin} r={3.5} fill="hsl(var(--muted-foreground))" opacity={0.6} />

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
              r={6}
              fill="hsl(var(--foreground))"
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
            <circle r={2.5} fill="hsl(var(--background))" />
          </motion.g>

          {/* Destination Target Node (minimal crisp target pin) */}
          <g transform={`translate(${xGoal}, ${yGoal})`}>
            <circle r={7} fill="hsl(var(--primary) / 0.18)" stroke="hsl(var(--primary))" strokeWidth={1.5} />
            <circle r={3} fill="hsl(var(--primary))" />
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
                cy={Math.max(
                  yMin,
                  yOrigin -
                    (spanY * Math.min(targetAnchors, scrubAnchors ?? 0)) /
                      targetAnchors,
                )}
                r={4}
                fill="hsl(var(--primary))"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Fix 7: Slider removed. Scrubbing is now handled entirely by
          onMouseMove / onTouchMove on the SVG — single coordinate system,
          no dual-mapping jump on narrow screens. Milestone labels remain
          as a static strip to preserve visual context. */}
      <div className="mt-1 flex justify-between text-xs font-mono text-muted-foreground px-0.5">
        <span>D1</span>
        <span>D15</span>
        <span>D30</span>
        <span>D45</span>
        <span>D60</span>
        <span>D75</span>
        <span>D{cycleTotalDays}</span>
      </div>

      {/* ── Visual Status Legend & Trajectory Key (P2-51) ── */}
      <div className="mt-4 pt-3.5 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* Status Dots */}
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <strong className="text-foreground font-medium">On Track</strong>
            <span className="text-muted-foreground hidden sm:inline">(±10% cone)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500" aria-hidden="true" />
            <strong className="text-foreground font-medium">Buffer Active</strong>
            <span className="text-muted-foreground hidden sm:inline">(absorbing)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-rose-500" aria-hidden="true" />
            <strong className="text-foreground font-medium">Needs Adjustment</strong>
          </span>

          <span className="text-border/80 hidden sm:inline">|</span>

          {/* Geometry Lines */}
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-foreground" />
            <span>History</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-primary" />
            <span>Target Vector</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm self-start sm:self-auto shrink-0"
        >
          <Info className="size-3.5" aria-hidden="true" />
          <span>Status Guide</span>
        </button>
      </div>

      {/* Status Guide Dialog (Comprehensive yet non-cluttering explanation) */}
      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Compass className="size-5 text-primary" />
              <span>Status & Trajectory Guide</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              How Kinetic measures velocity, safety buffers, and trajectory health.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 mt-2 text-xs">
            {/* On Track */}
            <div className="p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] space-y-1">
              <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                <span>On Track (Nominal Corridor)</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Daily completion pace is within the ±10% mathematical buffer corridor. Your 90-day milestone is on schedule.
              </p>
            </div>

            {/* Buffer Active */}
            <div className="p-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] space-y-1">
              <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
                <Shield className="size-3.5" />
                <span>Buffer Active (Safety Margin Engaged)</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Pace is slightly below 1.0/day, but your 9-day flex buffer is absorbing the variance without postponing your completion date.
              </p>
            </div>

            {/* Needs Adjustment */}
            <div className="p-3 rounded-xl border border-rose-500/25 bg-rose-500/[0.06] space-y-1">
              <div className="flex items-center gap-2 font-semibold text-rose-700 dark:text-rose-400">
                <AlertTriangle className="size-3.5" />
                <span>Needs Adjustment (Velocity Boost Needed)</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Buffer days are depleted (0 remaining) or deadline has slipped. Focus on primary milestone commitments this week to re-enter the corridor.
              </p>
            </div>

            {/* Establishing */}
            <div className="p-3 rounded-xl border border-border/60 bg-muted/40 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Compass className="size-3.5 text-muted-foreground" />
                <span>Establishing Baseline</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                First 3 days of your 90-day cycle while initial momentum and daily habit cadence are calibrated.
              </p>
            </div>

            {/* Commitment Constraints */}
            <div className="pt-2 border-t border-border/50 text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Daily Constraints:</p>
              <p>• <strong>1 Primary Focus:</strong> Dominant daily milestone advancing your 90-day goal.</p>
              <p>• <strong>Max 2 Routines:</strong> Daily recurring practices protecting consistency.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
