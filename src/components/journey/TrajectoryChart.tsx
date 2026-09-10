import { useState } from "react";
import { Target, Check, X } from "lucide-react";
import type { TrajectoryResult, TrajectoryPoint } from "@/lib/trajectory";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";

interface TrajectoryChartProps {
  trajectory: TrajectoryResult;
  goalLabel?: string;
}

const WIDTH = 640;
const HEIGHT = 260;
const PAD_X = 28;
const PAD_Y = 24;

// Restrained, space-inspired coordinate space: quiet grid, thin lines,
// no planets/energy/cosmic levels — every visible element maps directly
// to a field in TrajectoryResult. Intended = the positive reference path
// (every Goal-linked Quest as if completed). Actual = what really
// happened. The gap between them at any x is the deviation.
export function TrajectoryChart({ trajectory, goalLabel }: TrajectoryChartProps) {
  const { actual, intended } = trajectory;
  const [selected, setSelected] = useState<TrajectoryPoint | null>(null);

  // Origin (0) is always the first plotted point, so both lines visibly
  // depart from a shared start rather than appearing to begin mid-air.
  const actualSeries = [0, ...actual.map((p) => p.position)];
  const intendedSeries = [0, ...intended.map((p) => p.position)];
  const pointCount = actualSeries.length;

  // Founder Decision (Journey graph — Graph Idea #1): intended-range
  // band, ±1 step around the intended reference path — an "on-track
  // zone," not a precision target. Computed from the SAME intendedSeries
  // used everywhere else in this file; no new data, no new derivation,
  // no change to trajectory.ts. Included in allValues below so the y-scale
  // expands to fit the band without clipping it.
  const bandUpper = intendedSeries.map((v) => v + 1);
  const bandLower = intendedSeries.map((v) => v - 1);

  const allValues = [...actualSeries, ...intendedSeries, ...bandUpper, ...bandLower];
  const minY = Math.min(...allValues);
  const maxY = Math.max(...allValues);
  const rangeY = Math.max(maxY - minY, 1);

  const xFor = (i: number) =>
    pointCount <= 1 ? PAD_X : PAD_X + (i / (pointCount - 1)) * (WIDTH - PAD_X * 2);
  const yFor = (v: number) =>
    HEIGHT - PAD_Y - ((v - minY) / rangeY) * (HEIGHT - PAD_Y * 2);

  const pathFor = (series: number[]) =>
    series.map((v, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(v)}`).join(" ");

  // Founder Decision (Mobile graph chunk): smooth curve instead of a
  // straight-segment line, via Catmull-Rom-to-cubic-Bezier conversion —
  // a standard, well-understood technique, not a novel/decorative
  // effect. Purely a rendering choice: the underlying data points,
  // their x/y positions, and what they mean are completely unchanged: no
  // point is added, removed, or moved, and no value is smoothed/altered.
  // Only used for the actual-evidence line (what a person reads as "real
  // data"); the intended line stays a plain dashed reference and is
  // deliberately NOT curved, so it continues to read as a straight
  // reference path rather than another data series.
  const smoothPathFor = (series: number[]) => {
    const pts = series.map((v, i) => [xFor(i), yFor(v)] as const);
    if (pts.length < 2) return pathFor(series);
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
    }
    return d;
  };

  // Same smooth curve, closed down to the zero-baseline, for the
  // gradient area fill under the actual line.
  const areaPathFor = (series: number[]) =>
    `${smoothPathFor(series)} L ${xFor(series.length - 1)} ${yFor(0)} L ${xFor(0)} ${yFor(0)} Z`;

  // Straight-segment band boundary (matches the intended line's own
  // non-smoothed treatment — a reference zone, not a data series):
  // trace the lower bound left-to-right, then the upper bound back
  // right-to-left, closing into one filled ribbon shape.
  const bandPath = () => {
    const upperPts = bandUpper.map((v, i) => [xFor(i), yFor(v)] as const);
    const lowerPts = bandLower.map((v, i) => [xFor(i), yFor(v)] as const);
    const lowerPath = lowerPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
    const upperPath = [...upperPts].reverse().map((p) => `L ${p[0]} ${p[1]}`).join(" ");
    return `${lowerPath} ${upperPath} Z`;
  };

  const gridLines = 4;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Trajectory: actual movement compared to intended direction, based on completed and missed Quests linked to your goal"
      >
        <defs>
          {/* Founder Decision (Mobile graph chunk): area fill under the
              actual line, fading to fully transparent — improves
              legibility at small mobile sizes by giving the eye a shape
              to read instead of only a thin stroke, without adding any
              new color (--primary token only, capped at low opacity). */}
          <linearGradient id="trajectory-actual-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.28} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Quiet coordinate grid — structural, not decorative. Reduced
            opacity again this chunk (0.4 → 0.28) now that the band adds
            its own visual weight to the plotting area — the grid's only
            job is orientation, it should never compete for attention. */}
        {Array.from({ length: 2 + 1 }).map((_, i) => {
          const y = PAD_Y + (i / 2) * (HEIGHT - PAD_Y * 2);
          return (
            <line
              key={i}
              x1={PAD_X}
              y1={y}
              x2={WIDTH - PAD_X}
              y2={y}
              stroke="hsl(var(--border))"
              strokeOpacity={0.28}
              strokeWidth={1}
            />
          );
        })}

        {/* Zero line, slightly more present than the rest of the grid */}
        <line
          x1={PAD_X}
          y1={yFor(0)}
          x2={WIDTH - PAD_X}
          y2={yFor(0)}
          stroke="hsl(var(--border))"
          strokeOpacity={0.7}
          strokeWidth={1}
        />

        {/* Founder Decision (Journey graph — Graph Idea #1): the
            intended-range band. Neutral (muted-foreground, not primary)
            and very translucent (6%) — deliberately not colored like a
            data series and not strong enough to read as an error/
            uncertainty band. It exists purely to say "this general zone
            is reasonable," secondary to everything else on the chart. */}
        <path d={bandPath()} fill="hsl(var(--muted-foreground) / 0.06)" stroke="none" />

        {/* Intended trajectory — the positive reference path. Now that
            the band carries most of the orientation role, this line is
            kept only as a faint centerline (opacity lowered from 0.6 to
            0.35) rather than a second competing element. Still a plain
            straight-segment line, not smoothed. */}
        <path
          d={pathFor(intendedSeries)}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.35}
        />

        {/* Actual trajectory — gradient area fill, then the smoothed
            line on top of it. */}
        <path d={areaPathFor(actualSeries)} fill="url(#trajectory-actual-fill)" stroke="none" />
        <path
          d={smoothPathFor(actualSeries)}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Evidence points on the actual line — each one is a real,
            resolved, Goal-linked Quest and nothing else. */}
        {actual.map((point, i) => {
          const x = xFor(i + 1);
          const y = yFor(point.position);
          const isSelected = selected?.quest.id === point.quest.id;
          return (
            <g key={point.quest.id}>
              {/* Founder Decision (Mobile usability chunk): the visible
                  dot (r=4, r=6 selected) is far too small to reliably tap
                  on a phone — an 8px rendered diameter at typical mobile
                  container widths. This invisible circle sits on top with
                  a touch-appropriate radius and carries the actual
                  interaction (tabIndex, role, click/focus handlers,
                  aria-label); the visible circle below is now purely
                  decorative (aria-hidden) so the accessible name isn't
                  announced twice. No visual change — same dot, same size,
                  same appearance. */}
              <circle
                cx={x}
                cy={y}
                r={14}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${point.quest.title}, ${point.outcome}, ${point.timestamp.split("T")[0]}`}
                className="cursor-pointer outline-none"
                onClick={() => setSelected(point)}
                onFocus={() => setSelected(point)}
              />
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 6 : 4}
                fill={point.outcome === "completed" ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                stroke="hsl(var(--background))"
                strokeWidth={1.5}
                aria-hidden="true"
                className={isSelected ? "stroke-foreground" : undefined}
              >
                <title>{`${point.quest.title} — ${point.outcome} — ${point.timestamp.split("T")[0]}`}</title>
              </circle>
            </g>
          );
        })}

        {/* Current position marker */}
        {actual.length > 0 && (
          <circle
            cx={xFor(pointCount - 1)}
            cy={yFor(actualSeries[actualSeries.length - 1])}
            r={7}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
        )}

        {/* Goal/destination indicator — end of the intended path */}
        <g transform={`translate(${xFor(pointCount - 1)}, ${yFor(intendedSeries[intendedSeries.length - 1])})`}>
          <circle r={3} fill="hsl(var(--muted-foreground))" />
        </g>
      </svg>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 bg-primary" /> Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 border-t border-dashed border-muted-foreground" /> Intended
          </span>
          {goalLabel && (
            <span className="flex items-center gap-1.5">
              <Target className="size-3.5" aria-hidden="true" /> {goalLabel}
            </span>
          )}
        </div>
        {/* Founder Decision (Copy clarity chunk): the raw "+2" carried
            no explanation of what it counts. Same number, same
            computation (trajectory.currentPosition, from
            lib/trajectory.ts — unchanged) — only the label now states
            what it means in plain words, so it reads as a fact about
            behavior rather than an unexplained score. */}
        <span>
          Current position: {trajectory.currentPosition >= 0 ? "+" : ""}{trajectory.currentPosition}
          <span className="text-muted-foreground"> (completed minus missed, for Quests linked to your goal)</span>
        </span>
      </div>

      {selected && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-sm">
          {selected.outcome === "completed" ? (
            <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
          ) : (
            <X className="size-4 shrink-0 text-destructive" aria-hidden="true" />
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{selected.quest.title}</p>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${PRIORITY_BADGE_CLASSES[selected.quest.priority]}`}>
                {selected.quest.priority}
              </span>
            </div>
            <p className="text-muted-foreground">
              {selected.outcome === "completed" ? "Completed" : "Not completed"} — {selected.timestamp.split("T")[0]}
              {selected.quest.goalName ? ` — supported "${selected.quest.goalName}"` : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
