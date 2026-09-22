import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, CheckCircle2, Sparkles, Check, Loader2 } from "lucide-react";
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
import { deriveGoalStats, deriveTrajectory, deriveCurrentStreak, deriveWeeklyCadence } from "@/lib/trajectory";
import { deriveGuidance } from "@/lib/guidance";
import { deriveInsights } from "@/lib/insights";
import { triggerHaptic } from "@/lib/haptics";
import type { Quest } from "@/types/quest";

interface SecondaryQuestItemProps {
  quest: Quest;
  completing: boolean;
  onComplete: (questId: string) => void;
}

function SecondaryQuestItem({ quest, completing, onComplete }: SecondaryQuestItemProps) {
  const [completionStage, setCompletionStage] = useState<"idle" | "shrink" | "slide">("idle");
  const shouldReduceMotion = useReducedMotion();
  const isCompleted = completionStage !== "idle";

  const handleMarkComplete = () => {
    if (completing || completionStage !== "idle") return;
    setCompletionStage("shrink");
    triggerHaptic("success");
    if (shouldReduceMotion) {
      onComplete(quest.id);
    } else {
      setTimeout(() => {
        setCompletionStage("slide");
      }, 250);
      setTimeout(() => {
        onComplete(quest.id);
      }, 570);
    }
  };

  return (
    <motion.li
      layout
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={
        shouldReduceMotion
          ? { opacity: 1 }
          : completionStage === "slide"
          ? { scale: 0.94, x: 260, opacity: 0 }
          : completionStage === "shrink"
          ? { scale: 0.94, x: 0, opacity: 1 }
          : { scale: 1, x: 0, opacity: 1 }
      }
      exit={
        shouldReduceMotion
          ? { opacity: 0 }
          : { scale: 0.94, x: 280, opacity: 0, transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] } }
      }
      transition={{
        duration: completionStage === "shrink" ? 0.25 : 0.32,
        ease: completionStage === "shrink" ? "easeOut" : [0.32, 0.72, 0, 1],
        layout: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
      }}
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 px-4 py-3 text-body-sm shadow-[var(--shadow-card)] transition-colors duration-250",
        completionStage !== "idle" && "bg-emerald-500/[0.12] border-l-2 border-l-emerald-500 border-emerald-500/40"
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
          <span className={cn("text-foreground font-medium truncate", isCompleted && "line-through text-muted-foreground")}>
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
  const chooseQuest = () => navigate("/quests");
  const [completeError, setCompleteError] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Founder Decision (Recovery/Guidance chunk): recommitting to a missed
  // one-shot Quest hands its title/priority/goal-link to the Quest page's
  // commit form as a starting point, rather than making the user retype
  // what they already said once. Quests.tsx reads this via location.state
  // and clears it after consuming it (see that file) so navigating back
  // doesn't silently re-prefill.
  const handleRecommit = (quest: Quest) => {
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
        <section className="rounded-2xl border border-border bg-card p-7" aria-label="Loading">
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
          className="rounded-2xl border border-border bg-card p-7"
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
          className="rounded-2xl border border-border bg-card p-7"
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

  let currentStreak = 0;
  try {
    currentStreak = todayStr ? deriveCurrentStreak(safeQuests, todayStr, profile?.timezone || "UTC") : 0;
  } catch (e) {
    console.warn("deriveCurrentStreak error:", e);
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
  const completedToday = safeQuests.filter(
    (q) => (q.completed || (q as any).status === "completed") &&
      Boolean((q.resolvedAt || (q as any).completedAt) &&
        (todayStr ? String(q.resolvedAt || (q as any).completedAt).startsWith(todayStr) : false))
  ).length;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-4xl px-5 py-6 pb-6 sm:px-8 sm:py-10"
    >
      <AppTour />

      {/* ── Cockpit Status Header (Compact, Glanceable & Above-the-Fold) ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/60">
        <div>
          <p className="text-caption text-muted-foreground uppercase tracking-wider font-semibold">
            {todayDateFormatted}
          </p>
          <h1 className="text-display-md font-bold text-foreground mt-0.5">
            {greeting}, {name}.
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/70 bg-card/60 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-foreground" aria-hidden="true" />
            <span>{activeQuests.length}/3 Active</span>
          </div>
        </div>
      </header>

      {/* ── Rhythm & Momentum Cockpit (Prominent, Dedicated Streak & Weekly Rhythm) ── */}
      <section
        aria-label="Rhythm and Streak Momentum"
        className="mt-6 rounded-2xl border border-border/80 bg-card/70 p-5 sm:p-6 shadow-[var(--shadow-card)] backdrop-blur-xs relative overflow-hidden"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Streak Counter & Status Microcopy */}
          <div className="flex items-center gap-4">
            <div className="size-12 shrink-0 rounded-2xl border border-border bg-background/80 flex items-center justify-center shadow-xs">
              <Flame
                className={cn(
                  "size-6 transition-all",
                  currentStreak > 0 ? "text-foreground fill-foreground/15" : "text-muted-foreground"
                )}
                aria-hidden="true"
              />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                {currentStreak > 0 ? (
                  <>
                    <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                      {currentStreak}
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {currentStreak === 1 ? "Day Active" : "Days Active"}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold tracking-tight text-foreground">
                    Build Momentum
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1.5">
                {completedToday > 0 ? (
                  <>
                    <Check className="size-3.5 text-emerald-500 stroke-[2.5]" aria-hidden="true" />
                    <span className="text-emerald-500 font-medium">Streak preserved for today</span>
                    <span>• Excellent focus</span>
                  </>
                ) : currentStreak > 0 ? (
                  <span>Complete today&apos;s focus to extend your streak to {currentStreak + 1} days</span>
                ) : (
                  <span>Complete today&apos;s focus to begin your active streak</span>
                )}
              </p>
            </div>
          </div>

          {/* Right: 7-Day Rhythm Cadence */}
          {weeklyCadence.length === 7 && (
            <div className="flex flex-col sm:items-end gap-2 pt-2 sm:pt-0 border-t border-border/40 sm:border-t-0">
              <div
                className="inline-flex items-center gap-2 p-1.5 rounded-xl border border-border/80 bg-background/60"
                aria-label="7-day completion cadence"
              >
                {weeklyCadence.map((day) => (
                  <div
                    key={day.dateStr}
                    className="flex flex-col items-center gap-1"
                    title={`${day.dateStr}: ${day.completed ? "Completed" : day.isToday ? "Today" : "Incomplete"}`}
                  >
                    <span className={cn(
                      "text-[10px] font-mono font-semibold uppercase leading-none",
                      day.isToday ? "text-foreground font-bold" : "text-muted-foreground"
                    )}>
                      {day.dayLabel}
                    </span>
                    <span
                      className={cn(
                        "size-5 rounded-lg flex items-center justify-center transition-all",
                        day.completed
                          ? "bg-emerald-500 text-white border border-emerald-500 shadow-xs shadow-emerald-500/25"
                          : day.isToday
                          ? "border-2 border-dashed border-foreground/80 bg-foreground/10 text-foreground"
                          : "border border-border/80 bg-muted/40"
                      )}
                    >
                      {day.completed ? (
                        <Check className="size-3 stroke-[3]" aria-hidden="true" />
                      ) : day.isToday ? (
                        <span className="size-1.5 rounded-full bg-foreground animate-pulse" />
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
              <span className={cn("text-[11px] font-medium", completedToday > 0 ? "text-emerald-500" : "text-muted-foreground")}>
                {completedToday > 0 ? `✓ ${completedToday} completed today` : "No quests completed today yet"}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── Tier 1 Action — Today's Focus (Immediately Visible Without Scrolling) ── */}
      <div className="mt-6">
        {loading ? (
          <section className="rounded-2xl border border-border bg-card p-7" aria-label="Loading today’s focus">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-7 w-3/5 animate-pulse rounded bg-muted" />
          </section>
        ) : activeQuests.length > 0 ? (
          <>
            <AnimatePresence mode="popLayout" initial={false}>
              <PrimaryActionPanel
                key={activeQuests[0].id}
                quest={activeQuests[0]}
                completing={saving}
                onComplete={() => void handleComplete(activeQuests[0].id)}
                onChooseQuest={chooseQuest}
              />
            </AnimatePresence>
            {completeError && (
              <p className="mt-3 text-body-sm text-muted-foreground" role="alert">
                That didn't go through. You can try again.
              </p>
            )}
            {activeQuests.length > 1 && (
              <div className="mt-5">
                <p className="text-label text-muted-foreground">Also active</p>
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
            )}
          </>
        ) : completedToday > 0 ? (
          <DailyClosureCard
            completedToday={completedToday}
            onChooseQuest={chooseQuest}
          />
        ) : (
          <RecoveryState onChooseQuest={chooseQuest} lastMissedQuest={lastMissedQuest} onRecommit={handleRecommit} />
        )}
      </div>

      {/* ── Tier 2 Direction — Ambient Guidance (Below Action) ── */}
      <div className="mt-8 pt-6 border-t border-border/50">
        <DirectionCard
          name={name}
          goalStats={profile?.primary_goal ? deriveGoalStats(state.quests) : undefined}
        />
      </div>

      {/* ── Contextual Link ── */}
      {contextualLink && (
        <div className="mt-6">
          <Link to={contextualLink.to} className="text-body-sm text-primary underline-offset-4 hover:underline">
            {contextualLink.label}
          </Link>
        </div>
      )}
    </motion.div>
  );
}
