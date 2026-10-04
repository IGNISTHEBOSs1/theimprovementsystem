import { ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <section className="rounded-2xl border border-border bg-muted/30 p-5 sm:p-6" aria-labelledby="recovery-heading">
      <p className="text-label text-muted-foreground">A clear return</p>
      <h2 id="recovery-heading" className="mt-2 text-lg font-semibold text-foreground">You can begin again from here.</h2>
      {lastMissedQuest ? (
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          "{lastMissedQuest.title}" didn't happen. There is no need to catch up all at once — pick it back up, or choose one new action that matters.
        </p>
      ) : (
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          There is no need to catch up all at once. Choose one action that matters, then let the next step reveal itself.
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {canRecommit && (
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => onRecommit!(lastMissedQuest!)}
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Commit to it again
          </Button>
        )}
        <Button variant="ghost" className="min-h-11 px-0 text-primary hover:bg-transparent hover:text-primary" onClick={onChooseQuest}>
          Choose one action <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
