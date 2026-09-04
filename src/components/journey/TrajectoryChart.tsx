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

  const allValues = [...actualSeries, ...intendedSeries];
  const minY = Math.min(...allValues);
  const maxY = Math.max(...allValues);
  const rangeY = Math.max(maxY - minY, 1);

  const xFor = (i: number) =>
    pointCount <= 1 ? PAD_X : PAD_X + (i / (pointCount - 1)) * (WIDTH - PAD_X * 2);
  const yFor = (v: number) =>
    HEIGHT - PAD_Y - ((v - minY) / rangeY) * (HEIGHT - PAD_Y * 2);

  const pathFor = (series: number[]) =>
    series.map((v, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(v)}`).join(" ");

  const gridLines = 4;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Trajectory: actual movement compared to intended direction, based on completed and missed Quests linked to your goal"
      >
        {/* Quiet coordinate grid — structural, not decorative */}
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = PAD_Y + (i / gridLines) * (HEIGHT - PAD_Y * 2);
          return (
            <line
              key={i}
              x1={PAD_X}
              y1={y}
              x2={WIDTH - PAD_X}
              y2={y}
              stroke="hsl(var(--border))"
              strokeOpacity={0.4}
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
          strokeOpacity={0.8}
          strokeWidth={1}
        />

        {/* Intended trajectory — the positive reference path */}
        <path
          d={pathFor(intendedSeries)}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.6}
        />

        {/* Actual trajectory */}
        <path
          d={pathFor(actualSeries)}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
        />

        {/* Evidence points on the actual line — each one is a real,
            resolved, Goal-linked Quest and nothing else. */}
        {actual.map((point, i) => {
          const x = xFor(i + 1);
          const y = yFor(point.position);
          const isSelected = selected?.quest.id === point.quest.id;
          return (
            <circle
              key={point.quest.id}
              cx={x}
              cy={y}
              r={isSelected ? 6 : 4}
              fill={point.outcome === "completed" ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
              stroke="hsl(var(--background))"
              strokeWidth={1.5}
              tabIndex={0}
              role="button"
              aria-label={`${point.quest.title}, ${point.outcome}, ${point.timestamp.split("T")[0]}`}
              className="cursor-pointer outline-none focus-visible:stroke-foreground"
              onClick={() => setSelected(point)}
              onFocus={() => setSelected(point)}
            >
              <title>{`${point.quest.title} — ${point.outcome} — ${point.timestamp.split("T")[0]}`}</title>
            </circle>
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
        <span>Current position: {trajectory.currentPosition >= 0 ? "+" : ""}{trajectory.currentPosition}</span>
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
