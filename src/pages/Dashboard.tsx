import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, CheckCircle2, ChevronRight, Loader2, Sparkles, Target } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FirstLaunchState } from "@/components/dashboard/FirstLaunchState";
import { AppTour } from "@/components/onboarding/AppTour";
import { PrimaryActionPanel } from "@/components/dashboard/PrimaryActionPanel";
import { RecoveryState } from "@/components/dashboard/RecoveryState";
import { DailyClosureCard } from "@/components/dashboard/DailyClosureCard";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { isQuestResolvedToday } from "@/hooks/useDashboardData";
import {
  deriveFollowThroughStats,
  deriveFollowThroughRate,
  deriveGoalPace,
  deriveGoalStats,
  deriveWeeklyCadence,
} from "@/lib/trajectory";
import { deriveInsights } from "@/lib/insights";
import { triggerHaptic } from "@/lib/haptics";
import { soundEngine } from "@/hooks/useSoundEffects";
import { TIS_SPRINGS, TIS_EASINGS } from "@/lib/motion-tokens";
import { type Quest, getQuestRole } from "@/types/quest";

interface SecondaryQuestItemProps {
  quest: Quest;
  completing: boolean;
  onComplete: (questId: string) => void;
}

function SecondaryQuestItem({ quest, completing, onComplete }: SecondaryQuestItemProps) {
  const [completionStage, setCompletionStage] = useState<"idle" | "complete">("idle");
  const shouldReduceMotion = useReducedMotion();
  const isCompleted = completionStage !== "idle";

  const handleMarkComplete = () => {
    if (completing || completionStage !== "idle") return;
    triggerHaptic("success");
    soundEngine.playSuccess();
    if (shouldReduceMotion) {
      onComplete(quest.id);
      return;
    }
    setCompletionStage("complete");
    setTimeout(() => {
      onComplete(quest.id);
    }, 280);
  };

  return (
    <motion.li
      layout
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={
        completionStage === "complete" && !shouldReduceMotion
          ? {
              scale: 0.94,
              x: 280,
              opacity: 0,
              filter: "blur(4px)",
              transition: {
                duration: 0.28,
                ease: TIS_EASINGS.exitDecel,
              },
            }
          : { scale: 1, x: 0, opacity: 1, y: 0, filter: "blur(0px)" }
      }
      exit={
        shouldReduceMotion
          ? { opacity: 0 }
          : {
              scale: 0.94,
              x: 280,
              opacity: 0,
              filter: "blur(4px)",
              transition: { duration: 0.28, ease: TIS_EASINGS.exitDecel },
            }
      }
      transition={{
        layout: TIS_SPRINGS.settle,
      }}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 rounded-xl border border-border/80 bg-card px-3.5 sm:px-4 py-3 sm:py-3.5 text-body-sm transition-all duration-200 overflow-hidden milled-slab",
        completionStage !== "idle" && "bg-emerald-500/[0.08] border-emerald-500/40",
      )}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        {/* Expanded touch target wrapping conforming to Fitts's Law (min 44x44px hit-box) */}
        <div className="relative -m-2.5 p-2.5 touch-target flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={handleMarkComplete}
            disabled={completing || isCompleted}
            aria-label={`Mark "${quest.title}" as complete`}
            className={cn(
              "size-6 shrink-0 rounded-md border transition-all duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90 cursor-pointer shadow-xs",
              isCompleted
                ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 scale-105"
                : "border-border/80 bg-background/90 text-transparent hover:border-emerald-500/80 hover:text-emerald-500/30",
            )}
          >
            {completing && !isCompleted ? (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden="true" />
            ) : isCompleted ? (
              <Check className="size-3.5 stroke-[3] animate-in zoom-in-75 duration-200" aria-hidden="true" />
            ) : (
              <Check className="size-3.5 stroke-[2]" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border border-border/70 bg-muted/40 text-muted-foreground shrink-0 uppercase tracking-wider">
              Routine
            </span>
            {quest.linkedToGoal && quest.goalName && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground border border-border/40 bg-muted/20 px-2 py-0.5 rounded-md truncate max-w-[160px]">
                <Target className="size-2.5 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">{quest.goalName}</span>
              </span>
            )}
          </div>
          <p className={cn("text-foreground font-medium break-words leading-snug text-xs sm:text-sm", isCompleted && "line-through text-muted-foreground")}>
            {quest.title}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end shrink-0 pl-11 sm:pl-0">
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "min-h-9 px-3 hover:bg-muted/70 text-xs font-medium transition-colors rounded-md active:scale-[0.98]",
            isCompleted ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground hover:text-foreground",
          )}
          disabled={completing || isCompleted}
          onClick={handleMarkComplete}
        >
          {isCompleted ? "Done" : "Complete"}
        </Button>
      </div>
    </motion.li>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, profileLoading, profileError, fetchProfile } = useAuth();
  const {
    state,
    loading,
    error,
    saving,
    activeQuests,
    primaryFocusQuest,
    completedFocusToday,
    routineQuests,
    lastMissedQuest,
    completeQuest,
    reload,
    todayStr,
  } = useDashboardDataContext();

  const name = profile?.username || "there";
  const [completeError, setCompleteError] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const chooseQuest = () => {
    soundEngine.playTap();
    navigate("/quests");
  };

  const handleRecommit = (quest: Quest) => {
    soundEngine.playTap();
    navigate("/quests", {
      state: {
        prefill: {
          title: quest.title,
          priority: quest.priority,
          linkedToGoal: Boolean(quest.linkedToGoal),
          role: getQuestRole(quest),
        },
      },
    });
  };

  const handleComplete = async (questId: string) => {
    setCompleteError(false);
    const { error: completeErr } = await completeQuest(questId);
    if (completeErr) setCompleteError(true);
  };

  if (profileLoading) {
    return (
      <div className="w-full px-3 sm:px-6 lg:px-8 pt-2 pb-2 sm:py-6">
        <section className="milled-slab rounded-2xl border border-border/70 bg-card p-7 shadow-xs" aria-label="Loading">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-7 w-3/5 animate-pulse rounded bg-muted" />
        </section>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="w-full px-3 sm:px-6 lg:px-8 pt-2 pb-2 sm:py-6">
        <section
          className="milled-slab rounded-2xl border border-border/70 bg-card p-7 shadow-xs"
          aria-label="Profile unavailable"
        >
          <p className="text-label text-muted-foreground">Your system</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">
            We couldn't load your profile.
          </h2>
          <p className="mt-2 text-body-md text-muted-foreground">
            This is usually temporary. You can try again now.
          </p>
          <Button
            size="lg"
            className="mt-4 rounded-xl min-h-11 active:scale-[0.98]"
            onClick={() => user && void fetchProfile(user.id)}
          >
            Try again
          </Button>
        </section>
      </div>
    );
  }

  if (!profile.has_completed_first_launch) {
    return <FirstLaunchState name={name} />;
  }

  if (error) {
    return (
      <div className="w-full px-3 sm:px-6 lg:px-8 pt-2 pb-2 sm:py-6">
        <section
          className="milled-slab rounded-2xl border border-border/70 bg-card p-7 shadow-xs"
          aria-label="Progress unavailable"
        >
          <p className="text-label text-muted-foreground">Your system</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">
            We couldn't load your progress.
          </h2>
          <p className="mt-2 text-body-md text-muted-foreground">
            This is usually temporary. You can try again now.
          </p>
          <Button size="lg" className="mt-4" onClick={() => void reload()}>
            Try again
          </Button>
        </section>
      </div>
    );
  }

  const safeQuests = Array.isArray(state?.quests) ? state.quests.filter(Boolean) : [];

  let guidance: ReturnType<typeof deriveGuidance> = [];
  try {
    guidance = deriveGuidance(safeQuests, profile?.timezone || "UTC");
  } catch (e) {
    console.warn("deriveGuidance error:", e);
  }

  let insights: ReturnType<typeof deriveInsights> = [];
  try {
    insights = deriveInsights(safeQuests);
  } catch (e) {
    console.warn("deriveInsights error:", e);
  }

  let weeklyCadence: ReturnType<typeof deriveWeeklyCadence> = [];
  try {
    weeklyCadence = todayStr ? deriveWeeklyCadence(safeQuests, todayStr, profile?.timezone || "UTC") : [];
  } catch (e) {
    console.warn("deriveWeeklyCadence error:", e);
  }

  const todayDateFormatted = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const completedToday = safeQuests.filter((q) =>
    todayStr ? isQuestResolvedToday(q, todayStr, profile?.timezone || "UTC") : q.completed
  ).length;

  const followThrough = deriveFollowThroughStats(safeQuests);
  const goalStats = deriveGoalStats(safeQuests, profile?.primary_goal);
  const pace = deriveGoalPace(safeQuests, profile?.primary_goal_target_date, undefined, profile?.primary_goal);
  const completionRate = deriveFollowThroughRate(safeQuests);

  const primaryGoal = profile?.primary_goal;
  const elapsedDays = pace?.elapsedDays ?? 1;
  const bufferDaysRemaining = pace?.bufferDaysRemaining ?? 9;
  const daysRemaining = pace?.daysRemaining ?? (profile?.primary_goal_target_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(
            profile.primary_goal_target_date.includes("T")
              ? profile.primary_goal_target_date
              : `${profile.primary_goal_target_date}T23:59:59`
          ).getTime() -
            Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null);

  const activeFocus = primaryFocusQuest;
  const activeRoutines = routineQuests;
  const topMentorSignal = insights[0]?.observation || guidance[0]?.text;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full px-3 sm:px-6 lg:px-8 pt-2 pb-2 sm:py-6"
    >
      <AppTour />

      {/* ── 1. GREETING & LOCATION (Attention Level: Context) ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {greeting}, {name}.
          </h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono mt-1">
            <span>{todayDateFormatted}</span>
            <span className="text-muted-foreground/40" aria-hidden="true">·</span>
            <span>Day {elapsedDays} of 90</span>
          </p>
        </div>

        {/* Quiet Commitment Capacity Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-card text-xs font-mono font-medium text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <span
              className={cn(
                "size-2 rounded-full shrink-0",
                activeFocus ? "bg-primary" : completedFocusToday ? "bg-emerald-500" : "bg-muted-foreground/30",
              )}
              aria-hidden="true"
            />
            <span>
              {activeFocus ? "1 Focus" : completedFocusToday ? "1 Focus (Done)" : "0 Focus"}
            </span>
            <span className="text-muted-foreground/50">·</span>
            <span className="text-muted-foreground">{activeRoutines.length}/5 Routines</span>
          </div>
        </div>
      </header>

      {/* ── 2. CONNECTED DAILY WORKSPACE (Workflow: Actions on Left / Context & Guidance on Right) ── */}
      <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start space-y-6 lg:space-y-0">
        {/* Left Column: Today's Actions (Primary Focus + Supporting Routines) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Focus Slot */}
          {loading ? (
            <section className="rounded-xl border border-border/80 bg-card p-6 milled-slab" aria-label="Loading today’s focus">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-7 w-3/5 animate-pulse rounded bg-muted" />
            </section>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              {activeFocus ? (
                <motion.div
                  key={activeFocus.id}
                  initial={{ opacity: 0, y: 8, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.985 }}
                  transition={TIS_SPRINGS.settle}
                >
                  <PrimaryActionPanel
                    quest={activeFocus}
                    completing={saving}
                    onComplete={() => void handleComplete(activeFocus.id)}
                    onChooseQuest={chooseQuest}
                    completedGoalQuests={goalStats.completed}
                  />
                  {completeError && (
                    <p className="mt-3 text-body-sm text-destructive" role="alert">
                      That didn't go through. You can try again.
                    </p>
                  )}
                </motion.div>
              ) : completedFocusToday ? (
                <motion.div
                  key="focus-completed-card"
                  initial={{ opacity: 0, y: 8, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.985 }}
                  transition={TIS_SPRINGS.settle}
                  className="rounded-xl milled-slab p-5 sm:p-7 border border-emerald-500/30 bg-emerald-500/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                    </span>
                    <p className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Primary Focus Locked
                    </p>
                  </div>
                  <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {completedFocusToday.title}
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
                    Today&apos;s non-negotiable anchor is complete. Proceed with your supporting routines below or conclude your session.
                  </p>
                </motion.div>
              ) : activeRoutines.length > 0 ? (
                <motion.div
                  key="focus-slot-open-card"
                  initial={{ opacity: 0, y: 8, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.985 }}
                  transition={TIS_SPRINGS.settle}
                  className="rounded-xl border border-dashed border-primary/30 bg-primary/[0.02] p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                      Primary Focus Open
                    </span>
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground mt-0.5">
                      Anchor today with one decisive commitment
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-lg">
                      Your routines are active below. Set your primary milestone to establish deterministic forward momentum.
                    </p>
                  </div>
                  <Button
                    onClick={chooseQuest}
                    className="rounded-lg px-5 min-h-10 text-xs font-semibold shrink-0 active:scale-[0.98]"
                  >
                    Commit to Focus
                    <ChevronRight className="size-3.5 ml-1" />
                  </Button>
                </motion.div>
              ) : completedToday > 0 ? (
                <DailyClosureCard
                  key="daily-closure"
                  completedToday={completedToday}
                  onChooseQuest={chooseQuest}
                />
              ) : (
                <RecoveryState
                  key="recovery-state"
                  onChooseQuest={chooseQuest}
                  lastMissedQuest={lastMissedQuest}
                  onRecommit={handleRecommit}
                />
              )}
            </AnimatePresence>
          )}

          {/* Supporting Routines (Directly following today's primary focus) */}
          <section aria-labelledby="supporting-routines-heading" className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h2 id="supporting-routines-heading" className="text-xs font-sans font-semibold text-muted-foreground">
                  Supporting Routines ({activeRoutines.length} of 5)
                </h2>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">· Tap to complete</span>
              </div>
              <Link to="/quests" className="text-xs font-medium text-primary hover:underline">
                Manage routines →
              </Link>
            </div>

            {activeRoutines.length > 0 ? (
              <ul className="space-y-2.5">
                <AnimatePresence mode="popLayout" initial={false}>
                  {activeRoutines.map((routine) => (
                    <SecondaryQuestItem
                      key={routine.id}
                      quest={routine}
                      completing={saving}
                      onComplete={handleComplete}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            ) : activeFocus ? (
              <div className="rounded-xl border border-border/70 bg-card/60 p-4 flex items-center justify-between gap-3 text-xs shadow-xs milled-slab">
                <div>
                  <p className="font-medium text-foreground">No supporting routines active today</p>
                  <p className="text-muted-foreground mt-0.5">Add regular routines to reinforce daily habits alongside your focus.</p>
                </div>
                <Link to="/quests" className="text-primary font-semibold hover:underline shrink-0">
                  Add routine →
                </Link>
              </div>
            ) : null}
          </section>
        </div>

        {/* Right Column: Telemetry Console & Epistemic Guidance */}
        <div className="lg:col-span-5 space-y-4">
          {/* Integrated Telemetry Plinth (De-carded precision instrument) */}
          <aside
            aria-label="System Telemetry Console"
            className="milled-slab rounded-xl overflow-hidden divide-y divide-border/60"
          >
            {/* Header: Console Banner */}
            <div className="px-4 py-2.5 bg-muted/25 flex items-center justify-between border-b border-border/40">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                Telemetry Console
              </span>
              <span className="text-[10px] font-mono text-muted-foreground/80 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                Live Status
              </span>
            </div>

            {/* Metric 1: Follow-Through Rate */}
            <div className="p-4 sm:p-5 space-y-1.5 transition-colors hover:bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Follow-Through Rate</span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {completionRate !== null ? `${completionRate}%` : "—"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                {completionRate !== null
                  ? `${followThrough.completed} of ${followThrough.total} commitments honored`
                  : "No resolved commitments yet"}
              </p>
              {completionRate !== null && (
                <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden border border-border/40 mt-2">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-smooth"
                    style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
                  />
                </div>
              )}
            </div>

            {/* Metric 2: 90-Day Milestone Progress */}
            <div className="p-4 sm:p-5 space-y-1.5 transition-colors hover:bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">90-Day Milestone</span>
                <span className="font-mono text-sm font-bold text-foreground">
                  Step {goalStats.completed} of 90
                </span>
              </div>
              <div className="flex items-center justify-between pt-0.5 gap-2">
                <p className="text-xs text-muted-foreground truncate">
                  {Math.min(100, Math.round((goalStats.completed / 90) * 100))}% toward goal
                </p>
                <Link
                  to="/journey"
                  className="text-primary text-xs font-semibold hover:underline flex items-center gap-0.5 shrink-0"
                >
                  <span>Journey</span>
                  <ChevronRight className="size-3" aria-hidden="true" />
                </Link>
              </div>
              <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden border border-border/40 mt-1.5">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-smooth"
                  style={{ width: `${Math.min(100, (goalStats.completed / 90) * 100)}%` }}
                />
              </div>
            </div>

            {/* Metric 3: Buffer Margin & 7-Day Rhythm */}
            <div className="p-4 sm:p-5 space-y-2 transition-colors hover:bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Buffer Reserve</span>
                <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {bufferDaysRemaining} of 9 flex days
                </span>
              </div>
              <div className="flex items-center justify-between pt-0.5 gap-2">
                <p className="text-xs text-muted-foreground truncate">
                  ±10% mathematical safety margin intact
                </p>
                {weeklyCadence.length === 7 && (
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/80 bg-background/80 shrink-0"
                    aria-label="7-day completion rhythm"
                    title="7-day completion cadence"
                  >
                    {weeklyCadence.map((day) => (
                      <span
                        key={day.dateStr}
                        className={cn(
                          "size-1.5 rounded-full transition-all",
                          day.completed ? "bg-emerald-500" : "border border-border/80 bg-transparent",
                        )}
                      />
                    ))}
                    <span className="text-[10px] font-mono text-muted-foreground ml-0.5">7d</span>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Epistemic Guidance Slab */}
          {topMentorSignal && (
            <aside
              aria-label="Mentor Advisory Note"
              className="milled-slab rounded-xl p-4 sm:p-5 hover:bg-muted/10 transition-all shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="size-8 rounded-lg border border-border/80 bg-background flex items-center justify-center shrink-0 text-primary mt-0.5">
                    <Target className="size-4 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                      Mentor Diagnostic
                    </p>
                    <p className="text-xs text-foreground mt-0.5 leading-relaxed line-clamp-2">
                      {topMentorSignal}
                    </p>
                  </div>
                </div>
                <Link
                  to="/mentor"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 self-center active:scale-[0.98]"
                >
                  <span>Review</span>
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          )}
        </div>
      </div>
    </motion.div>
  );
}
