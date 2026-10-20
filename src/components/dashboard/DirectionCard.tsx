import { Compass } from "lucide-react";
import type { GoalStats } from "@/lib/trajectory";

interface DirectionCardProps {
  name: string;
  // Summary of what the current goal has actually gotten from the user so far
  goalStats?: GoalStats;
  bufferDaysRemaining?: number;
  elapsedDays?: number;
}

// Visual ring of completed anchors toward the 90-anchor 90-day horizon
function CompletionRing({ completed, total = 90 }: { completed: number; total?: number }) {
  const size = 64;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = total > 0 ? Math.min(1, completed / total) : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" role="img" aria-label={`${completed} of ${total} 90-day anchors completed`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--foreground) / 0.15)" strokeWidth={stroke} />
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
        className="transition-[stroke-dashoffset] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
      />
      <text x="50%" y="47%" textAnchor="middle" className="fill-foreground text-[15px] font-semibold font-mono">{completed}</text>
      <text x="50%" y="66%" textAnchor="middle" className="fill-muted-foreground text-[9px] font-mono">of {total}</text>
    </svg>
  );
}

export function DirectionCard({ name, goalStats, bufferDaysRemaining = 9, elapsedDays = 1 }: DirectionCardProps) {
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

          {goalStats && (
            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl bg-muted/40 p-3.5 border border-border/60">
              <CompletionRing completed={goalStats.completed} total={90} />
              <div className="space-y-1">
                <p className="text-body-sm font-semibold text-foreground">
                  {goalStats.completed} of 90 90-Day Anchors Honored
                </p>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-2.5 py-0.5 text-xs font-mono text-muted-foreground">
                  <span className="text-emerald-500">🛡</span>
                  <span>
                    <strong className="text-foreground">{bufferDaysRemaining}</strong>/9 Flex Days Intact • Day {elapsedDays} of 90
                  </span>
                </div>
              </div>
            </div>
          )}
          {!goalStats && (
            <p className="mt-2 text-body-sm text-muted-foreground">No North Star goal set yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
