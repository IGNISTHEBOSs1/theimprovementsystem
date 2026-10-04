import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, CheckCircle2, Sparkles, Check, Loader2, Plus, Clock } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DirectionCard } from "@/components/dashboard/DirectionCard";
import { FirstLaunchState } from "@/components/dashboard/FirstLaunchState";
import { AppTour } from "@/components/onboarding/AppTour";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PrimaryActionPanel } from "@/components/dashboard/PrimaryActionPanel";
import { TelemetryHud } from "@/components/dashboard/TelemetryHud";
import { RecoveryState } from "@/components/dashboard/RecoveryState";
import { DailyClosureCard } from "@/components/dashboard/DailyClosureCard";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";
import { deriveGoalStats, deriveTrajectory, deriveCurrentStreak, deriveWeeklyCadence } from "@/lib/trajectory";
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
  slotIndex?: number;
}

function SecondaryQuestItem({ quest, completing, onComplete, slotIndex = 2 }: SecondaryQuestItemProps) {
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
        "group rounded-2xl bg-[#12141A]/90 backdrop-blur-md border border-[rgba(148,163,184,0.18)] p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 hover:border-white/30 transition-colors shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.4)]",
        completionStage !== "idle" && "bg-white/[0.08] border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Tactile Squircle Checkbox (1:1 Monochromatic Spec) */}
        <button
          type="button"
          onClick={handleMarkComplete}
          disabled={completing || isCompleted}
          aria-label={`Mark "${quest.title}" as complete`}
          className="size-7 rounded-xl flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white touch-manipulation cursor-pointer group active:scale-[0.92] transition-transform"
        >
          <div
            className={cn(
              "size-7 rounded-xl flex items-center justify-center transition-all duration-200 border",
              isCompleted
                ? "bg-white text-black border-white/60 shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                : "bg-[#0C0E14] border-[rgba(148,163,184,0.25)] text-transparent group-hover:border-white/60 group-hover:text-white/40"
            )}
          >
            {completing && !isCompleted ? (
              <Loader2 className="size-3 animate-spin text-muted-foreground" aria-hidden="true" />
            ) : (
              <Check className={cn("size-3.5", isCompleted ? "stroke-[3] animate-in zoom-in-75 duration-200" : "stroke-[2]")} aria-hidden="true" />
            )}
          </div>
        </button>

        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("text-xs sm:text-sm font-semibold text-foreground truncate block", isCompleted && "line-through opacity-80 text-muted-foreground")}>
              {quest.title}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#181B24] text-zinc-300 font-mono text-[9px] font-bold border border-[rgba(148,163,184,0.14)] uppercase tracking-wider shrink-0">
              {quest.priority === "Top" ? "P1 CRITICAL" : "DAILY"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3 text-zinc-400" aria-hidden="true" />
              {quest.timeFrame || "45m Block Allocated"}
            </span>
            <span>•</span>
            <span>Queue: Position {slotIndex - 1}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={completing || isCompleted}
        onClick={handleMarkComplete}
        className={cn(
          "px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold tracking-wider active:scale-95 transition-all cursor-pointer",
          isCompleted
            ? "bg-white/10 border-white/30 text-white"
            : "bg-[#181B24] border-[rgba(148,163,184,0.2)] text-white hover:bg-white hover:text-black hover:border-white"
        )}
      >
        {isCompleted ? "DONE" : "INITIATE"}
      </button>
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
        <section className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-7 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12),0_12px_32px_-4px_rgba(0,0,0,0.55)] backdrop-blur-xl" aria-label="Loading">
          <div className="h-3 w-24 animate-pulse rounded bg-[#181B24]" />
          <div className="mt-4 h-7 w-3/5 animate-pulse rounded bg-[#181B24]" />
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
          className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-7 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12),0_12px_32px_-4px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          aria-label="Profile unavailable"
        >
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400">Your system</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">
            We couldn't load your profile.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This is usually temporary. You can try again now.
          </p>
          <Button
            size="lg"
            className="mt-4 rounded-xl px-6 bg-white text-black hover:bg-zinc-200 font-bold active:scale-[0.98] transition-all shadow-[0_0_16px_rgba(255,255,255,0.2)]"
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
          className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-7 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12),0_12px_32px_-4px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          aria-label="Progress unavailable"
        >
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400">Your system</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">
            We couldn't load your progress.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This is usually temporary. You can try again now.
          </p>
          <Button
            size="lg"
            className="mt-4 rounded-xl px-6 bg-white text-black hover:bg-zinc-200 font-bold active:scale-[0.98] transition-all shadow-[0_0_16px_rgba(255,255,255,0.2)]"
            onClick={() => void reload()}
          >
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

      {/* ── Cockpit Status Header (1:1 Stitch TopAppBar Spec) ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[rgba(148,163,184,0.12)]">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="size-9 rounded-full bg-[#181B24] border border-[rgba(148,163,184,0.25)] flex items-center justify-center overflow-hidden ring-1 ring-white/20 text-white font-bold text-xs">
              {name.trim().slice(0, 2).toUpperCase() || "ME"}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-white ring-2 ring-[#090A0F]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
              Your Commitments
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">
              PROTOCOL // ACTIVE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 3-Segment Capacity Status Gauge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(148,163,184,0.15)] bg-[#12141A] text-xs font-mono font-medium text-muted-foreground shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "size-2 rounded-full transition-all",
                    i < activeQuests.length ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "bg-[rgba(148,163,184,0.2)]"
                  )}
                />
              ))}
            </div>
            <span className="tnum font-bold text-foreground">{activeQuests.length}/3 CAPACITY</span>
          </div>

          <button
            type="button"
            onClick={chooseQuest}
            aria-label="Add Commitment"
            className="size-9 rounded-xl bg-[#181B24] hover:bg-[#202430] border border-[rgba(148,163,184,0.2)] flex items-center justify-center text-white active:scale-95 transition-all shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)] cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* ── Telemetry HUD Bar (Obsidian Kinetic Velocity Index, Buffer Margin, Trajectory Horizon) ── */}
      <div className="mt-5">
        <TelemetryHud
          velocityIndex="1.25x"
          marginDays="+16d"
          horizonDays={
            profile?.primary_goal_target_date
              ? Math.max(
                  0,
                  Math.ceil(
                    (new Date(
                      profile.primary_goal_target_date.includes("T")
                        ? profile.primary_goal_target_date
                        : `${profile.primary_goal_target_date}T23:59:59`
                    ).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                )
              : "90d"
          }
          statusText="ON TRAJECTORY"
        />
      </div>

      {/* ── Rhythm & Momentum Cockpit (Prominent, Dedicated Streak & Weekly Rhythm) ── */}
      <section
        aria-label="Rhythm and Streak Momentum"
        className="mt-5 rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-5 sm:p-6 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_12px_32px_-4px_rgba(0,0,0,0.55)] backdrop-blur-xl relative overflow-hidden"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Streak Counter & Status Microcopy */}
          <div className="flex items-center gap-4">
            <div className="size-12 shrink-0 rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#181B24] flex items-center justify-center shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)]">
              <Flame
                className={cn(
                  "size-6 transition-all",
                  currentStreak > 0 ? "text-white fill-white/20" : "text-muted-foreground"
                )}
                aria-hidden="true"
              />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                {currentStreak > 0 ? (
                  <>
                    <span className="text-2xl font-extrabold tracking-tight text-foreground tnum font-sans">
                      {currentStreak}
                    </span>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      {currentStreak === 1 ? "Day Active" : "Days Active"}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold tracking-tight text-foreground font-sans">
                    Build Momentum
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1.5">
                {completedToday > 0 ? (
                  <>
                    <Check className="size-3.5 text-white stroke-[2.5]" aria-hidden="true" />
                    <span className="text-white font-semibold">Streak preserved for today</span>
                    <span>• Trajectory maintained</span>
                  </>
                ) : currentStreak > 0 ? (
                  <span>Complete primary focus to extend your streak to {currentStreak + 1} days</span>
                ) : (
                  <span>Complete primary focus to begin your active streak</span>
                )}
              </p>
            </div>
          </div>

          {/* Right: 7-Day Rhythm Cadence */}
          {weeklyCadence.length === 7 && (
            <div className="flex flex-col sm:items-end gap-2 pt-2 sm:pt-0 border-t border-[rgba(148,163,184,0.1)] sm:border-t-0">
              <div
                className="inline-flex items-center gap-2 p-1.5 rounded-xl border border-[rgba(148,163,184,0.14)] bg-[#181B24]"
                aria-label="7-day completion cadence"
              >
                {weeklyCadence.map((day) => (
                  <div
                    key={day.dateStr}
                    className="flex flex-col items-center gap-1"
                    title={`${day.dateStr}: ${day.completed ? "Completed" : day.isToday ? "Today" : "Incomplete"}`}
                  >
                    <span className={cn(
                      "text-[10px] font-mono font-bold uppercase leading-none tnum",
                      day.isToday ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {day.dayLabel}
                    </span>
                    <span
                      className={cn(
                        "size-5 rounded-lg flex items-center justify-center transition-all",
                        day.completed
                          ? "bg-white text-black border border-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                          : day.isToday
                          ? "border border-dashed border-white/60 bg-white/10 text-white"
                          : "border border-[rgba(148,163,184,0.12)] bg-[#12141A]"
                      )}
                    >
                      {day.completed ? (
                        <Check className="size-3 stroke-[3]" aria-hidden="true" />
                      ) : day.isToday ? (
                        <span className="size-1.5 rounded-full bg-white animate-pulse" />
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
              <span className={cn("text-[11px] font-mono font-medium tnum", completedToday > 0 ? "text-white" : "text-muted-foreground")}>
                {completedToday > 0 ? `✓ ${completedToday} completed today` : "No commitments completed today yet"}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── Tier 1 Action — 1 Primary Focus + 2 Companion Routines ── */}
      <div className="mt-6">
        {loading ? (
          <section className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-7" aria-label="Loading today’s focus">
            <div className="h-3 w-24 animate-pulse rounded bg-[#181B24]" />
            <div className="mt-4 h-7 w-3/5 animate-pulse rounded bg-[#181B24]" />
          </section>
        ) : activeQuests.length > 0 ? (
          <>
            {/* Slot 1: Primary Focus */}
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
              <p className="mt-3 text-body-sm text-destructive" role="alert">
                That didn't go through. You can try again.
              </p>
            )}

            {/* Slots 2 & 3: Companion Routines (1:1 Stitch Routines & Cadence Spec) */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    Routines & Cadence
                  </h3>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5 font-mono">
                    Strict constraint: 1 Primary Focus + 2 Companion Routines
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-white tnum bg-white/10 border border-white/20 px-2.5 py-1 rounded-full uppercase">
                  {Math.min(activeQuests.length - 1, 2)} OF 2 ENGAGED
                </span>
              </div>

              <ul className="space-y-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {activeQuests.slice(1, 3).map((quest, index) => (
                    <SecondaryQuestItem
                      key={quest.id}
                      quest={quest}
                      completing={saving}
                      onComplete={handleComplete}
                      slotIndex={index + 2}
                    />
                  ))}
                </AnimatePresence>

                {/* Open Slot Placeholder if fewer than 3 total commitments */}
                {activeQuests.length < 3 && (
                  <li className="rounded-2xl border border-dashed border-[rgba(148,163,184,0.18)] bg-[#12141A]/50 p-4 flex items-center justify-between gap-3 text-xs transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg border border-dashed border-[rgba(148,163,184,0.25)] flex items-center justify-center text-muted-foreground">
                        <span className="text-xs font-mono font-bold">+{3 - activeQuests.length}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground font-sans block">
                          Routine Slot {activeQuests.length + 1} Open
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          Available for a companion habit or recurring commitment
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-[rgba(148,163,184,0.2)] bg-[#181B24] text-xs font-semibold hover:bg-[#202430] active:scale-[0.98]"
                      onClick={chooseQuest}
                    >
                      + Add routine
                    </Button>
                  </li>
                )}
              </ul>

              {/* Routine 3: Milestone Segmented Capacity Gauge (1:1 Monochromatic Spec) */}
              {weeklyCadence.length === 7 && (
                <div className="mt-4 rounded-2xl bg-[#12141A]/90 backdrop-blur-md border border-[rgba(148,163,184,0.18)] p-3.5 sm:p-4 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)]">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-semibold">
                      Weekly Execution Matrix
                    </span>
                    <span className="text-[10px] font-mono text-white font-bold">
                      {weeklyCadence.filter((d) => d.completed).length}/7 COMPLETED
                    </span>
                  </div>
                  {/* 7-Day Micro Pill Segmented Gauge */}
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {weeklyCadence.map((day) => (
                      <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                        <div
                          className={cn(
                            "w-full h-2 rounded-full transition-all",
                            day.completed
                              ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                              : day.isToday
                              ? "bg-white/60 ring-1 ring-white animate-pulse"
                              : "bg-[#181B24] border border-[rgba(148,163,184,0.12)]"
                          )}
                        />
                        <span
                          className={cn(
                            "text-[10px] font-mono font-bold leading-none",
                            day.isToday ? "text-white" : "text-muted-foreground"
                          )}
                        >
                          {day.dayLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
      <div className="mt-8 pt-6 border-t border-[rgba(148,163,184,0.12)]">
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
