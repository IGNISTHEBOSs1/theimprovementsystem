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
        "flex items-center justify-between gap-3 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card/80 px-3.5 sm:px-4 py-3 sm:py-3.5 text-body-sm transition-colors duration-250 overflow-hidden",
        completionStage !== "idle" && "bg-emerald-500/[0.12] border-emerald-500/50",
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={handleMarkComplete}
          disabled={completing || isCompleted}
          aria-label={`Mark "${quest.title}" as complete`}
          className={cn(
            "size-6 shrink-0 rounded-lg border transition-all duration-300 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90 cursor-pointer",
            isCompleted
              ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 scale-105"
              : "border-border/80 bg-background/90 text-transparent hover:border-emerald-500/80 hover:text-emerald-500/30 shadow-xs",
          )}
        >
          {completing && !isCompleted ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden="true" />
          ) : isCompleted ? (
            <Check className="size-3.5 stroke-[3] animate-in zoom-in-75 duration-300" aria-hidden="true" />
          ) : (
            <Check className="size-3.5 stroke-[2]" aria-hidden="true" />
          )}
        </button>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-sans font-medium border border-border/70 bg-muted/40 text-muted-foreground shrink-0">
            Routine
          </span>
          {quest.linkedToGoal && quest.goalName && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground border border-border/40 bg-muted/20 px-2 py-0.5 rounded-full truncate max-w-[160px]">
              <Target className="size-2.5 text-primary shrink-0" aria-hidden="true" />
              <span className="truncate">{quest.goalName}</span>
            </span>
          )}
          <span className={cn("text-foreground font-medium truncate sm:line-clamp-2 break-words leading-snug text-xs sm:text-sm", isCompleted && "line-through text-muted-foreground")}>
            {quest.title}
          </span>
        </div>
      </div>

      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "shrink-0 min-h-9 sm:min-h-10 px-2.5 sm:px-3 hover:bg-muted/80 text-xs font-medium transition-colors",
          isCompleted ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-muted-foreground hover:text-foreground",
        )}
        disabled={completing || isCompleted}
        onClick={handleMarkComplete}
      >
        {isCompleted ? "Done!" : "Mark complete"}
      </Button>
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
  const [showTelemetryDetails, setShowTelemetryDetails] = useState(false);
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
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <section className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-7" aria-label="Loading">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-7 w-3/5 animate-pulse rounded bg-muted" />
        </section>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <section
          className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-7"
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
            className="mt-4"
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
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <section
          className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-7"
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
      className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
    >
      <AppTour />

      {/* ── 1. GREETING & LOCATION (Attention Level: Context) ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/60">
        <div>
          <p className="text-xs font-sans font-medium text-muted-foreground">
            {todayDateFormatted}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5">
            {greeting}, {name}.
          </h1>
          {primaryGoal ? (
            <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium text-foreground truncate max-w-[220px] sm:max-w-md">{primaryGoal}</span>
              <span className="hidden sm:inline text-muted-foreground/50" aria-hidden="true">·</span>
              <span className="font-mono">Day {elapsedDays} of 90</span>
              {daysRemaining !== null && <span className="font-mono text-muted-foreground">({daysRemaining}d left)</span>}
            </p>
          ) : (
            <Link to="/profile" className="text-xs text-primary hover:underline mt-1 inline-block">
              Set your 90-day North Star in Profile →
            </Link>
          )}
        </div>

        {/* Quiet Commitment Capacity Pill */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-card text-xs font-sans font-medium text-foreground shadow-xs">
            <span
              className={cn(
                "size-2 rounded-full",
                activeFocus ? "bg-primary" : completedFocusToday ? "bg-emerald-500" : "bg-muted-foreground/30",
              )}
              aria-hidden="true"
            />
            <span>
              {activeFocus ? "1 Focus" : completedFocusToday ? "1 Focus (Done)" : "0 Focus"}
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-muted-foreground">{activeRoutines.length}/2 Routines</span>
          </div>
        </div>
      </header>

      {/* ── 2. TODAY’S PRIMARY FOCUS (Attention Level: Primary Action — The ONE dominant card) ── */}
      <div className="mt-6">
        {loading ? (
          <section className="rounded-2xl border border-border/80 bg-card p-7" aria-label="Loading today’s focus">
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
                className="rounded-2xl glass-hero p-5 sm:p-7 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  </span>
                  <p className="text-xs font-sans font-semibold text-emerald-700 dark:text-emerald-400">
                    Primary Focus Complete
                  </p>
                </div>
                <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {completedFocusToday.title}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
                  Your primary focus for today is locked in. Continue with your supporting routines below or rest.
                </p>
              </motion.div>
            ) : activeRoutines.length > 0 ? (
              <motion.div
                key="focus-slot-open-card"
                initial={{ opacity: 0, y: 8, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.985 }}
                transition={TIS_SPRINGS.settle}
                className="rounded-2xl border border-dashed border-primary/40 bg-primary/[0.03] p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <span className="text-xs font-sans font-semibold text-primary">
                    Primary Focus Open
                  </span>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground mt-0.5">
                    Focus today on one decisive commitment
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-lg">
                    Your routines are active below. Set your single non-negotiable focus to guide today&apos;s momentum.
                  </p>
                </div>
                <Button
                  onClick={chooseQuest}
                  className="rounded-xl px-5 min-h-10 text-xs font-semibold shrink-0"
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
      </div>

      {/* ── 3. BALANCED DESKTOP SECONDARY WORKSPACE (Routines + Evidence & Mentor) ── */}
      <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
        {/* Left Column on Desktop: Supporting Routines */}
        <div className={cn("space-y-6", activeRoutines.length > 0 ? "lg:col-span-7" : "lg:col-span-12")}>
          {activeRoutines.length > 0 && (
            <section aria-labelledby="supporting-routines-heading">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 id="supporting-routines-heading" className="text-xs font-sans font-semibold text-muted-foreground">
                  Supporting Routines ({activeRoutines.length} of 2)
                </h2>
                <Link to="/quests" className="text-xs font-medium text-primary hover:underline">
                  Manage routines →
                </Link>
              </div>
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
            </section>
          )}
        </div>

        {/* Right Column on Desktop: Momentum Progress + Mentor Advice */}
        <div className={cn("space-y-4", activeRoutines.length > 0 ? "mt-6 lg:mt-0 lg:col-span-5" : "mt-6 lg:col-span-12")}>
          {/* ── 4. QUIET PROOF OF PROGRESS ── */}
          <section
            aria-label="Progress and Momentum Summary"
            className="rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5 text-xs text-muted-foreground shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Target className="size-3.5 text-primary" aria-hidden="true" />
                  <span>Goal Step #{goalStats.completed} of 90</span>
                </div>
                <span className="hidden sm:inline text-muted-foreground/50" aria-hidden="true">·</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{bufferDaysRemaining}</span>/9 Flex Days Intact
                </div>
                {completionRate !== null && (
                  <>
                    <span className="hidden sm:inline text-muted-foreground/50" aria-hidden="true">·</span>
                    <span className="font-mono">{completionRate}% Follow-Through</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* 7-Day Rhythm Cadence Indicator */}
                {weeklyCadence.length === 7 && (
                  <div
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-border/80 bg-background/80"
                    aria-label="7-day rhythm dots"
                    title="7-day completion cadence"
                  >
                    {weeklyCadence.map((day) => (
                      <span
                        key={day.dateStr}
                        className={cn(
                          "size-2 rounded-full transition-all",
                          day.completed ? "bg-foreground" : "border border-border/80 bg-transparent",
                        )}
                      />
                    ))}
                    <span className="text-xs font-mono text-muted-foreground ml-1">7d</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowTelemetryDetails((v) => !v)}
                  className="text-xs text-primary hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1 py-0.5 cursor-pointer"
                  aria-expanded={showTelemetryDetails}
                >
                  {showTelemetryDetails ? "Less" : "Details"}
                </button>
              </div>
            </div>

            {/* Progressive Disclosure: Expanded progress details */}
            <AnimatePresence>
              {showTelemetryDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={TIS_SPRINGS.settle}
                  className="overflow-hidden pt-3 mt-3 border-t border-border/50"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-xs font-sans font-semibold text-muted-foreground block">Follow-Through</span>
                      <span className="text-lg font-bold font-mono text-foreground mt-0.5 block">
                        {followThrough.completed} / {followThrough.total}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {completionRate !== null ? `${completionRate}% of commitments honored` : "No resolved commitments yet"}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-xs font-sans font-semibold text-muted-foreground block">Goal Progress</span>
                      <span className="text-lg font-bold font-mono text-foreground mt-0.5 block">
                        {goalStats.completed} / 90
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.min(100, Math.round((goalStats.completed / 90) * 100))}% toward 90-day milestone
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-xs font-sans font-semibold text-muted-foreground block">Buffer Reserve</span>
                      <span className="text-lg font-bold font-mono text-foreground mt-0.5 block">
                        {bufferDaysRemaining} / 9 days
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        ±10% mathematical safety margin
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ── 5. MENTOR ADVICE ── */}
          {topMentorSignal && (
            <section
              aria-label="Mentor Advisory Note"
              className="p-4 rounded-2xl border border-border/70 bg-card hover:bg-muted/30 transition-all shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="size-8 rounded-xl border border-border bg-background flex items-center justify-center shrink-0 text-primary mt-0.5">
                    <Sparkles className="size-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Mentor Advice</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                      {topMentorSignal}
                    </p>
                  </div>
                </div>
                <Link
                  to="/mentor"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 self-center"
                >
                  <span>View advice</span>
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </motion.div>
  );
}
