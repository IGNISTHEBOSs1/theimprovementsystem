import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Target, Sparkles, Check, Loader2, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DirectionCard } from "@/components/dashboard/DirectionCard";
import { FirstLaunchState } from "@/components/dashboard/FirstLaunchState";
import { AppTour } from "@/components/onboarding/AppTour";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PrimaryActionPanel } from "@/components/dashboard/PrimaryActionPanel";
import { RecoveryState } from "@/components/dashboard/RecoveryState";
import { DailyClosureCard } from "@/components/dashboard/DailyClosureCard";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";
import { deriveFollowThroughStats, deriveGoalPace, deriveGoalStats, deriveTrajectory, deriveWeeklyCadence } from "@/lib/trajectory";
import { deriveGuidance } from "@/lib/guidance";
import { deriveInsights } from "@/lib/insights";
import { triggerHaptic } from "@/lib/haptics";
import { soundEngine } from "@/hooks/useSoundEffects";
import { TIS_SPRINGS, TIS_EASINGS } from "@/lib/motion-tokens";
import type { Quest } from "@/types/quest";

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
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card/80 px-4 py-3.5 text-body-sm transition-colors duration-250 overflow-hidden",
        completionStage !== "idle" && "bg-emerald-500/[0.12] border-emerald-500/50"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Tactile Check Target */}
        <button
          type="button"
          onClick={handleMarkComplete}
          disabled={completing || isCompleted}
          aria-label={`Mark "${quest.title}" as complete`}
          className={cn(
            "size-6 shrink-0 rounded-lg border transition-all duration-300 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90 cursor-pointer",
            isCompleted
              ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 scale-105"
              : "border-border/80 bg-background/90 text-transparent hover:border-emerald-500/80 hover:text-emerald-500/30 shadow-xs"
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

        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
          <Badge variant="outline" className={PRIORITY_BADGE_CLASSES[quest.priority] || PRIORITY_BADGE_CLASSES.Optional}>
            {quest.priority}
          </Badge>
          <span className={cn("text-foreground font-medium line-clamp-2 break-words leading-snug", isCompleted && "line-through text-muted-foreground")}>
            {quest.title}
          </span>
        </div>
      </div>

      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "min-h-10 px-3 hover:bg-muted/80 text-xs font-medium transition-colors",
          isCompleted ? "text-emerald-500 font-semibold" : "text-muted-foreground hover:text-foreground"
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
  const { state, loading, error, saving, activeQuests, lastMissedQuest, completeQuest, reload, todayStr } = useDashboardDataContext();
  const name = profile?.username || "there";
  const chooseQuest = () => {
    soundEngine.playTap();
    navigate("/quests");
  };
  const [completeError, setCompleteError] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Founder Decision (Recovery/Guidance chunk): recommitting to a missed
  // one-shot Quest hands its title/priority/goal-link to the Quest page's
  // commit form as a starting point, rather than making the user retype
  // what they already said once. Quests.tsx reads this via location.state
  // and clears it after consuming it (see that file) so navigating back
  // doesn't silently re-prefill.
  const handleRecommit = (quest: Quest) => {
    soundEngine.playTap();
    navigate("/quests", {
      state: {
        prefill: {
          title: quest.title,
          priority: quest.priority,
          linkedToGoal: Boolean(quest.linkedToGoal),
        },
      },
    });
  };

  const handleComplete = async (questId: string) => {
    setCompleteError(false);
    const { error: completeErr } = await completeQuest(questId);
    if (completeErr) setCompleteError(true);
  };

  // Gate on this component's own profile-loading state (not just the outer
  // ProtectedRoute's) so a returning user is never briefly shown the
  // first-launch state while `profile` is still resolving. See Phase 1 —
  // Milestone 1 — First Launch (do not modify returning-user behavior).
  if (profileLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
        <section className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-7" aria-label="Loading">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-7 w-3/5 animate-pulse rounded bg-muted" />
        </section>
      </div>
    );
  }

  // An unresolved profile (fetch exhausted its retries) must never be
  // treated as a returning user's Dashboard, nor as a first-launch user —
  // we simply don't know which one they are. This is a distinct third
  // state from "loading" and "resolved". Recoverable per Interaction Law
  // VI: calm, informative, and offers a direct way back (retry).
  if (profileError || !profile) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
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
            variant="neon"
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

  // A failed game_state load (retries exhausted) must never render as if
  // it were a legitimate fresh account — see useDashboardData.error. This
  // is the same class of distinction Dashboard already makes for
  // profileError above, applied to the sibling table.
  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
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
          <Button variant="neon" size="lg" className="mt-4" onClick={() => void reload()}>
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

  let trajectory: ReturnType<typeof deriveTrajectory> = { actual: [], intended: [], currentPosition: 0 };
  try {
    trajectory = deriveTrajectory(safeQuests);
  } catch (e) {
    console.warn("deriveTrajectory error:", e);
  }


  let weeklyCadence: ReturnType<typeof deriveWeeklyCadence> = [];
  try {
    weeklyCadence = todayStr ? deriveWeeklyCadence(safeQuests, todayStr, profile?.timezone || "UTC") : [];
  } catch (e) {
    console.warn("deriveWeeklyCadence error:", e);
  }

  const contextualLink = (guidance.length > 0 || insights.length > 0)
    ? { to: "/mentor", label: "Your Mentor has a note based on your history." }
    : trajectory.actual.length > 0
      ? { to: "/journey", label: "See how your recent actions compare to your intended path." }
      : null;

  const todayDateFormatted = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const completedToday = safeQuests.filter((q) => {
    const qRecord = q as unknown as Record<string, unknown>;
    const isCompleted = Boolean(q.completed || qRecord.status === "completed");
    const dateVal = q.resolvedAt || (typeof qRecord.completedAt === "string" ? qRecord.completedAt : undefined);
    return isCompleted && Boolean(dateVal && (todayStr ? String(dateVal).startsWith(todayStr) : false));
  }).length;

  const followThrough = deriveFollowThroughStats(safeQuests);
  const goalStats = deriveGoalStats(safeQuests, profile?.primary_goal);
  const pace = deriveGoalPace(safeQuests, profile?.primary_goal_target_date, undefined, profile?.primary_goal);
  const completionRate = followThrough.total > 0
    ? Math.round((followThrough.completed / followThrough.total) * 100)
    : null;
  const goalFocusRate = goalStats.completed > 0
    ? Math.min(100, Math.round((goalStats.completed / 90) * 100))
    : 0;
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
  const activeInsight = insights[0]?.text || guidance[0]?.text || "Execute your daily focus to maintain trajectory momentum within the ±10% buffer.";

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-4xl px-5 py-6 pb-24 sm:px-8 sm:py-10"
    >
      <AppTour />

      {/* ── Precision Status Header ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/60">
        <div>
          <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            {todayDateFormatted}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-1">
            {greeting}, {name}.
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-card text-xs font-mono font-medium text-foreground shadow-xs">
            <span className="size-2 rounded-full bg-foreground" aria-hidden="true" />
            <span>{activeQuests.length}/3 Active Commitments</span>
          </div>
        </div>
      </header>

      {/* ── Asymmetric Bento Grid Section ── */}
      <div className="mt-6 space-y-4">
        {/* Full-Width Summary Card: Primary Goal & Insight */}
        <section
          aria-label="Current Horizon & Primary Goal"
          className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-5 sm:p-6 shadow-[var(--shadow-card)] relative overflow-hidden ring-1 ring-black/[0.02] dark:ring-white/[0.03]"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  Primary Horizon
                </span>
                {daysRemaining !== null && (
                  <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 border-border/80">
                    Day {elapsedDays} of 90 • {daysRemaining}d remaining
                  </Badge>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground line-clamp-2">
                {primaryGoal ? primaryGoal : "No North Star goal set yet."}
              </h2>
              {!primaryGoal && (
                <Link to="/profile" className="inline-block text-xs font-medium text-primary hover:underline">
                  Define your primary goal in Profile →
                </Link>
              )}
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                Trajectory Status
              </span>
              <span className="text-xs font-mono font-semibold text-foreground mt-0.5 inline-block">
                {completedToday > 0 ? "Momentum Honored" : "Awaiting Daily Execution"}
              </span>
            </div>
          </div>

          {/* Compact Personalized Mentor Insight */}
          <div className="mt-4 pt-4 border-t border-border/50 flex items-start gap-2.5">
            <Sparkles className="size-4 shrink-0 text-muted-foreground mt-0.5" aria-hidden="true" />
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Mentor Signal: </span>
              {activeInsight}
            </p>
          </div>
        </section>

        {/* 2-Tile Telemetry Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tile 1: Completion Rate */}
          <section
            aria-label="Completion Rate Telemetry"
            className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-5 sm:p-6 shadow-[var(--shadow-card)] relative overflow-hidden transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Completion Rate
              </span>
              <span className="text-xs font-mono font-medium text-muted-foreground">
                {followThrough.completed} / {followThrough.total}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-foreground">
                {completionRate !== null ? `${completionRate}%` : "—"}
              </span>
              <span className="text-xs text-muted-foreground">
                {completionRate !== null ? "follow-through" : "no resolved commitments"}
              </span>
            </div>
            <div className="mt-3.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-500 ease-out"
                style={{ width: `${completionRate ?? 0}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              {followThrough.total > 0
                ? `${followThrough.completed} of ${followThrough.total} total commitments honored.`
                : "Resolve active commitments to establish your baseline rate."}
            </p>
          </section>

          {/* Tile 2: Goal Focus */}
          <section
            aria-label="Goal Focus Telemetry"
            className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-5 sm:p-6 shadow-[var(--shadow-card)] relative overflow-hidden transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Goal Focus
              </span>
              <span className="text-xs font-mono font-medium text-muted-foreground">
                {goalStats.completed} / 90 anchors
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-foreground">
                {goalFocusRate}%
              </span>
              <span className="text-xs text-muted-foreground">
                90-day milestone progress
              </span>
            </div>
            <div className="mt-3.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-500 ease-out"
                style={{ width: `${goalFocusRate}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              {goalStats.completed > 0
                ? `${goalStats.completed} of 90 target anchors locked toward your 90-day North Star.`
                : "Commit to your daily focus in accordance with your 90-day goal."}
            </p>
          </section>
        </div>

        {/* Daily Focus & 7-Day Rhythm Cadence Card */}
        <section
          aria-label="Daily Focus and Weekly Rhythm"
          className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-5 sm:p-6 shadow-[var(--shadow-card)] relative overflow-hidden"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Daily Focus Status */}
            <div className="flex items-center gap-4">
              <div className="size-11 shrink-0 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-muted/40 flex items-center justify-center">
                {completedToday > 0 ? (
                  <CheckCircle2
                    className="size-5 text-emerald-500"
                    aria-hidden="true"
                  />
                ) : (
                  <Target
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold tracking-tight text-foreground">
                    {completedToday > 0 ? "Focus Honored" : "Daily Focus"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1.5">
                  {completedToday > 0 ? (
                    <>
                      <Check className="size-3.5 text-emerald-500 stroke-[2.5]" aria-hidden="true" />
                      <span className="text-emerald-500 font-medium">
                        {completedToday} {completedToday === 1 ? "commitment" : "commitments"} logged today
                      </span>
                      <span>• Momentum secure</span>
                    </>
                  ) : (
                    <span>Execute your primary focus to advance your trajectory.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Right: 7-Day Rhythm Cadence */}
            {weeklyCadence.length === 7 && (
              <div className="flex flex-col sm:items-end gap-1.5 pt-2 sm:pt-0 border-t border-border/40 sm:border-t-0">
                <div
                  className="inline-flex items-center gap-1.5 p-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-muted/30"
                  aria-label="7-day completion cadence"
                >
                  {weeklyCadence.map((day) => (
                    <span
                      key={day.dateStr}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all",
                        day.completed
                          ? "bg-foreground"
                          : "border border-border/80 bg-transparent"
                      )}
                      title={`${day.dateStr}: ${day.completed ? "Completed" : day.isToday ? "Today" : "Incomplete"}`}
                    />
                  ))}
                </div>
                <span className={cn("text-[11px] font-mono font-medium", completedToday > 0 ? "text-foreground" : "text-muted-foreground")}>
                  {completedToday > 0 ? `✓ ${completedToday} completed today` : "7-day cadence"}
                </span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Tier 1 Action — Today's Focus Card ── */}
      <div className="mt-6">
        {loading ? (
          <section className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-7" aria-label="Loading today’s focus">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-7 w-3/5 animate-pulse rounded bg-muted" />
          </section>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {activeQuests.length > 0 ? (
              <motion.div
                key="active-quests"
                initial={{ opacity: 0, y: 8, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.985 }}
                transition={TIS_SPRINGS.settle}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <PrimaryActionPanel
                    key={activeQuests[0].id}
                    quest={activeQuests[0]}
                    completing={saving}
                    onComplete={() => void handleComplete(activeQuests[0].id)}
                    onChooseQuest={chooseQuest}
                    completedGoalQuests={goalStats.completed}
                  />
                </AnimatePresence>
                {completeError && (
                  <p className="mt-3 text-body-sm text-muted-foreground" role="alert">
                    That didn't go through. You can try again.
                  </p>
                )}
                {activeQuests.length > 1 ? (
                  <div className="mt-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                        Also Active
                      </p>
                      <Link to="/quests" className="text-xs font-medium text-primary hover:underline">
                        See all quests →
                      </Link>
                    </div>
                    <ul className="mt-3 space-y-2.5">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {activeQuests.slice(1).map((quest) => (
                          <SecondaryQuestItem
                            key={quest.id}
                            quest={quest}
                            completing={saving}
                            onComplete={handleComplete}
                          />
                        ))}
                      </AnimatePresence>
                    </ul>
                  </div>
                ) : (
                  <div className="mt-4">
                    <Link to="/quests" className="text-body-sm text-primary underline-offset-4 hover:underline">
                      See all commitments →
                    </Link>
                  </div>
                )}
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

      {/* ── Tier 2 Direction — Ambient Guidance ── */}
      <div className="mt-8 pt-6 border-t border-border/50">
        <DirectionCard
          name={name}
          goalStats={profile?.primary_goal ? goalStats : undefined}
          bufferDaysRemaining={bufferDaysRemaining}
          elapsedDays={elapsedDays}
        />
      </div>

      {/* ── Contextual Link ── */}
      {contextualLink && (
        <div className="mt-8">
          <Link
            to={contextualLink.to}
            className="group flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card hover:bg-muted/40 transition-all shadow-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-8 rounded-xl border border-border bg-background flex items-center justify-center shrink-0 text-primary">
                <Sparkles className="size-4" aria-hidden="true" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 leading-snug">
                {contextualLink.label}
              </p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2" aria-hidden="true" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}
