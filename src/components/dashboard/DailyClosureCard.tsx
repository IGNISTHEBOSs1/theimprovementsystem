import { CheckCircle2, Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyClosureCardProps {
  completedToday: number;
  currentStreak?: number;
  onChooseQuest: () => void;
}

export function DailyClosureCard({
  completedToday,
  currentStreak = 0,
  onChooseQuest,
}: DailyClosureCardProps) {
  return (
    <section
      className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-[var(--shadow-card)]"
      aria-labelledby="closure-heading"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <CheckCircle2 className="size-4" aria-hidden="true" />
        </span>
        <p className="text-label text-emerald-600 dark:text-emerald-400">Session complete</p>
      </div>

      <h2
        id="closure-heading"
        className="mt-3 text-2xl font-semibold tracking-tight text-foreground"
      >
        You&apos;re done for today.
      </h2>

      <p className="mt-2 max-w-xl text-body-md text-muted-foreground">
        You completed your commitment. Your momentum is secure and your progress is logged.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 border border-border/70 px-3 py-1 text-xs font-mono text-foreground font-medium">
          <CheckCircle2 className="size-3.5 text-emerald-500" aria-hidden="true" />
          {completedToday} {completedToday === 1 ? "quest" : "quests"} completed today
        </span>

        {currentStreak > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-mono text-primary font-medium">
            <Flame className="size-3.5" aria-hidden="true" />
            {currentStreak} day streak
          </span>
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-body-xs text-muted-foreground">
          Rest and recharge, or choose an additional quest if you wish to continue.
        </p>
        <Button
          variant="outline"
          className="min-h-11 rounded-full px-5 text-xs font-medium self-start sm:self-auto"
          onClick={onChooseQuest}
        >
          <span>Choose another quest</span>
          <ArrowRight className="size-3.5 ml-1.5" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
