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
      className="rounded-xl milled-slab p-5 sm:p-7 border border-emerald-500/25 bg-emerald-500/[0.03]"
      aria-labelledby="closure-heading"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="size-4" aria-hidden="true" />
        </span>
        <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Session complete</p>
      </div>

      <h2
        id="closure-heading"
        className="mt-3 text-2xl font-bold tracking-tight text-foreground"
      >
        You&apos;re done for today.
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 border border-border/70 px-3 py-1 text-xs font-mono text-foreground font-medium">
          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          {completedToday} {completedToday === 1 ? "commitment" : "commitments"} honored today
        </span>
      </div>

      <p className="mt-2.5 max-w-xl text-body-sm text-muted-foreground">
        Rest and recharge. Your velocity for today is locked into the trajectory model.
      </p>

      <div className="mt-6 pt-5 border-t border-border/50 flex justify-end">
        <Button
          variant="outline"
          className="min-h-10 rounded-lg px-4 text-xs font-semibold active:scale-[0.98]"
          onClick={onChooseQuest}
        >
          <span>Commit to another action</span>
          <ArrowRight className="size-3.5 ml-1.5" aria-hidden="true" />
        </Button>
      </div>
    </motion.section>
  );
}
