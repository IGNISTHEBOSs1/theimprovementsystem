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
    <section className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-5 sm:p-6 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_12px_32px_-4px_rgba(0,0,0,0.55)] backdrop-blur-xl" aria-labelledby="recovery-heading">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/20 bg-white/10 text-[10px] font-mono font-bold tracking-wider text-white uppercase">
        <span className="size-1.5 rounded-full bg-white" />
        <span>A clear return</span>
      </div>
      <h2 id="recovery-heading" className="mt-2.5 text-lg sm:text-xl font-bold tracking-tight text-foreground font-sans">
        You can begin again from here.
      </h2>
      {lastMissedQuest ? (
        <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
          "{lastMissedQuest.title}" didn't happen. There is no need to catch up all at once — pick it back up, or choose one new action that matters.
        </p>
      ) : (
        <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
          There is no need to catch up all at once. Choose one action that matters, then let the next step reveal itself.
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {canRecommit && (
          <Button
            variant="outline"
            className="min-h-11 rounded-xl border border-[rgba(148,163,184,0.18)] bg-[#181B24] hover:bg-[#202430] text-foreground text-xs font-semibold active:scale-[0.98]"
            onClick={() => onRecommit!(lastMissedQuest!)}
          >
            <RotateCcw className="size-3.5 mr-1.5 text-zinc-400" aria-hidden="true" /> Commit to it again
          </Button>
        )}
        <Button
          className="min-h-11 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold text-xs shadow-[0_0_14px_rgba(255,255,255,0.15)] active:scale-[0.98]"
          onClick={onChooseQuest}
        >
          Choose today&apos;s focus <ArrowRight className="size-3.5 ml-1.5" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
