import { ArrowRight, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TIS_SPRINGS } from "@/lib/motion-tokens";
import type { Quest } from "@/types/quest";

interface RecoveryStateProps {
  onChooseQuest: () => void;
  // Founder Decision (Recovery/Guidance chunk): when present, this is the
  // account's most recently missed Quest — used only to differentiate
  // "you just missed something" from "you haven't started yet." Absent
  // (undefined) means the account has no failed Quest at all, which is
  // the genuine first-time/never-started case; the two must not read the
  // same on screen.
  lastMissedQuest?: Quest;
  // Recurring Quests already self-resume automatically on their next
  // eligible day (see nextOccurrencesToCreate) — offering a manual
  // recommit for one would be redundant and could create a duplicate,
  // out-of-cadence occurrence. The recommit action is therefore only
  // rendered when lastMissedQuest is one-shot (no seriesId); the caller
  // passes it through unconditionally and this component makes that
  // check, since it's the one place that decides what's shown.
  onRecommit?: (quest: Quest) => void;
}

export function RecoveryState({ onChooseQuest, lastMissedQuest, onRecommit }: RecoveryStateProps) {
  const canRecommit = Boolean(lastMissedQuest && !lastMissedQuest.seriesId && onRecommit);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.985 }}
      transition={TIS_SPRINGS.settle}
      className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 milled-slab"
      aria-labelledby="recovery-heading"
    >
      <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Deterministic Recovery</p>
      <h2 id="recovery-heading" className="mt-2 text-lg font-bold text-foreground">You can begin again from here.</h2>
      {lastMissedQuest ? (
        <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
          &ldquo;{lastMissedQuest.title}&rdquo; was unresolved. There is no penalty or attendance streak pressure — recommit to it now, or anchor today with one new action.
        </p>
      ) : (
        <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
          There is no need to catch up all at once. Choose one decisive action within your buffer margin, and momentum will follow.
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {canRecommit && (
          <Button
            variant="outline"
            className="min-h-10 rounded-lg text-xs font-semibold active:scale-[0.98]"
            onClick={() => onRecommit!(lastMissedQuest!)}
          >
            <RotateCcw className="size-3.5 mr-1.5" aria-hidden="true" /> Recommit to action
          </Button>
        )}
        <Button variant="ghost" className="min-h-10 px-2 text-xs font-semibold text-primary hover:bg-transparent hover:text-primary active:scale-[0.98]" onClick={onChooseQuest}>
          Choose new action <ArrowRight className="size-3.5 ml-1.5" aria-hidden="true" />
        </Button>
      </div>
    </motion.section>
  );
}
