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
}

export function DirectionCard({ name, goalStats }: DirectionCardProps) {
  return (
    <section className="border-l-2 border-primary/25 pl-4" aria-labelledby="direction-heading">
      <div className="flex items-start gap-3">
        <Compass className="mt-0.5 size-4 shrink-0 text-primary/80" aria-hidden="true" />
        <div>
          <p className="text-label text-muted-foreground">Your direction</p>
          <h2 id="direction-heading" className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            Build a life you can direct with confidence.
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
            {name}, each deliberate action is evidence of the person you are becoming.
          </p>
          {goalStats && (
            <p className="mt-1.5 text-body-sm text-muted-foreground">
              {goalStats.linked === 0
                ? "No Quests linked to this goal yet."
                : `${goalStats.linked} Quest${goalStats.linked === 1 ? "" : "s"} linked to this goal, ${goalStats.completed} completed.`}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
