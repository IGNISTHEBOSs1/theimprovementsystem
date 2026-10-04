import { Compass } from "lucide-react";
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
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="47%" textAnchor="middle" className="fill-foreground text-[15px] font-bold tnum font-sans">{completed}</text>
      <text x="50%" y="66%" textAnchor="middle" className="fill-muted-foreground text-[9px] font-mono tnum">of {total}</text>
    </svg>
  );
}

export function DirectionCard({ name, goalStats }: DirectionCardProps) {
  return (
    <section className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-5 sm:p-6 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_12px_32px_-4px_rgba(0,0,0,0.55)] backdrop-blur-xl" aria-labelledby="direction-heading">
      <div className="flex items-start gap-3.5">
        <div className="size-9 rounded-xl border border-[rgba(148,163,184,0.14)] bg-[#181B24] flex items-center justify-center text-white shrink-0 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)]">
          <Compass className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Your direction</p>
          <h2 id="direction-heading" className="mt-1 text-lg font-bold tracking-tight text-foreground font-sans">
            Build a life you can direct with confidence.
          </h2>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {name}, each deliberate action is evidence of the person you are becoming.
          </p>

          {goalStats && goalStats.linked > 0 && (
            <div className="mt-3.5 flex items-center gap-4 rounded-xl border border-[rgba(148,163,184,0.12)] bg-[#181B24] p-3 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.06)]">
              <CompletionRing completed={goalStats.completed} total={goalStats.linked} />
              <div>
                <p className="text-sm font-semibold text-foreground font-sans">Quests completed</p>
                <p className="text-xs font-mono text-white tnum mt-0.5">
                  {Math.round((goalStats.completed / goalStats.linked) * 100)}% trajectory progress
                </p>
              </div>
            </div>
          )}
          {goalStats && goalStats.linked === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">No Quests linked to this goal yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
