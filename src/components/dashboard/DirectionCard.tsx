import { Compass, Flame } from "lucide-react";
import type { GoalStats } from "@/lib/trajectory";

interface DirectionCardProps {
  name: string;
  // Founder Decision (Goal→Quest→Outcome chunk): a small, honest summary
  // of what the current goal has actually gotten from the user so far —
  // undefined when there's no primary goal set at all (distinct from a
  // goal with zero linked Quests yet, which is {linked:0, completed:0,
  // failed:0} and renders its own honest "nothing linked yet" line
  // rather than being hidden).
  goalStats?: GoalStats;
  // Founder Decision (Visual override chunk): real, honestly-computed
  // consecutive-day count (see deriveCurrentStreak in lib/trajectory.ts)
  // — 0 renders nothing rather than "0 day streak".
  streak?: number;
}

// Founder Decision (Visual override chunk): a small ring visualization
// of goalStats.completed/linked — same two numbers DirectionCard already
// displayed as text, just also shown as a shape. Pure SVG, no library.
function CompletionRing({ completed, total }: { completed: number; total: number }) {
  const size = 64;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = total > 0 ? completed / total : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" role="img" aria-label={`${completed} of ${total} goal-linked Quests completed`}>
      {/* Inactive track: was hsl(var(--muted)) — 12% lightness against a
          2% background, under 2:1 contrast. Bumped to 20% white to clear
          WCAG's 3:1 minimum for non-text UI graphics (1.4.11). */}
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--foreground) / 0.2)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="47%" textAnchor="middle" className="fill-foreground text-[15px] font-semibold">{completed}</text>
      <text x="50%" y="66%" textAnchor="middle" className="fill-muted-foreground text-[9px]">of {total}</text>
    </svg>
  );
}

export function DirectionCard({ name, goalStats, streak }: DirectionCardProps) {
  return (
    <section className="rounded-2xl border border-border/80 bg-card/60 p-5 shadow-sm" aria-labelledby="direction-heading">
      <div className="flex items-start gap-3">
        <Compass className="mt-0.5 size-4 shrink-0 text-primary/80" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-label text-muted-foreground">Your direction</p>
          <h2 id="direction-heading" className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            Build a life you can direct with confidence.
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
            {name}, each deliberate action is evidence of the person you are becoming.
          </p>

          {goalStats && goalStats.linked > 0 && (
            <div className="mt-3.5 flex items-center gap-4 rounded-xl bg-muted/40 p-3">
              <CompletionRing completed={goalStats.completed} total={goalStats.linked} />
              <div>
                <p className="text-body-sm font-medium text-foreground">Quests completed</p>
                {Boolean(streak) && streak! > 0 && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-background/80 border border-border/60 px-2 py-0.5 text-xs font-medium text-foreground">
                    <Flame className="size-3.5 text-primary" aria-hidden="true" />
                    {streak} day streak
                  </span>
                )}
              </div>
            </div>
          )}
          {goalStats && goalStats.linked === 0 && (
            <p className="mt-2 text-body-sm text-muted-foreground">No Quests linked to this goal yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
