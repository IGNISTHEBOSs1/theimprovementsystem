import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { CheckSquare, Pause, Plus, Repeat, Sparkles, Target } from "lucide-react";
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
import { nextEligibleDayLabel, type CadencePreset } from "@/hooks/useDashboardData";
import { getServerLocalDate, toServerLocalDate, type ServerLocalDate } from "@/lib/serverTime";
import { soundEngine } from "@/hooks/useSoundEffects";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { type Quest, type QuestPriority, type QuestRole, getQuestRole } from "@/types/quest";
import { deriveGoalStats } from "@/lib/trajectory";

interface RecommitPrefill {
  title: string;
  priority: QuestPriority;
  linkedToGoal: boolean;
  role?: QuestRole;
}

export default function Quests() {
  const { profile } = useAuth();
  const {
    state,
    loading,
    error,
    saving,
    activeQuests,
    completedFocusToday,
    completeQuest,
    cancelQuest,
    commitToTodaysQuest,
    pauseSeries,
    reload,
  } = useDashboardDataContext();

  const [commitError, setCommitError] = useState(false);
  const [completeError, setCompleteError] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as { prefill?: RecommitPrefill; openNewCommitment?: boolean } | null;
  const [recommitPrefill, setRecommitPrefill] = useState<RecommitPrefill | undefined>(
    () => locationState?.prefill,
  );
  const [formTargetRole, setFormTargetRole] = useState<QuestRole | undefined>(recommitPrefill?.role);
  const [showCommitForm, setShowCommitForm] = useState(Boolean(recommitPrefill || locationState?.openNewCommitment));

  const focusQuest = activeQuests.find((q) => getQuestRole(q) === "focus");
  const routineQuests = activeQuests.filter((q) => getQuestRole(q) === "routine");
  const focusAvailable = !focusQuest && !completedFocusToday;
  const routineAvailable = routineQuests.length < 2;
  const canAddAny = focusAvailable || routineAvailable;

  // Dynamically respond to incoming navigation state
  useEffect(() => {
    const s = location.state as { prefill?: RecommitPrefill; openNewCommitment?: boolean } | null;
    if (s?.openNewCommitment || s?.prefill) {
      if (s.prefill) {
        setRecommitPrefill(s.prefill);
        setFormTargetRole(s.prefill.role);
      } else {
        setFormTargetRole(focusAvailable ? "focus" : "routine");
      }
      setShowCommitForm(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate, location.pathname, focusAvailable]);

  // Fast-path listener when user triggers commitment shortcut while already on /quests
  useEffect(() => {
    const handleOpenCommitment = () => {
      setFormTargetRole(focusAvailable ? "focus" : "routine");
      setShowCommitForm(true);
    };
    window.addEventListener("tis:open-commitment", handleOpenCommitment);
    return () => window.removeEventListener("tis:open-commitment", handleOpenCommitment);
  }, [focusAvailable]);

  const [serverLocal, setServerLocal] = useState<ServerLocalDate | null>(null);
  const goalStats = deriveGoalStats(state.quests, profile?.primary_goal);

  useEffect(() => {
    let cancelled = false;
    getServerLocalDate(profile?.timezone)
      .then((result) => {
        if (!cancelled) setServerLocal(result);
      })
      .catch(() => {
        // Degrades gracefully
      });
    return () => {
      cancelled = true;
    };
  }, [profile?.timezone]);

  const seriesMap = new Map<string, Quest[]>();
  for (const quest of state.quests) {
    if (!quest.seriesId) continue;
    const existing = seriesMap.get(quest.seriesId) ?? [];
    existing.push(quest);
    seriesMap.set(quest.seriesId, existing);
  }

  const upcoming = serverLocal
    ? Array.from(seriesMap.values())
        .map((occurrences) => occurrences.reduce((a, b) => (a.createdAt > b.createdAt ? a : b)))
        .filter(
          (mostRecent) =>
            (mostRecent.completed || mostRecent.failed) &&
            mostRecent.recurrenceDays &&
            mostRecent.recurrenceDays.length > 0 &&
            toServerLocalDate(new Date(mostRecent.createdAt), profile?.timezone || "UTC").dateStr !== serverLocal.dateStr,
        )
    : [];

  const handleCommit = async (
    commitment: string,
    linkedToGoal: boolean,
    cadence: CadencePreset,
    customDays: number[],
    priority: QuestPriority,
    role: QuestRole,
  ) => {
    setCommitError(false);
    setShowCommitForm(false);
    soundEngine.playConfirmation();
    const { error: commitErr } = await commitToTodaysQuest(
      commitment,
      linkedToGoal,
      cadence,
      customDays,
      priority,
      linkedToGoal ? profile?.primary_goal ?? undefined : undefined,
      role,
    );
    if (commitErr) {
      setCommitError(true);
      setShowCommitForm(true);
      soundEngine.playError();
      toast({
        title: "Could not create commitment",
        description: commitErr instanceof Error ? commitErr.message : "That didn't go through. Please try again.",
        variant: "destructive",
      });
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

  const handlePauseSeries = async (seriesId: string) => {
    soundEngine.playTap();
    const { error: pauseErr } = await pauseSeries(seriesId);
    if (pauseErr) {
      toast({
        title: "Could not pause routine",
        description: "Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Routine paused",
        description: "The recurring routine has been paused for this cycle.",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <PageHeader
        eyebrow="Daily Focus & Routines"
        title="Your quests."
        description="Commit to 1 primary focus and up to 2 supporting routines each day to protect your attention."
      />

      <div className="mt-8 space-y-7">
        {loading ? (
          <div className="space-y-3" aria-label="Loading quests">
            <div className="h-24 animate-pulse rounded-2xl bg-muted" />
            <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : error ? (
          <section className="rounded-2xl border border-border bg-card p-7" aria-label="Quests unavailable">
            <p className="text-label text-muted-foreground">Your quests</p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">We couldn't load your quests.</h2>
            <p className="mt-2 text-body-md text-muted-foreground">This is usually temporary. You can try again now.</p>
            <Button size="lg" className="mt-4" onClick={() => void reload()}>
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
                  initialRole={formTargetRole}
                  initialValues={recommitPrefill}
                  completedGoalQuests={goalStats.completed}
                  focusAvailable={focusAvailable}
                  routineAvailable={routineAvailable}
                />
                {commitError && (
                  <p className="mt-3 text-body-sm text-destructive" role="alert">
                    That didn't go through. You can try again.
                  </p>
                )}
              </div>
            )}

            {/* CAPACITY STRUCTURE HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 px-1 border-b border-border/60 pb-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-sans font-semibold text-muted-foreground">
                  Quest Capacity
                </span>
                {/* Structural capacity pill */}
                <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full border border-border/80 bg-muted/40 text-[11px] sm:text-xs font-mono">
                  <span className={cn("size-2 rounded-full", focusQuest ? "bg-primary" : completedFocusToday ? "bg-emerald-500" : "bg-muted-foreground/30")} />
                  <span className="font-medium text-foreground">
                    1 Focus: {focusQuest ? "Committed" : completedFocusToday ? "Completed" : "Open"}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">2 Routines: {routineQuests.length}/2</span>
                </div>
              </div>

              {!showCommitForm && canAddAny && (
                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs rounded-xl px-3 font-semibold"
                  onClick={() => {
                    setFormTargetRole(focusAvailable ? "focus" : "routine");
                    setShowCommitForm(true);
                  }}
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  <span>Add quest</span>
                </Button>
              )}
            </div>

            {/* ── BALANCED DESKTOP WORKSPACE (Active Quests + Upcoming Schedule) ── */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start space-y-6 lg:space-y-0">
              {/* Left Column: Today's Active Quests (Focus + Routines) */}
              <div className={cn("space-y-6", upcoming.length > 0 && serverLocal ? "lg:col-span-7" : "lg:col-span-12")}>
                {/* ── SECTION 1: PRIMARY FOCUS (THE DOMINANT SLOT) ── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" aria-hidden="true" />
                      <h2 className="text-xs font-sans font-semibold text-foreground">
                        Primary Focus (1 Slot)
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {focusQuest ? "1 of 1 committed" : completedFocusToday ? "1 of 1 completed" : "0 of 1 (Slot open)"}
                    </span>
                  </div>

                  {focusQuest ? (
                    <ul className="space-y-2.5">
                      <QuestCard
                        key={focusQuest.id}
                        quest={focusQuest}
                        completing={saving}
                        onComplete={handleComplete}
                        onCancel={handleCancel}
                        cancelling={cancelling}
                      />
                    </ul>
                  ) : completedFocusToday ? (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <CheckSquare className="size-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 text-left">
                          <span className="text-xs font-sans font-semibold text-emerald-500 block">
                            Primary Focus Completed
                          </span>
                          <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
                            {completedFocusToday.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Today&apos;s primary focus commitment is fulfilled.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 shrink-0">
                        ✓ Done for Today
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/[0.03] p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left transition-colors">
                      <div>
                        <span className="text-xs font-sans font-semibold text-primary">
                          Primary Focus Open
                        </span>
                        <p className="text-sm font-semibold text-foreground mt-0.5">
                          Your single most important action for today
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Center your day around one non-negotiable step toward your goal.
                        </p>
                      </div>
                      {!showCommitForm && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setFormTargetRole("focus");
                            setShowCommitForm(true);
                          }}
                          className="rounded-xl px-4 min-h-10 text-xs font-semibold shrink-0"
                        >
                          <Plus className="size-3.5 mr-1.5" />
                          Commit to Focus
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* ── SECTION 2: SUPPORTING ROUTINES (MAX 2 SLOTS) ── */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Repeat className="size-4 text-muted-foreground" aria-hidden="true" />
                      <h2 className="text-xs font-sans font-semibold text-foreground">
                        Supporting Routines (Max 2 Slots)
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {routineQuests.length} of 2 committed
                    </span>
                  </div>

                  {routineQuests.length > 0 ? (
                    <ul className="space-y-2.5">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {routineQuests.map((quest) => (
                          <QuestCard
                            key={quest.id}
                            quest={quest}
                            completing={saving}
                            onComplete={handleComplete}
                            onCancel={handleCancel}
                            cancelling={cancelling}
                            onPauseSeries={handlePauseSeries}
                          />
                        ))}
                      </AnimatePresence>
                    </ul>
                  ) : null}

                  {/* Open Routine Slot Prompt if < 2 routines */}
                  {routineQuests.length < 2 && (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                      <div>
                        <span className="text-xs font-sans text-muted-foreground font-medium">
                          Routine Slot ({routineQuests.length + 1} of 2) · Open
                        </span>
                        <p className="text-xs text-foreground font-medium mt-0.5">
                          Supporting daily habits or recurring practices
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Build steady progress with predictable daily practice.
                        </p>
                      </div>
                      {!showCommitForm && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFormTargetRole("routine");
                            setShowCommitForm(true);
                          }}
                          className="rounded-xl px-3 h-9 text-xs shrink-0"
                        >
                          <Plus className="size-3 mr-1" />
                          Add Routine
                        </Button>
                      )}
                    </div>
                  )}
                </div>

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
              </div>

              {/* Right Column: Scheduled Recurring Routines */}
              {upcoming.length > 0 && serverLocal && (
                <div className="lg:col-span-5 pt-2 lg:pt-0">
                  <div className="flex items-center justify-between px-1 mb-2.5">
                    <h3 className="text-xs font-sans font-semibold text-muted-foreground">
                      Scheduled Recurring Routines
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground">
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
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="size-6 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                                <Repeat className="size-3.5" aria-hidden="true" />
                              </div>
                              <span className="font-medium text-foreground line-clamp-2 break-words text-sm">
                                {quest.title}
                              </span>
                              {quest.linkedToGoal && quest.goalName && (
                                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground border border-border/50 truncate max-w-[170px]">
                                  <Target className="size-2.5 text-primary shrink-0" aria-hidden="true" />
                                  <span className="truncate">{quest.goalName}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0 text-muted-foreground">
                              <span className="font-mono text-xs bg-muted/40 px-2 py-0.5 rounded border border-border/40 text-foreground/80">
                                {dayLabel}
                              </span>
                              {quest.seriesId && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => void handlePauseSeries(quest.seriesId!)}
                                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                                  title="Pause routine"
                                >
                                  <Pause className="size-3" />
                                  <span className="hidden sm:inline">Pause</span>
                                </Button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
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
