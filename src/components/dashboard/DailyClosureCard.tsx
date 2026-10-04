import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyClosureCardProps {
  completedToday: number;
  currentStreak?: number;
  onChooseQuest: () => void;
}

export function DailyClosureCard({
  completedToday,
  onChooseQuest,
}: DailyClosureCardProps) {
  return (
    <section
      className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-5 sm:p-7 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_12px_36px_-4px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      aria-labelledby="closure-heading"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-white border border-white/20">
          <CheckCircle2 className="size-4" aria-hidden="true" />
        </span>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/20 bg-white/10 text-[10px] font-mono font-bold tracking-wider text-white uppercase">
          Session complete
        </div>
      </div>

      <h2
        id="closure-heading"
        className="mt-3 text-2xl font-bold tracking-tight text-foreground font-sans"
      >
        You&apos;re done for today.
      </h2>

      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        You completed your commitment. Your momentum is secure and your progress is logged.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#181B24] border border-[rgba(148,163,184,0.14)] px-3 py-1 text-xs font-mono tnum text-foreground font-medium">
          <CheckCircle2 className="size-3.5 text-white" aria-hidden="true" />
          {completedToday} {completedToday === 1 ? "commitment" : "commitments"} completed today
        </span>
      </div>

      <div className="mt-6 pt-5 border-t border-[rgba(148,163,184,0.12)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Rest and recharge, or choose an additional routine if you wish to continue.
        </p>
        <Button
          variant="outline"
          className="min-h-11 rounded-xl border border-[rgba(148,163,184,0.18)] bg-[#181B24] hover:bg-[#202430] text-foreground px-5 text-xs font-semibold self-start sm:self-auto active:scale-[0.98]"
          onClick={onChooseQuest}
        >
          <span>Choose another quest</span>
          <ArrowRight className="size-3.5 ml-1.5" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
