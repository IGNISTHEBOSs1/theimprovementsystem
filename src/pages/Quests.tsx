import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { CheckSquare, Plus, Repeat, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { TodaysCommitment } from "@/components/quests/TodaysCommitment";
import { QuestCard } from "@/components/quests/QuestCard";
import { CapacityMeter } from "@/components/quests/CapacityMeter";
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
import { soundEngine } from "@/hooks/useSoundEffects";
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
      soundEngine.playError();
    } else {
      soundEngine.playConfirmation();
      setShowCommitForm(false);
    }
  };

  const handleComplete = async (questId: string) => {
    setCompleteError(false);
    const { error: completeErr } = await completeQuest(questId);
    if (completeErr) {
      setCompleteError(true);
      soundEngine.playError();
    }
  };

  const handleCancel = (questId: string) => {
    soundEngine.playTap();
    setCancelTargetId(questId);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTargetId) return;
    const id = cancelTargetId;
    setCancelTargetId(null);
    setCancelError(false);
    setCancelling(true);
    soundEngine.playTap();
    const { error: cancelErr } = await cancelQuest(id);
    setCancelling(false);
    if (cancelErr) {
      setCancelError(true);
      soundEngine.playError();
    }
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
            <div className="h-20 animate-pulse rounded-2xl bg-[#12141A] border border-[rgba(148,163,184,0.14)]" />
            <div className="h-20 animate-pulse rounded-2xl bg-[#12141A] border border-[rgba(148,163,184,0.14)]" />
            <div className="h-20 animate-pulse rounded-2xl bg-[#12141A] border border-[rgba(148,163,184,0.14)]" />
          </div>
        ) : error ? (
          <section
            className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-7 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12),0_12px_32px_-4px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            aria-label="Quests unavailable"
          >
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400">Your quests</p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">
              We couldn't load your quests.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This is usually temporary. You can try again now.
            </p>
            <Button size="lg" className="mt-4 rounded-xl px-6 bg-white text-black hover:bg-zinc-200 font-bold active:scale-[0.98] transition-all shadow-[0_0_16px_rgba(255,255,255,0.15)]" onClick={() => void reload()}>
              Try again
            </Button>
          </section>
        ) : (
          <>
            {/* CAPACITY STATUS METER (Google Stitch Obsidian Kinetic Spec) */}
            <CapacityMeter
              committedCount={activeQuests.length}
              maxSlots={MAX_ACTIVE_QUESTS}
              onAddPressed={!showCommitForm && activeQuests.length < MAX_ACTIVE_QUESTS ? () => setShowCommitForm(true) : undefined}
            />

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

            {/* ACTIVE COMMITMENTS: GROUPED BY 1 PRIMARY FOCUS + 2 COMPANION ROUTINES */}
            {activeQuests.length > 0 ? (
              <div className="space-y-6">
                {/* Ledger Header & Capacity Summary */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      Today&apos;s Ledger
                    </h2>
                  </div>

                  {!showCommitForm && (
                    activeQuests.length < MAX_ACTIVE_QUESTS ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1.5 text-xs text-white hover:text-zinc-300 hover:bg-[#181B24] rounded-xl px-3 font-semibold transition-all active:scale-[0.98]"
                        onClick={() => setShowCommitForm(true)}
                        title={`${MAX_ACTIVE_QUESTS - activeQuests.length} slot${MAX_ACTIVE_QUESTS - activeQuests.length > 1 ? "s" : ""} available`}
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                        <span>Add ({MAX_ACTIVE_QUESTS - activeQuests.length} open)</span>
                      </Button>
                    ) : (
                      <span className="text-[11px] font-mono text-muted-foreground bg-[#181B24] px-2.5 py-0.5 rounded-full border border-[rgba(148,163,184,0.14)] tnum">
                        Focus cap (3/3)
                      </span>
                    )
                  )}
                </div>

                {/* Priority Clusters */}
                {(
                  [
                    {
                      label: "Primary Focus (Core Anchor)",
                      caption: "Essential Slot 1",
                      quests: activeQuests.filter((q) => q.priority === "Essential"),
                    },
                    {
                      label: "Companion Routines (High Leverage)",
                      caption: "Important Slot 2",
                      quests: activeQuests.filter((q) => q.priority === "Important"),
                    },
                    {
                      label: "Tactical / Maintenance",
                      caption: "Slot 3",
                      quests: activeQuests.filter((q) => q.priority === "Optional"),
                    },
                  ] as const
                )
                  .filter((group) => group.quests.length > 0)
                  .map((group) => (
                    <section key={group.label} className="space-y-2.5" aria-label={group.label}>
                      <div className="flex items-center justify-between px-1 text-xs">
                        <span className="font-mono font-bold uppercase tracking-wider text-muted-foreground text-[11px]">
                          {group.label}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground/75 tnum">
                          {group.quests.length} active
                        </span>
                      </div>

                      <ul className="space-y-3">
                        <AnimatePresence mode="popLayout" initial={false}>
                          {group.quests.map((quest) => (
                            <QuestCard
                              key={quest.id}
                              quest={quest}
                              completing={saving}
                              onComplete={handleComplete}
                              onCancel={handleCancel}
                              cancelling={cancelling}
                            />
                          ))}
                        </AnimatePresence>
                      </ul>
                    </section>
                  ))}
              </div>
            ) : !showCommitForm ? (
              /* Inviting Empty State when 0 quests */
              <div className="rounded-2xl sm:rounded-3xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-6 sm:p-10 text-center flex flex-col items-center justify-center shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_12px_32px_-4px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                <div className="size-14 rounded-2xl bg-[#181B24] text-white border border-[rgba(148,163,184,0.14)] flex items-center justify-center mb-4 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)]">
                  <CheckSquare className="size-7" aria-hidden="true" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground font-sans">
                  No active commitments
                </h3>
                <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                  Focus comes from quiet mathematical clarity. Commit to 1 Primary Focus + 2 Companion Routines for today.
                </p>
                <Button
                  size="lg"
                  className="mt-6 min-h-11 rounded-xl px-6 bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.4)] active:scale-[0.98] transition-all"
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

                <div className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.4)] overflow-hidden">
                  <ul className="divide-y divide-[rgba(148,163,184,0.1)]">
                    {upcoming.map((quest) => {
                      const day = nextEligibleDayLabel(quest.recurrenceDays ?? [], serverLocal.weekday);
                      const dayLabel = day === "tomorrow" ? "Tomorrow" : day === "soon" ? "Soon" : `Next: ${day}`;

                      return (
                        <li
                          key={quest.seriesId}
                          className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-white/[0.02] transition-colors text-xs"
                        >
                          {/* Left Edge: Repeat Icon, Title, Goal */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="size-6 rounded-md bg-white/10 text-white border border-white/20 flex items-center justify-center shrink-0">
                              <Repeat className="size-3.5" aria-hidden="true" />
                            </div>
                            <span className="font-medium text-foreground truncate text-sm">
                              {quest.title}
                            </span>
                            {quest.linkedToGoal && quest.goalName && (
                              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#181B24] px-2 py-0.5 text-[11px] text-muted-foreground border border-[rgba(148,163,184,0.12)] truncate max-w-[170px]">
                                <Target className="size-2.5 text-zinc-400 shrink-0" aria-hidden="true" />
                                <span className="truncate">{quest.goalName}</span>
                              </span>
                            )}
                          </div>

                          {/* Right Edge: Next Day & Priority */}
                          <div className="flex items-center gap-2.5 shrink-0 text-muted-foreground">
                            <span className="font-mono text-[11px] bg-[#181B24] px-2 py-0.5 rounded border border-[rgba(148,163,184,0.14)] text-foreground/80 tnum">
                              {dayLabel}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground/70 uppercase">
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
        <AlertDialogContent className="rounded-[28px] bg-[#12141A] border border-[rgba(148,163,184,0.16)] text-foreground specular-top shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg font-bold text-foreground">Cancel commitment?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to withdraw this commitment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-3 mt-4">
            <AlertDialogCancel className="min-h-11 rounded-[16px] border-white/10 bg-[#181B24] hover:bg-white/5 text-xs sm:text-sm text-foreground active:scale-[0.98]">
              Keep commitment
            </AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11 rounded-[16px] bg-rose-600 text-white hover:bg-rose-500 text-xs sm:text-sm active:scale-[0.98]"
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
