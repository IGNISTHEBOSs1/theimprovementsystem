import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Check,
  Minus,
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
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { deriveGoalPace, deriveGoalStats, deriveResolvedAt } from "@/lib/trajectory";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";
import { triggerHaptic } from "@/lib/haptics";
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
        <div className="h-72 animate-pulse rounded-2xl bg-muted/60" aria-label="Loading your journey" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
        <section className="rounded-2xl border border-border bg-card p-7 shadow-sm" aria-label="Journey unavailable">
          <p className="text-label text-muted-foreground">Your journey</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">We couldn't load your journey.</h2>
          <p className="mt-2 text-body-md text-muted-foreground">
            This is usually temporary. Try again now.
          </p>
          <Button variant="neon" size="lg" className="mt-4" onClick={() => void reload()}>
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

    try {
      const { shiftedCount, error: recalibrateError } = await recalibrateSchedule();
      if (recalibrateError) {
        toast.error("Reschedule failed. Please try again.");
      } else if (shiftedCount > 0) {
        triggerHaptic("success");
        toast.success(
          `Moved ${shiftedCount} secondary commitment${
            shiftedCount > 1 ? "s" : ""
          } to tomorrow to keep your focus clear.`
        );
      } else {
        toast.info("Nothing to reschedule — only your main commitments remain for today.");
      }
    } catch {
      toast.error("Could not reschedule commitments.");
    } finally {
      setIsRecalibrating(false);
    }
  };

  const handleActionComplete = async (questId: string) => {
    setCompletingId(questId);
    triggerHaptic("success");
    await completeQuest(questId);
    setCompletingId(null);
    toast.success("Action recorded. Keep going!");
  };

  const primaryActionQuest = activeQuests[0];

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6 pb-6 sm:px-8 sm:py-10">
      {/* ── Page Header ── */}
      <div>
        <p className="hidden md:block text-label text-primary mb-1">
          Your progress
        </p>
        <h1 className="text-display-lg text-foreground">Your journey.</h1>
        <p className="mt-1 text-body-md text-muted-foreground">
          Tracking your path toward "{profile?.primary_goal}".
        </p>
      </div>

      {/* ── Summary Banner ── */}
      <div className="mt-6 rounded-2xl p-4 sm:p-5 glass-hero border border-primary/25 relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
              Summary
            </p>
            <p className="mt-1 text-sm sm:text-base font-medium leading-relaxed text-foreground">
              {pace ? (
                pace.isOnTrack ? (
                  `You're averaging ${pace.actualDailyPace} goal quest${pace.actualDailyPace === 1 ? "" : "s"} a day, on track to reach your goal by ${pace.targetDateFormatted}.`
                ) : (
                  `To reach your goal by ${pace.targetDateFormatted}, aim for ${pace.requiredDailyPace} goal quests a day (you're currently averaging ${pace.actualDailyPace}).`
                )
              ) : (
                `You are working toward "${profile?.primary_goal}". Set an optional target date in your Profile to see your estimated completion date and daily pace.`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── ASYMMETRICAL BENTO GRID ── */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ── CARD 1 (Top, Full Width): The Trajectory Visualizer ── */}
        <div className="col-span-1 md:col-span-2">
          <TrajectoryVisualizer
            completedQuests={goalStats.completed}
            targetQuests={goalStats.linked}
            isOnTrack={pace ? pace.isOnTrack : goalStats.failed === 0}
            goalLabel={profile?.primary_goal || undefined}
          />
        </div>

        {/* ── CARD 2: Merged Target Date & Goal Progress ── */}
        <div
          className={`rounded-2xl p-5 sm:p-6 border border-border bg-card shadow-[var(--shadow-card)] flex flex-col justify-between ${
            pace ? "col-span-1" : "col-span-1 md:col-span-2"
          }`}
        >
          {pace ? (
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono font-medium uppercase tracking-wider">
                  <CalendarClock className="size-4 text-primary" aria-hidden="true" />
                  <span>Target timeline</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono uppercase ${
                    pace.paceRatio >= 1.1
                      ? "border-success/30 bg-success/10 text-success"
                      : pace.isOnTrack
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-warning/30 bg-warning/10 text-warning"
                  }`}
                >
                  {pace.paceRatio >= 1.1
                    ? "Ahead of pace"
                    : pace.isOnTrack
                    ? "On track"
                    : "Behind pace"}
                </Badge>
              </div>

              <h3 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {pace.targetDateFormatted}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {pace.paceRatio >= 1.1
                  ? "Your steady pace puts you comfortably ahead of schedule."
                  : pace.isOnTrack
                  ? `You're on track to reach your goal with ${pace.daysRemaining} days remaining.`
                  : `${pace.daysRemaining} days remaining. Focus on your goal commitments to stay on track.`}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono font-medium uppercase tracking-wider">
                  <CalendarClock className="size-4 text-primary" aria-hidden="true" />
                  <span>Target date</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-muted-foreground/30 text-muted-foreground">
                  Optional
                </Badge>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    No target date set
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Set a target date in your Profile to see your estimated timeline and daily pace.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-xl text-xs shrink-0 self-start sm:self-auto">
                  <Link to="/profile">
                    <span>Set target date</span>
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Goal-progress numbers (below target-date status/input in the same card) */}
          <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Goal progress:</span>
              <span className="font-mono font-semibold text-foreground">
                {goalStats.completed} of {goalStats.linked} completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Remaining:</span>
              <span className="font-mono font-medium text-foreground">
                {Math.max(0, goalStats.linked - goalStats.completed - goalStats.failed)} active
              </span>
            </div>
          </div>
        </div>

        {/* ── CARD 3 (Half Width): Your Pace (Only rendered when pace exists) ── */}
        {pace && (
          <div className="rounded-2xl p-5 sm:p-6 border border-border bg-card shadow-[var(--shadow-card)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono font-medium uppercase tracking-wider">
                  <Gauge className="size-4 text-primary" aria-hidden="true" />
                  <span>Telemetry & Pace</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono ${
                    pace.isOnTrack
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-warning/30 bg-warning/10 text-warning"
                  }`}
                >
                  {Math.round(pace.paceRatio * 100)}% of required pace
                </Badge>
              </div>

              {/* Connected Velocity & Pace Module (Relational Anchor - No Mental Math) */}
              <div className="mt-4 rounded-xl border border-border/70 bg-card/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                      Daily Velocity vs Target
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                        {pace.actualDailyPace}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        of <strong className="text-foreground font-semibold">{pace.requiredDailyPace}</strong> quests/day needed
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium",
                        pace.isOnTrack
                          ? "bg-success/15 text-success border border-success/30"
                          : "bg-warning/15 text-warning border border-warning/30"
                      )}
                    >
                      {pace.isOnTrack
                        ? `+${(pace.actualDailyPace - pace.requiredDailyPace).toFixed(1)}/day ahead`
                        : `-${(pace.requiredDailyPace - pace.actualDailyPace).toFixed(1)}/day gap`}
                    </span>
                  </div>
                </div>

                {/* Connected Comparative Ratio Bar with 100% Benchmark Notch */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/80">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        pace.isOnTrack ? "bg-primary" : "bg-warning"
                      )}
                      style={{ width: `${Math.min(Math.round(pace.paceRatio * 100), 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span className="text-foreground/90 font-medium">
                      {Math.round(pace.paceRatio * 100)}% velocity ratio
                    </span>
                    <span>
                      {pace.isOnTrack ? "✓ Meeting schedule" : "⚠️ Pace boost needed"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Supporting Telemetry Context (Dual Compact Strip) */}
              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-border/60 bg-card/40 p-2.5 flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Observed Output</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-base font-bold font-mono text-primary">{pace.recentGoalCompleted}</span>
                    <span className="text-[10px] text-muted-foreground">quests / {pace.daysObserved}d window</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-card/40 p-2.5 flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Remaining Window</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-base font-bold font-mono text-foreground">{pace.daysRemaining}</span>
                    <span className="text-[10px] text-muted-foreground">days to target</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Calibration</span>
              <span className="font-mono text-[11px] text-foreground">
                {pace.daysRemaining} days remaining in window
              </span>
            </div>
          </div>
        )}

        {/* ── CARD 4 (Full Width): Next Immediate Action ── */}
        <div className="col-span-1 md:col-span-2 rounded-2xl p-5 sm:p-6 border border-primary/25 bg-card shadow-[var(--shadow-card)]">
          {primaryActionQuest ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={PRIORITY_BADGE_CLASSES[primaryActionQuest.priority]}>
                    {primaryActionQuest.priority}
                  </Badge>
                  <span className="font-mono text-[10px] text-primary uppercase font-bold tracking-wider">
                    Up next
                  </span>
                </div>
                <h4 className="mt-1.5 text-lg sm:text-xl font-bold text-foreground truncate">
                  {primaryActionQuest.title}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Completing this keeps you on track toward your goal.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isRecalibrating || saving}
                  onClick={handleOneTapBump}
                  className="min-h-11 rounded-2xl border-border/80 bg-card/70 hover:bg-accent px-4 text-xs font-medium backdrop-blur-md shadow-sm transition-all"
                  title="Shift non-essential quests to tomorrow to protect your momentum"
                >
                  <RotateCcw className={`size-3.5 mr-1.5 ${isRecalibrating ? "animate-spin" : ""}`} />
                  <span>Reschedule</span>
                </Button>
                <Button
                  onClick={() => void handleActionComplete(primaryActionQuest.id)}
                  disabled={completingId === primaryActionQuest.id || saving}
                  className="min-h-11 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 px-6 text-xs font-semibold shadow-[0_4px_16px_hsl(var(--primary)/0.3)] transition-all"
                >
                  <Check className="size-4 mr-1.5" />
                  <span>{completingId === primaryActionQuest.id ? "Recording…" : "Mark done"}</span>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="min-h-11 rounded-2xl border-white/[0.1] bg-card/60 px-4 text-xs font-medium"
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
                  Pick one clear quest to focus on today.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isRecalibrating || saving}
                  onClick={handleOneTapBump}
                  className="min-h-11 rounded-2xl border-border/80 bg-card/70 hover:bg-accent px-4 text-xs font-medium backdrop-blur-md shadow-sm transition-all"
                  title="Shift non-essential quests to tomorrow to protect your momentum"
                >
                  <RotateCcw className={`size-3.5 mr-1.5 ${isRecalibrating ? "animate-spin" : ""}`} />
                  <span>Reschedule</span>
                </Button>
                <Button asChild className="min-h-11 rounded-2xl bg-primary text-primary-foreground px-6 text-xs font-semibold">
                  <Link to="/quests">
                    <span>Choose Today's Focus</span>
                    <ArrowRight className="size-4 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. RECENT ACTIVITY (LAST 48 HOURS ONLY) ── */}
      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-label text-muted-foreground">Recent activity</p>
            <h3 className="mt-0.5 text-sm font-semibold text-foreground">
              Recent commitments (last 48 hours)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {recentEvidence48h.length} recorded
          </span>
        </div>

        <div className="mt-3">
          {recentEvidence48h.length > 0 ? (
            <>
              <ul className="space-y-2">
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
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-body-sm transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Neutral Icons: Checkmark for completed, Neutral Dash for skipped */}
                        {isCompleted ? (
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success border border-success/20">
                            <Check className="size-3.5" aria-hidden="true" />
                          </div>
                        ) : (
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground border border-border/60">
                            <Minus className="size-3.5" aria-hidden="true" />
                          </div>
                        )}

                        <span className="truncate font-medium text-foreground text-sm">
                          {q.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 text-xs">
                        <span
                          className={`font-mono text-[11px] px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? "bg-success/10 text-success border border-success/20 font-medium"
                              : "bg-muted text-muted-foreground border border-border/40"
                          }`}
                        >
                          {isCompleted ? "Completed" : "Skipped"}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {dateStr} {timeStr}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Progressive disclosure toggle: show 4 initially, max 10 in dropdown */}
              {recentEvidence48h.length > 4 && (
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllActivity((prev) => !prev)}
                    className="w-full h-9 rounded-xl border border-border/70 hover:bg-muted/40 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
                  >
                    {showAllActivity ? (
                      <>
                        <span>Show fewer</span>
                        <ChevronUp className="size-3.5" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        <span>
                          Show more ({Math.min(recentEvidence48h.length, 10) - 4} more)
                        </span>
                        <ChevronDown className="size-3.5" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Cap explanation if there are more than 10 */}
              {showAllActivity && recentEvidence48h.length > 10 && (
                <div className="mt-2.5 text-center">
                  <Link
                    to="/history"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span>Showing 10 of {recentEvidence48h.length}. View full history in Quest History</span>
                    <ArrowRight className="size-3" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-5 text-center text-xs text-muted-foreground">
              No activity recorded in the last 48 hours. When you complete a commitment, it will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
