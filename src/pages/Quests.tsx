import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { TodaysCommitment } from "@/components/quests/TodaysCommitment";
import { QuestCard } from "@/components/quests/QuestCard";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import type { QuestPriority } from "@/types/quest";

export default function Quests() {
  const { profile } = useAuth();
  const { loading, error, saving, activeQuest, completeQuest, commitToTodaysQuest, reload } = useDashboardDataContext();
  const [commitError, setCommitError] = useState(false);
  const [completeError, setCompleteError] = useState(false);

  const handleCommit = async (commitment: string, linkedToGoal: boolean, recurrenceDays?: number[], priority?: QuestPriority) => {
    setCommitError(false);
    const { error: commitErr } = await commitToTodaysQuest(commitment, linkedToGoal, recurrenceDays, priority);
    if (commitErr) setCommitError(true);
  };

  const handleComplete = async (questId: string) => {
    setCompleteError(false);
    const { error: completeErr } = await completeQuest(questId);
    if (completeErr) setCompleteError(true);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Your quests"
        title="All active quests."
        description="Every quest available to you right now, in one place."
      />

      <div className="mt-8">
        {loading ? (
          <div className="space-y-3" aria-label="Loading quests">
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : error ? (
          // A failed load must never be treated as "no quests yet" — that
          // would risk the commitment form appearing on top of quests that
          // actually exist but couldn't be read, and a subsequent commit
          // overwriting them once the read eventually succeeds.
          <section
            className="rounded-2xl border border-border bg-card p-7"
            aria-label="Quests unavailable"
          >
            <p className="text-label text-muted-foreground">Your quests</p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">
              We couldn't load your quests.
            </h2>
            <p className="mt-2 text-body-md text-muted-foreground">
              This is usually temporary. You can try again now.
            </p>
            <Button variant="neon" size="lg" className="mt-4" onClick={() => void reload()}>
              Try again
            </Button>
          </section>
        ) : (
          <>
            {/* P0 Decision B — one active Quest at a time. Committing is
                only offered when none is currently active; completion or
                expiry clears it, and this reappears. The goal checkbox
                only appears if a primary goal is actually set. */}
            {!activeQuest && (
              <>
                <TodaysCommitment
                  committing={saving}
                  onCommit={handleCommit}
                  goalLabel={profile?.primary_goal ?? undefined}
                />
                {commitError && (
                  <p className="mt-3 text-body-sm text-muted-foreground" role="alert">
                    That didn't go through. You can try again.
                  </p>
                )}
              </>
            )}

            {activeQuest && (
              <div className="mt-6">
                <ul className="space-y-3">
                  <QuestCard
                    key={activeQuest.id}
                    quest={activeQuest}
                    completing={saving}
                    onComplete={handleComplete}
                  />
                </ul>
                {completeError && (
                  <p className="mt-3 text-body-sm text-muted-foreground" role="alert">
                    That didn't go through. You can try again.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
