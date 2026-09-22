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
      {/* ── Page Header & Narrative Guidance ── */}
      <div className="space-y-2">
        <p className="text-label text-primary font-mono uppercase tracking-wider text-xs">
          Trajectory & Navigation
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Your Path.
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Tracking deliberate progress toward{" "}
          <span className="font-semibold text-foreground">"{profile?.primary_goal}"</span>.
        </p>
        <div className="mt-2 pl-3 border-l-2 border-primary/40 py-1 text-xs sm:text-sm text-foreground/90 font-medium">
          {pace ? (
            pace.isOnTrack ? (
              `Averaging ${pace.actualDailyPace} goal quest${pace.actualDailyPace === 1 ? "" : "s"} a day — on track for completion by ${pace.targetDateFormatted}.`
            ) : (
              `To reach your goal by ${pace.targetDateFormatted}, aim for ${pace.requiredDailyPace} goal quests a day (currently averaging ${pace.actualDailyPace}).`
            )
          ) : (
            `Set an optional target date in your Profile to unlock your velocity telemetry and estimated completion timeline.`
          )}
        </div>
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

      {/* ── 2. Unified Telemetry & Horizon Bar (Zero Nested Cards) ── */}
      <div className="mt-6 rounded-3xl border border-border/80 bg-card/50 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">
          {/* Column A: Velocity & Target Ratio */}
          <div className="p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono font-medium uppercase tracking-wider">
                  <Gauge className="size-4 text-primary" aria-hidden="true" />
                  <span>Velocity vs Target</span>
                </div>
                {pace && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium",
                      pace.isOnTrack
                        ? "bg-success/15 text-success border border-success/30"
                        : "bg-warning/15 text-warning border border-warning/30"
                    )}
                  >
                    {pace.isOnTrack
                      ? `+${(pace.actualDailyPace - pace.requiredDailyPace).toFixed(1)}/day ahead`
                      : `-${(pace.requiredDailyPace - pace.actualDailyPace).toFixed(1)}/day gap`}
                  </span>
                )}
              </div>

              {pace ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-foreground">
                      {pace.actualDailyPace}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      of <strong className="text-foreground font-semibold">{pace.requiredDailyPace}</strong> quests/day needed
                    </span>
                  </div>

                  {/* Connected Comparative Ratio Bar */}
                  <div className="space-y-1.5">
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/80">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          pace.isOnTrack ? "bg-primary" : "bg-warning"
                        )}
                        style={{ width: `${Math.min(Math.round(pace.paceRatio * 100), 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                      <span className="text-foreground font-medium">
                        {Math.round(pace.paceRatio * 100)}% velocity ratio
                      </span>
                      <span>
                        {pace.isOnTrack ? "✓ Meeting schedule" : "⚠️ Pace boost needed"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Set a target date to calculate daily velocity and target ratios.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Observed Window</span>
              <span className="text-foreground">{pace ? `${pace.recentGoalCompleted} quests in ${pace.daysObserved}d` : "No data"}</span>
            </div>
          </div>

          {/* Column B: Timeline & Target Horizon */}
          <div className="p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono font-medium uppercase tracking-wider">
                  <CalendarClock className="size-4 text-primary" aria-hidden="true" />
                  <span>Target Timeline</span>
                </div>
                {pace ? (
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
                ) : (
                  <Badge variant="outline" className="text-[10px] font-mono border-muted-foreground/30 text-muted-foreground">
                    Optional
                  </Badge>
                )}
              </div>

              {pace ? (
                <div className="mt-4">
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                    {pace.targetDateFormatted}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pace.daysRemaining} days remaining in commitment window.
                  </p>
                </div>
              ) : (
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">No target date set</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">Define your milestone in Profile.</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl text-xs shrink-0">
                    <Link to="/profile">
                      <span>Set date</span>
                      <ArrowRight className="size-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Goal Progress</span>
              <span className="font-semibold text-foreground">
                {goalStats.completed} of {goalStats.linked} completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Up Next Commitment (Clean Horizon Bar) ── */}
      <div className="mt-6 rounded-3xl border border-border/80 bg-card/60 p-5 sm:p-6 shadow-sm">
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
                className="min-h-11 rounded-xl border-border hover:bg-accent px-4 text-xs font-medium transition-all"
                title="Shift non-essential quests to tomorrow to protect your momentum"
              >
                <RotateCcw className={`size-3.5 mr-1.5 ${isRecalibrating ? "animate-spin" : ""}`} />
                <span>Reschedule</span>
              </Button>
              <Button
                onClick={() => void handleActionComplete(primaryActionQuest.id)}
                disabled={completingId === primaryActionQuest.id || saving}
                className="min-h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 px-6 text-xs font-semibold transition-all"
              >
                <Check className="size-4 mr-1.5" />
                <span>{completingId === primaryActionQuest.id ? "Recording…" : "Mark done"}</span>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="min-h-11 rounded-xl border-border px-4 text-xs font-medium"
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
              <Button asChild className="min-h-11 rounded-xl bg-foreground text-background px-6 text-xs font-semibold">
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
          <span className="text-xs font-mono text-muted-foreground">
            {recentEvidence48h.length} recorded
          </span>
        </div>

        {recentEvidence48h.length > 0 ? (
          <div className="rounded-3xl border border-border/80 bg-card/40 overflow-hidden shadow-sm">
            <ul className="divide-y divide-border/40">
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
                    className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isCompleted ? (
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/15 text-success border border-success/30">
                          <Check className="size-3.5" aria-hidden="true" />
                        </div>
                      ) : (
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border">
                          <Minus className="size-3.5" aria-hidden="true" />
                        </div>
                      )}

                      <span className="truncate font-medium text-foreground text-sm">
                        {q.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <span
                        className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full ${
                          isCompleted
                            ? "bg-success/10 text-success border border-success/30 font-medium"
                            : "bg-muted text-muted-foreground border border-border/50"
                        }`}
                      >
                        {isCompleted ? "Completed" : "Skipped"}
                      </span>
                      <span className="hidden sm:inline font-mono text-[11px] text-muted-foreground">
                        {dateStr} {timeStr}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>

            {recentEvidence48h.length > 4 && (
              <div className="p-3 border-t border-border/40 bg-muted/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllActivity((prev) => !prev)}
                  className="w-full h-9 rounded-xl hover:bg-muted/40 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
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
          <div className="rounded-3xl border border-border/60 bg-card/30 p-6 text-center text-xs text-muted-foreground">
            No activity recorded in the last 48 hours. When you complete a commitment, it will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
