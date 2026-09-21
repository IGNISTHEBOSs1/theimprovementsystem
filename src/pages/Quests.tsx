import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckSquare, Plus, Repeat, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { TodaysCommitment } from "@/components/quests/TodaysCommitment";
import { QuestCard } from "@/components/quests/QuestCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { nextEligibleDayLabel, MAX_ACTIVE_QUESTS, type CadencePreset } from "@/hooks/useDashboardData";
import { getServerLocalDate, toServerLocalDate, type ServerLocalDate } from "@/lib/serverTime";
import { cn } from "@/lib/utils";
import type { Quest, QuestPriority } from "@/types/quest";

interface RecommitPrefill {
  title: string;
  priority: QuestPriority;
  linkedToGoal: boolean;
}

export default function Quests() {
  const { profile } = useAuth();
  const { state, loading, error, saving, activeQuests, completeQuest, cancelQuest, commitToTodaysQuest, reload } = useDashboardDataContext();
  const [commitError, setCommitError] = useState(false);
  const [completeError, setCompleteError] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const [recommitPrefill] = useState<RecommitPrefill | undefined>(
    () => (location.state as { prefill?: RecommitPrefill } | null)?.prefill,
  );
  const [showCommitForm, setShowCommitForm] = useState(Boolean(recommitPrefill));

  useEffect(() => {
    if (recommitPrefill) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [serverLocal, setServerLocal] = useState<ServerLocalDate | null>(null);
  useEffect(() => {
    let cancelled = false;
    getServerLocalDate(profile?.timezone)
      .then((result) => {
        if (!cancelled) setServerLocal(result);
      })
      .catch(() => {
        // Degrades gracefully
      });
    return () => { cancelled = true; };
  }, [profile?.timezone]);

  const seriesMap = new Map<string, Quest[]>();
  for (const quest of state.quests) {
    if (!quest.seriesId) continue;
    const existing = seriesMap.get(quest.seriesId) ?? [];
    existing.push(quest);
    seriesMap.set(quest.seriesId, existing);
  }
  const upcoming = serverLocal ? Array.from(seriesMap.values())
    .map((occurrences) => occurrences.reduce((a, b) => (a.createdAt > b.createdAt ? a : b)))
    .filter((mostRecent) =>
      (mostRecent.completed || mostRecent.failed) &&
      mostRecent.recurrenceDays &&
      mostRecent.recurrenceDays.length > 0 &&
      toServerLocalDate(new Date(mostRecent.createdAt), profile?.timezone || "UTC").dateStr !== serverLocal.dateStr,
    ) : [];

  const handleCommit = async (commitment: string, linkedToGoal: boolean, cadence: CadencePreset, customDays: number[], priority: QuestPriority) => {
    setCommitError(false);
    const { error: commitErr } = await commitToTodaysQuest(
      commitment, linkedToGoal, cadence, customDays, priority,
      linkedToGoal ? profile?.primary_goal ?? undefined : undefined,
    );
    if (commitErr) {
      setCommitError(true);
    } else {
      setShowCommitForm(false);
    }
  };

  const handleComplete = async (questId: string) => {
    setCompleteError(false);
    const { error: completeErr } = await completeQuest(questId);
    if (completeErr) setCompleteError(true);
  };

  const handleCancel = (questId: string) => {
    setCancelTargetId(questId);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTargetId) return;
    const id = cancelTargetId;
    setCancelTargetId(null);
    setCancelError(false);
    setCancelling(true);
    const { error: cancelErr } = await cancelQuest(id);
    setCancelling(false);
    if (cancelErr) setCancelError(true);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Your commitments"
        title="Your commitments."
        description="What you're committed to right now, in one place."
      />

      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="space-y-3" aria-label="Loading quests">
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : error ? (
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
            {/* NEW COMMITMENT FORM (When toggled open) */}
            {showCommitForm && (
              <div>
                <TodaysCommitment
                  committing={saving}
                  onCommit={handleCommit}
                  onCancel={() => setShowCommitForm(false)}
                  goalLabel={profile?.primary_goal ?? undefined}
                  initialValues={recommitPrefill}
                />
                {commitError && (
                  <p className="mt-3 text-body-sm text-destructive" role="alert">
                    That didn't go through. You can try again.
                  </p>
                )}
              </div>
            )}

            {/* ACTIVE COMMITMENTS: UNIFIED RECEIPT LEDGER (Container Discipline + Edge Alignment) */}
            {activeQuests.length > 0 ? (
              <section
                className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden"
                aria-label="Active commitments ledger"
              >
                {/* Ledger Header: Hard-left Title & Capacity Meter, Hard-right Add CTA */}
                <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border/60 bg-muted/20">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Active Commitments
                    </h2>
                    {/* Visual Capacity Meter (Show, Don't Tell) */}
                    <div
                      className="flex items-center gap-1.5 ml-1"
                      title={`${activeQuests.length} of ${MAX_ACTIVE_QUESTS} slots committed`}
                      aria-label={`${activeQuests.length} of ${MAX_ACTIVE_QUESTS} slots committed`}
                    >
                      <div className="flex items-center gap-1">
                        {Array.from({ length: MAX_ACTIVE_QUESTS }).map((_, i) => (
                          <span
                            key={i}
                            className={cn(
                              "size-2 rounded-full transition-colors",
                              i < activeQuests.length ? "bg-primary" : "bg-muted-foreground/25"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {activeQuests.length}/{MAX_ACTIVE_QUESTS}
                      </span>
                    </div>
                  </div>

                  {/* Top Action pinned hard-right */}
                  {!showCommitForm && activeQuests.length < MAX_ACTIVE_QUESTS && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 text-xs text-primary hover:text-primary hover:bg-primary/10 rounded-lg px-2.5 font-medium"
                      onClick={() => setShowCommitForm(true)}
                    >
                      <Plus className="size-3.5" aria-hidden="true" />
                      <span>Add</span>
                    </Button>
                  )}
                </div>

                {/* Hairline Divided Rows */}
                <ul className="divide-y divide-border/60">
                  {activeQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      completing={saving}
                      onComplete={handleComplete}
                      onCancel={handleCancel}
                      cancelling={cancelling}
                    />
                  ))}
                </ul>
              </section>
            ) : !showCommitForm ? (
              /* Inviting Empty State when 0 quests */
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center flex flex-col items-center justify-center shadow-[var(--shadow-card)]">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4">
                  <CheckSquare className="size-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  No active commitments
                </h3>
                <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                  Focus comes from clarity. Commit to one meaningful action for today.
                </p>
                <Button
                  size="lg"
                  className="mt-6 min-h-11 rounded-full px-6 shadow-[0_4px_16px_hsl(var(--primary)/0.25)] hover:shadow-[0_4px_20px_hsl(var(--primary)/0.35)] active:scale-[0.98] transition-all"
                  onClick={() => setShowCommitForm(true)}
                >
                  <Plus className="size-4 mr-1.5" aria-hidden="true" />
                  Make a commitment
                </Button>
              </div>
            ) : null}

            {/* Error notifications */}
            {completeError && (
              <p className="text-body-sm text-destructive" role="alert">
                That didn't go through. You can try again.
              </p>
            )}
            {cancelError && (
              <p className="text-body-sm text-destructive" role="alert">
                That didn't go through. You can try again.
              </p>
            )}

            {/* UPCOMING SERIES: UNIFIED LEDGER CONTAINER */}
            {upcoming.length > 0 && serverLocal && (
              <div className="mt-8 pt-2">
                <div className="flex items-center justify-between px-1 mb-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Upcoming Series
                  </h3>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {upcoming.length} scheduled
                  </span>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card/70 shadow-xs overflow-hidden">
                  <ul className="divide-y divide-border/50">
                    {upcoming.map((quest) => {
                      const day = nextEligibleDayLabel(quest.recurrenceDays ?? [], serverLocal.weekday);
                      const dayLabel = day === "tomorrow" ? "Tomorrow" : day === "soon" ? "Soon" : `Next: ${day}`;

                      return (
                        <li
                          key={quest.seriesId}
                          className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-muted/20 transition-colors text-xs"
                        >
                          {/* Left Edge: Repeat Icon, Title, Goal */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="size-6 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                              <Repeat className="size-3.5" aria-hidden="true" />
                            </div>
                            <span className="font-medium text-foreground truncate text-sm">
                              {quest.title}
                            </span>
                            {quest.linkedToGoal && quest.goalName && (
                              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground border border-border/50 truncate max-w-[170px]">
                                <Target className="size-2.5 text-primary shrink-0" aria-hidden="true" />
                                <span className="truncate">{quest.goalName}</span>
                              </span>
                            )}
                          </div>

                          {/* Right Edge: Next Day & Priority */}
                          <div className="flex items-center gap-2.5 shrink-0 text-muted-foreground">
                            <span className="font-mono text-[11px] bg-muted/40 px-2 py-0.5 rounded border border-border/40 text-foreground/80">
                              {dayLabel}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground/70">
                              {quest.priority}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={Boolean(cancelTargetId)} onOpenChange={(open) => { if (!open) setCancelTargetId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel commitment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw this commitment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep commitment</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void handleConfirmCancel()}
            >
              Cancel commitment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
