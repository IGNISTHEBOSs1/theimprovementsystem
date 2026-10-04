import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Check,
  RotateCcw,
  Sparkles,
  CalendarClock,
  Gauge,
  ArrowRight,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlaceholderExperience } from "@/components/shared/PlaceholderExperience";
import { TrajectoryVisualizer } from "@/components/journey/TrajectoryVisualizer";
import { TelemetryHud } from "@/components/dashboard/TelemetryHud";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { deriveGoalPace, deriveGoalStats, deriveResolvedAt } from "@/lib/trajectory";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";
import { triggerHaptic } from "@/lib/haptics";
import { soundEngine } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";

export default function Journey() {
  const { profile } = useAuth();
  const {
    state,
    loading,
    error,
    saving,
    activeQuests,
    recalibrateSchedule,
    completeQuest,
    reload,
    todayStr,
  } = useDashboardDataContext();

  const [isRecalibrating, setIsRecalibrating] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [showAllActivity, setShowAllActivity] = useState(false);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
        <div className="h-72 animate-pulse rounded-2xl bg-[#12141A] border border-[rgba(148,163,184,0.14)]" aria-label="Loading your journey" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
        <section className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-7 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12),0_12px_32px_-4px_rgba(0,0,0,0.55)] backdrop-blur-xl" aria-label="Journey unavailable">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400">Your journey</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">We couldn't load your journey.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This is usually temporary. Try again now.
          </p>
          <Button size="lg" className="mt-4 rounded-xl px-6 bg-white text-black hover:bg-zinc-200 font-bold active:scale-[0.98] transition-all shadow-[0_0_16px_rgba(255,255,255,0.2)]" onClick={() => void reload()}>
            Try again
          </Button>
        </section>
      </div>
    );
  }

  const hasGoal = Boolean(profile?.primary_goal);
  if (!hasGoal) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
        <PlaceholderExperience
          icon={Compass}
          title="No goal set yet."
          message="Your journey tracks progress toward a goal you choose. Set your primary goal in your profile to get started."
        />
      </div>
    );
  }

  const goalStats = deriveGoalStats(state.quests);
  const pace = deriveGoalPace(state.quests, profile?.primary_goal_target_date);

  // Filter evidence to strictly the last 48 hours only (Neutralized History)
  const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
  const recentEvidence48h = state.quests
    .filter((q) => (q.completed || q.failed) && new Date(deriveResolvedAt(q)).getTime() >= fortyEightHoursAgo)
    .sort((a, b) => deriveResolvedAt(b).localeCompare(deriveResolvedAt(a)));

  // Progressive disclosure: 3-4 by default (4), capped at 8-10 (10) when expanded
  const visibleActivity = showAllActivity
    ? recentEvidence48h.slice(0, 10)
    : recentEvidence48h.slice(0, 4);

  // "One-Tap Bump" (Forgiving Rescheduling)
  const handleOneTapBump = async () => {
    setIsRecalibrating(true);
    triggerHaptic("medium");
    soundEngine.playTap();

    try {
      const { shiftedCount, error: recalibrateError } = await recalibrateSchedule();
      if (recalibrateError) {
        soundEngine.playError();
        toast.error("Reschedule failed. Please try again.");
      } else if (shiftedCount > 0) {
        triggerHaptic("success");
        soundEngine.playConfirmation();
        toast.success(
          `Moved ${shiftedCount} secondary commitment${
            shiftedCount > 1 ? "s" : ""
          } to tomorrow to keep your focus clear.`
        );
      } else {
        toast.info("Nothing to reschedule — only your main commitments remain for today.");
      }
    } catch {
      soundEngine.playError();
      toast.error("Could not reschedule commitments.");
    } finally {
      setIsRecalibrating(false);
    }
  };

  const handleActionComplete = async (questId: string) => {
    setCompletingId(questId);
    triggerHaptic("success");
    soundEngine.playSuccess();
    await completeQuest(questId);
    setCompletingId(null);
    toast.success("Action recorded. Keep going!");
  };

  const primaryActionQuest = activeQuests[0];

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6 pb-6 sm:px-8 sm:py-10">
      {/* ── Page Header & Narrative Guidance ── */}
      <div className="space-y-2">
        <p className="text-label text-zinc-400 font-mono uppercase tracking-wider text-xs">
          Trajectory & Navigation
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
          Your Path.
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Tracking deliberate progress toward{" "}
          <span className="font-semibold text-foreground">"{profile?.primary_goal}"</span>.
        </p>
        <div className="mt-2 pl-3 border-l-2 border-white/60 py-1 text-xs sm:text-sm text-foreground/90 font-medium">
          {pace ? (
            pace.isOnTrack ? (
              <span className="tnum">
                Averaging <strong>{pace.actualDailyPace}</strong> goal quest{pace.actualDailyPace === 1 ? "" : "s"} a day — on track for completion by <strong>{pace.targetDateFormatted}</strong>.
              </span>
            ) : (
              <span className="tnum">
                To reach your goal by <strong>{pace.targetDateFormatted}</strong>, aim for <strong>{pace.requiredDailyPace}</strong> goal quests a day (currently averaging <strong>{pace.actualDailyPace}</strong>).
              </span>
            )
          ) : (
            `Set an optional target date in your Profile to unlock your velocity telemetry and estimated completion timeline.`
          )}
        </div>
      </div>

      {/* ── Telemetry HUD ── */}
      <div className="mt-5">
        <TelemetryHud />
      </div>

      {/* ── 1. Trajectory Visualizer Centerpiece ── */}
      <div className="mt-6">
        <TrajectoryVisualizer
          completedQuests={goalStats.completed}
          targetQuests={goalStats.linked}
          isOnTrack={pace ? pace.isOnTrack : goalStats.failed === 0}
          goalLabel={profile?.primary_goal || undefined}
        />
      </div>

      {/* ── 2. Trajectory Telemetry Console (Obsidian Substrate) ── */}
      <div className="mt-6 rounded-[28px] border border-white/10 bg-[#12141A] p-6 sm:p-7 shadow-xl space-y-6 specular-top">
        {/* Console Header: Title & Global Pace Status Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl border border-white/10 bg-[#181B24] flex items-center justify-center text-white shadow-sm">
              <Gauge className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Trajectory Telemetry
              </p>
              <h3 className="text-sm font-bold text-foreground">
                Velocity & Target Alignment
              </h3>
            </div>
          </div>

          {pace && (
            <Badge
              variant="outline"
              className={cn(
                "px-3 py-1 font-mono tnum text-xs font-semibold rounded-full",
                pace.paceRatio >= 1.1
                  ? "border-white/30 bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                  : pace.isOnTrack
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"
              )}
            >
              {pace.paceRatio >= 1.1
                ? `Ahead of pace · +${(pace.actualDailyPace - pace.requiredDailyPace).toFixed(1)}/day`
                : pace.isOnTrack
                ? `On track · pace aligned`
                : `Behind pace · -${(pace.requiredDailyPace - pace.actualDailyPace).toFixed(1)}/day gap`}
            </Badge>
          )}
        </div>

        {/* Telemetry Metrics Grid: Clean 2-column on desktop, spacious vertical rhythm on mobile */}
        {pace ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            {/* Metric 1: Velocity vs Required */}
            <div className="rounded-[20px] border border-white/[0.08] bg-[#181B24] p-5 flex flex-col justify-between shadow-md">
              <div>
                <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground block">
                  Daily Execution Velocity
                </span>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold font-mono tnum tracking-tight text-foreground">
                    {pace.actualDailyPace}
                  </span>
                  <span className="text-xs font-mono tnum text-muted-foreground">
                    / <strong className="text-foreground font-semibold">{pace.requiredDailyPace}</strong> quests/day needed
                  </span>
                </div>

                {/* Ratio Progress Line */}
                <div className="mt-4 space-y-1.5">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5 border border-white/[0.06]">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        pace.isOnTrack ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "bg-zinc-400"
                      )}
                      style={{ width: `${Math.min(Math.round(pace.paceRatio * 100), 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono tnum text-muted-foreground pt-0.5">
                    <span className="text-foreground font-medium">
                      {Math.round(pace.paceRatio * 100)}% velocity ratio
                    </span>
                    <span>
                      {pace.isOnTrack ? "✓ Meeting schedule" : "⚠ Pace boost needed"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono tnum text-muted-foreground">
                <span>Observed window</span>
                <span className="text-foreground font-medium">
                  {pace.recentGoalCompleted} quests in {pace.daysObserved}d
                </span>
              </div>
            </div>

            {/* Metric 2: Target Horizon & Milestone Progress */}
            <div className="rounded-[20px] border border-white/[0.08] bg-[#181B24] p-5 flex flex-col justify-between shadow-md">
              <div>
                <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground block">
                  Target Horizon & Milestone
                </span>
                <div className="mt-2.5">
                  <h4 className="text-2xl sm:text-3xl font-bold font-mono tnum tracking-tight text-foreground">
                    {pace.targetDateFormatted}
                  </h4>
                  <p className="mt-1 text-xs font-mono tnum text-muted-foreground">
                    {pace.daysRemaining} days remaining in commitment window.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono tnum text-muted-foreground">
                <span>Goal progress</span>
                <span className="text-foreground font-semibold">
                  {goalStats.completed} of {goalStats.linked} completed ({goalStats.linked > 0 ? Math.round((goalStats.completed / goalStats.linked) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[20px] border border-white/[0.08] bg-[#181B24] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-semibold text-foreground">No target milestone set</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Set a target date in Profile to unlock predictive velocity ratios and pace tracking.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-xl border-white/10 bg-[#12141A] hover:bg-white/5 text-xs shrink-0 min-h-10 active:scale-[0.98]">
              <Link to="/profile">
                <span>Set milestone</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* ── 3. Up Next Commitment (Obsidian Substrate) ── */}
      <div className="mt-6 rounded-[24px] border border-white/10 bg-[#12141A] p-5 sm:p-6 shadow-xl specular-top">
        {primaryActionQuest ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={PRIORITY_BADGE_CLASSES[primaryActionQuest.priority]}>
                  {primaryActionQuest.priority}
                </Badge>
                <span className="font-mono text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                  Up next on path
                </span>
              </div>
              <h4 className="mt-1.5 text-lg sm:text-xl font-bold text-foreground truncate">
                {primaryActionQuest.title}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Completing this keeps your trajectory on schedule toward your goal.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                disabled={isRecalibrating || saving}
                onClick={handleOneTapBump}
                className="min-h-11 rounded-[16px] border-white/10 bg-[#181B24] hover:bg-white/5 px-4 text-xs font-medium transition-all active:scale-[0.98]"
                title="Shift non-essential quests to tomorrow to protect your momentum"
              >
                <RotateCcw className={`size-3.5 mr-1.5 ${isRecalibrating ? "animate-spin" : ""}`} />
                <span>Reschedule</span>
              </Button>
              <Button
                onClick={() => void handleActionComplete(primaryActionQuest.id)}
                disabled={completingId === primaryActionQuest.id || saving}
                className="min-h-11 rounded-[16px] bg-white text-black hover:bg-zinc-200 px-6 text-xs font-semibold shadow-[0_0_16px_rgba(255,255,255,0.15)] transition-all active:scale-[0.98]"
              >
                <Check className="size-4 mr-1.5" />
                <span>{completingId === primaryActionQuest.id ? "Recording…" : "Mark done"}</span>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="min-h-11 rounded-[16px] border-white/10 bg-[#181B24] hover:bg-white/5 px-4 text-xs font-medium active:scale-[0.98]"
              >
                <Link to="/quests">
                  <span>Manage</span>
                  <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Nothing active
              </span>
              <h4 className="mt-1 text-base sm:text-lg font-semibold text-foreground">
                No commitment active for today.
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Commit to one clear quest to advance your trajectory.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button asChild className="min-h-11 rounded-[16px] bg-white text-black hover:bg-zinc-200 font-semibold shadow-[0_0_14px_rgba(255,255,255,0.15)] px-6 text-xs active:scale-[0.98]">
                <Link to="/quests">
                  <span>Choose Today's Focus</span>
                  <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. Open Activity Ledger (Last 48 Hours) ── */}
      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
              Recent Activity
            </p>
            <h3 className="mt-0.5 text-base font-bold text-foreground">
              Commitment Ledger (Last 48 hours)
            </h3>
          </div>
          <span className="text-xs font-mono tnum text-muted-foreground">
            {recentEvidence48h.length} recorded
          </span>
        </div>

        {recentEvidence48h.length > 0 ? (
          <div className="rounded-[24px] border border-white/10 bg-[#12141A] overflow-hidden shadow-xl specular-top">
            <ul className="divide-y divide-white/[0.06]">
              {visibleActivity.map((q) => {
                const isCompleted = q.completed;
                const timeStr = new Date(deriveResolvedAt(q)).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const dateStr = new Date(deriveResolvedAt(q)).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <li
                    key={q.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[#181B24]/60 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "truncate text-sm block",
                          isCompleted
                            ? "line-through text-muted-foreground/60 font-normal"
                            : "text-foreground font-medium"
                        )}
                      >
                        {q.title}
                      </span>
                    </div>

                    <div className="flex items-center shrink-0 text-xs">
                      <span className="font-mono tnum text-[11px] text-muted-foreground">
                        {dateStr} {timeStr}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>

            {recentEvidence48h.length > 4 && (
              <div className="p-3 border-t border-white/[0.06] bg-[#181B24]/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllActivity((prev) => !prev)}
                  className="w-full h-9 rounded-xl hover:bg-white/5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  {showAllActivity ? (
                    <>
                      <span>Show fewer</span>
                      <ChevronUp className="size-3.5" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <span>Show more ({Math.min(recentEvidence48h.length, 10) - 4} more)</span>
                      <ChevronDown className="size-3.5" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[24px] border border-white/10 bg-[#12141A] p-6 text-center text-xs text-muted-foreground">
            No activity recorded in the last 48 hours. When you complete a commitment, it will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
