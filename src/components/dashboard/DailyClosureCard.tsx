import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TIS_SPRINGS } from "@/lib/motion-tokens";

interface DailyClosureCardProps {
  completedToday: number;
  onChooseQuest: () => void;
}

export function DailyClosureCard({
  completedToday,
  onChooseQuest,
}: DailyClosureCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.985 }}
      transition={TIS_SPRINGS.settle}
      className="rounded-2xl glass-hero p-5 sm:p-7 shadow-[var(--shadow-card)]"
      aria-labelledby="closure-heading"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-success/10 text-success border border-success/20">
          <CheckCircle2 className="size-4" aria-hidden="true" />
        </span>
        <p className="text-label text-success">Session complete</p>
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
          <CheckCircle2 className="size-3.5 text-success" aria-hidden="true" />
          {completedToday} {completedToday === 1 ? "quest" : "quests"} completed today
        </span>
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
    </motion.section>
  );
}
