import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { TodaysCommitment } from "@/components/quests/TodaysCommitment";
import { QuestCard } from "@/components/quests/QuestCard";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { nextEligibleDayLabel } from "@/hooks/useDashboardData";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";
import type { Quest, QuestPriority } from "@/types/quest";

export default function Quests() {
  const { profile } = useAuth();
  const { state, loading, error, saving, activeQuest, completeQuest, commitToTodaysQuest, reload } = useDashboardDataContext();
  const [commitError, setCommitError] = useState(false);
  const [completeError, setCompleteError] = useState(false);

  // Upcoming: recurring series whose most recent occurrence has already
  // resolved (completed or failed) and hasn't been re-created for today
  // yet — i.e. it's waiting for its next eligible day. This reads only
  // data that already exists (seriesId, recurrenceDays, createdAt); it
  // does not introduce a backlog of committable-but-inactive Quests, and
  // it never creates or activates anything itself — that stays entirely
  // in useDashboardData's load() sweep. Deliberately secondary: smaller,
  // muted, and rendered after the active Quest section, never before it.
  const todayStr = new Date().toISOString().split("T")[0];
  const seriesMap = new Map<string, Quest[]>();
  for (const quest of state.quests) {
    if (!quest.seriesId) continue;
    const existing = seriesMap.get(quest.seriesId) ?? [];
    existing.push(quest);
    seriesMap.set(quest.seriesId, existing);
  }
  const upcoming = Array.from(seriesMap.values())
    .map((occurrences) => occurrences.reduce((a, b) => (a.createdAt > b.createdAt ? a : b)))
    .filter((mostRecent) =>
      (mostRecent.completed || mostRecent.failed) &&
      mostRecent.recurrenceDays &&
      mostRecent.recurrenceDays.length > 0 &&
      mostRecent.createdAt.split("T")[0] !== todayStr,
    );

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

            {upcoming.length > 0 && (
              <div className="mt-10">
                <p className="text-label text-muted-foreground">Upcoming</p>
                <ul className="mt-3 space-y-2">
                  {upcoming.map((quest) => (
                    <li
                      key={quest.seriesId}
                      className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-body-sm"
                    >
                      <Badge variant="outline" className={PRIORITY_BADGE_CLASSES[quest.priority]}>
                        {quest.priority}
                      </Badge>
                      <span className="text-foreground">{quest.title}</span>
                      <span className="text-muted-foreground">
                        — resumes {nextEligibleDayLabel(quest.recurrenceDays ?? [], new Date())}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
