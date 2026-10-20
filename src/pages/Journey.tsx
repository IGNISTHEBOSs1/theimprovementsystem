import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Check,
  RotateCcw,
  CalendarClock,
  Gauge,
  ArrowRight,
  Target,
  ChevronDown,
  ChevronUp,
  Repeat2,
  BarChart2,
  Activity,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlaceholderExperience } from "@/components/shared/PlaceholderExperience";
import { TrajectoryVisualizer } from "@/components/journey/TrajectoryVisualizer";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import {
  deriveGoalPace,
  deriveGoalStats,
  deriveResolvedAt,
  deriveTrajectory,
  derivePriorityBreakdown,
  deriveSeriesStats,
  deriveFollowThroughStats,
  deriveWeeklyCadence,
} from "@/lib/trajectory";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";
import { triggerHaptic } from "@/lib/haptics";
import { soundEngine } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

/** Compact bar: n filled dots out of total */
function MiniBar({
  value,
  total,
  colorClass,
}: {
  value: number;
  total: number;
  colorClass: string;
}) {
  const filled = Math.min(value, total);
  return (
    <span className="flex gap-[2px] flex-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full",
            i < filled ? colorClass : "bg-muted",
          )}
        />
      ))}
    </span>
  );
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

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
  const [showAllSeries, setShowAllSeries] = useState(false);

  // ── Loading / Error / Empty states ──
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10 space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted/60" aria-label="Loading your journey" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 animate-pulse rounded-2xl bg-muted/60" />
          <div className="h-32 animate-pulse rounded-2xl bg-muted/60" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
        <section
          className="rounded-2xl border border-border bg-card p-7 shadow-sm"
          aria-label="Journey unavailable"
        >
          <p className="text-label text-muted-foreground">Your journey</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">
            We couldn't load your journey.
          </h2>
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

  // ── Derived data ──
  const goalStats = deriveGoalStats(state.quests, profile?.primary_goal);
  const trajectory = deriveTrajectory(state.quests, profile?.primary_goal);
  const pace = deriveGoalPace(
    state.quests,
    profile?.primary_goal_target_date,
    undefined,
    profile?.primary_goal,
  );

  // Cadence: last 7 days
  const cadence = todayStr
    ? deriveWeeklyCadence(
        state.quests,
        todayStr,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      )
    : [];

  // Priority breakdown of actual trajectory evidence
  const priorityBreakdown = derivePriorityBreakdown(trajectory.actual);

  // Series (recurring commitment) stats
  const seriesStats = deriveSeriesStats(state.quests);
  const visibleSeries = showAllSeries ? seriesStats : seriesStats.slice(0, 4);

  // Overall follow-through (not goal-scoped — general reliability)
  const followThrough = deriveFollowThroughStats(state.quests);
  const followThroughRate =
    followThrough.total > 0
      ? Math.round((followThrough.completed / followThrough.total) * 100)
      : null;

  // Activity ledger (last 48 h)
  const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
  const recentEvidence48h = state.quests
    .filter(
      (q) =>
        (q.completed || q.failed) &&
        new Date(deriveResolvedAt(q)).getTime() >= fortyEightHoursAgo,
    )
    .sort((a, b) => deriveResolvedAt(b).localeCompare(deriveResolvedAt(a)));

  const visibleActivity = showAllActivity
    ? recentEvidence48h.slice(0, 10)
    : recentEvidence48h.slice(0, 4);

  // ── Action handlers ──
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
          `Moved ${shiftedCount} secondary commitment${shiftedCount > 1 ? "s" : ""} to tomorrow.`,
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

  // ── Render ──
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6 pb-24 sm:px-8 sm:py-10">

      {/* ── Page Header & Narrative Guidance ── */}
      <header className="mb-6">
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
          Trajectory & Navigation
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Your Path.
        </h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-2xl">
          Tracking deliberate progress toward{" "}
          <span className="font-semibold text-foreground">
            "{profile?.primary_goal}"
          </span>
          .
        </p>
        <div className="mt-3 pl-3 border-l-2 border-primary/40 py-1 text-xs sm:text-sm text-foreground/90 font-medium">
          {pace ? (
            pace.isOnTrack ? (
              `Averaging ${pace.actualDailyPace} goal quest${pace.actualDailyPace === 1 ? "" : "s"} a day — on track for completion by ${pace.targetDateFormatted}.`
            ) : (
              `To reach your goal by ${pace.targetDateFormatted}, aim for ${pace.requiredDailyPace} goal quests a day (currently averaging ${pace.actualDailyPace}).`
            )
          ) : (
            `Set an optional target date in your Profile to unlock velocity telemetry and estimated completion timeline.`
          )}
        </div>
      </header>

      {/* ── 1. 7-Day Cadence Strip ── */}
      {cadence.length > 0 && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/60 px-5 py-3.5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2.5">
            <Activity className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              7-Day Rhythm
            </span>
          </div>
          <div className="flex items-center gap-2">
            {cadence.map((day) => (
              <div key={day.dateStr} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "size-7 rounded-full flex items-center justify-center text-[10px] font-mono font-semibold transition-all",
                    day.isToday
                      ? day.completed
                        ? "bg-foreground text-background ring-2 ring-foreground ring-offset-1 ring-offset-background"
                        : "ring-2 ring-foreground ring-offset-1 ring-offset-background bg-background text-foreground"
                      : day.completed
                      ? "bg-foreground/85 text-background"
                      : "bg-muted/60 text-muted-foreground",
                  )}
                  aria-label={`${day.dateStr}: ${day.completed ? "active" : "no activity"}`}
                >
                  {day.dayLabel}
                </div>
              </div>
            ))}
          </div>
          <span className="text-[11px] font-mono text-muted-foreground shrink-0">
            <strong className="text-foreground">
              {cadence.filter((d) => d.completed).length}
            </strong>
            /7 active
          </span>
        </div>
      )}

      {/* ── 2. Trajectory Visualizer ── */}
      <div className="mt-2">
        <TrajectoryVisualizer
          completedQuests={goalStats.completed}
          targetQuests={72}
          elapsedDays={pace?.elapsedDays ?? 1}
          daysRemaining={pace?.daysRemaining ?? 89}
          actualPoints={trajectory.actual}
          bufferDaysRemaining={pace?.bufferDaysRemaining ?? 18}
          paceRatio={pace?.paceRatio ?? 1.0}
          isOnTrack={pace ? pace.isOnTrack : goalStats.failed === 0}
          goalLabel={profile?.primary_goal || undefined}
          cycleTotalDays={pace?.cycleTotalDays ?? 90}
        />
      </div>

      {/* ── 3. Trajectory Telemetry Console (Bento Grid) ── */}
      <div className="mt-6 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-6 sm:p-7 shadow-[var(--shadow-card)] space-y-6">
        {/* Console header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl border border-border/80 bg-background flex items-center justify-center text-primary shadow-xs">
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
                "rounded-full px-2.5 py-0.5 text-xs font-medium font-mono",
                pace.paceRatio >= 1.1
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                  : pace.isOnTrack
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-warning/40 bg-warning/10 text-warning",
              )}
            >
              {pace.paceRatio >= 1.1
                ? `Ahead · +${(pace.actualDailyPace - pace.requiredDailyPace).toFixed(1)}/day`
                : pace.isOnTrack
                ? `On track · pace aligned`
                : `Behind · -${(pace.requiredDailyPace - pace.actualDailyPace).toFixed(1)}/day gap`}
            </Badge>
          )}
        </div>

        {pace ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            {/* Metric 1: Velocity */}
            <div className="rounded-2xl border border-border/80 bg-muted/40 p-5 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground block">
                  Daily Execution Velocity
                </span>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-foreground">
                    {pace.actualDailyPace}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    /{" "}
                    <strong className="text-foreground font-semibold">
                      {pace.requiredDailyPace}
                    </strong>{" "}
                    anchors/day needed
                  </span>
                </div>
                <div className="mt-4 space-y-1.5">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        pace.isOnTrack ? "bg-foreground" : "bg-warning",
                      )}
                      style={{ width: `${Math.min(Math.round(pace.paceRatio * 100), 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-0.5">
                    <span className="text-foreground font-medium">
                      {Math.round(pace.paceRatio * 100)}% of required pace
                    </span>
                    <span>{pace.isOnTrack ? "✓ On schedule" : "⚠ Boost needed"}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span>🛡</span>
                  <span>{pace.bufferDaysRemaining}/18 flex days intact</span>
                </span>
                <span className="text-foreground font-medium">
                  {pace.recentGoalCompleted} quests in {pace.daysObserved}d window
                </span>
              </div>
            </div>

            {/* Metric 2: Horizon */}
            <div className="rounded-2xl border border-border/80 bg-muted/40 p-5 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground block">
                  Target Horizon & Milestone
                </span>
                <div className="mt-2.5">
                  <h4 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
                    Day {pace.elapsedDays} of {pace.cycleTotalDays}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pace.daysRemaining}d remaining to horizon ({pace.targetDateFormatted})
                  </p>
                </div>
                {/* Cycle progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.round((pace.elapsedDays / pace.cycleTotalDays) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span>
                      {Math.round((pace.elapsedDays / pace.cycleTotalDays) * 100)}% of cycle elapsed
                    </span>
                    <span>
                      {Math.round((pace.completedGoalQuests / pace.targetCycleQuests) * 100)}% of target reached
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>90-Day Mastery</span>
                <span className="text-foreground font-semibold">
                  {pace.completedGoalQuests} of {pace.targetCycleQuests} anchors (
                  {Math.min(100, Math.round((pace.completedGoalQuests / pace.targetCycleQuests) * 100))}
                  %)
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* No target date set */
          <div className="rounded-2xl border border-border/80 bg-muted/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <h4 className="text-base font-semibold text-foreground">No target milestone set</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Set a target date in Profile to unlock predictive velocity ratios and pace tracking.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl text-xs shrink-0 min-h-10"
            >
              <Link to="/profile">
                <span>Set milestone</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        )}

        {/* ── Goal stats inline summary ── */}
        <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-border/40 text-[11px] font-mono text-muted-foreground">
          <span>
            Goal-linked quests:{" "}
            <strong className="text-foreground">{goalStats.linked}</strong>
          </span>
          <span>
            Completed:{" "}
            <strong className="text-success">{goalStats.completed}</strong>
          </span>
          <span>
            Missed:{" "}
            <strong className={goalStats.failed > 0 ? "text-warning" : "text-foreground"}>
              {goalStats.failed}
            </strong>
          </span>
          {goalStats.linked > 0 && (
            <span>
              Hit rate:{" "}
              <strong className="text-foreground">
                {Math.round((goalStats.completed / goalStats.linked) * 100)}%
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* ── 4. Priority Breakdown ── */}
      {priorityBreakdown.length > 0 && (
        <div className="mt-6 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-6 sm:p-7 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="size-8 rounded-xl border border-border/80 bg-background flex items-center justify-center text-primary shadow-xs">
              <BarChart2 className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Evidence Breakdown
              </p>
              <h3 className="text-sm font-bold text-foreground">What's moving the line</h3>
            </div>
          </div>

          <div className="space-y-3">
            {priorityBreakdown.map(({ priority, completed, failed }) => {
              const total = completed + failed;
              const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div key={priority} className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn("shrink-0 text-[11px] w-20 justify-center", PRIORITY_BADGE_CLASSES[priority])}
                  >
                    {priority}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground transition-all duration-500"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground w-28 text-right shrink-0">
                    <strong className="text-foreground">{completed}</strong>
                    <span className="text-muted-foreground/60">/{total}</span>
                    <span className="ml-1.5 text-foreground">{rate}%</span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Follow-through footer */}
          {followThroughRate !== null && (
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>Overall follow-through (all quests)</span>
              <span className="text-foreground font-semibold">
                {followThrough.completed}/{followThrough.total} ·{" "}
                <strong
                  className={
                    followThroughRate >= 80
                      ? "text-success"
                      : followThroughRate >= 60
                      ? "text-foreground"
                      : "text-warning"
                  }
                >
                  {followThroughRate}%
                </strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── 5. Recurring Series Consistency ── */}
      {seriesStats.length > 0 && (
        <div className="mt-6 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-6 sm:p-7 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl border border-border/80 bg-background flex items-center justify-center text-primary shadow-xs">
                <Repeat2 className="size-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  Recurring Commitments
                </p>
                <h3 className="text-sm font-bold text-foreground">Series Consistency</h3>
              </div>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              {seriesStats.length} active
            </span>
          </div>

          <div className="divide-y divide-border/40">
            {visibleSeries.map((s) => {
              const rate = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
              return (
                <div
                  key={s.seriesId}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <MiniBar
                        value={s.completed}
                        total={Math.min(s.total, 10)}
                        colorClass="bg-foreground/80"
                      />
                      {s.failed > 0 && (
                        <MiniBar
                          value={s.failed}
                          total={Math.min(s.total, 10)}
                          colorClass="bg-muted-foreground/30"
                        />
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={cn(
                        "text-sm font-bold font-mono",
                        rate >= 80
                          ? "text-success"
                          : rate >= 60
                          ? "text-foreground"
                          : "text-warning",
                      )}
                    >
                      {rate}%
                    </span>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {s.completed}/{s.total}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {seriesStats.length > 4 && (
            <div className="mt-3 pt-3 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllSeries((prev) => !prev)}
                className="w-full h-9 rounded-xl hover:bg-muted/40 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
              >
                {showAllSeries ? (
                  <>
                    <span>Show fewer</span>
                    <ChevronUp className="size-3.5" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    <span>Show {seriesStats.length - 4} more</span>
                    <ChevronDown className="size-3.5" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── 6. Up Next Commitment ── */}
      <div className="mt-6 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]">
        {primaryActionQuest ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={PRIORITY_BADGE_CLASSES[primaryActionQuest.priority]}
                >
                  {primaryActionQuest.priority}
                </Badge>
                <span className="font-mono text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                  Up next on path
                </span>
              </div>
              <h4 className="mt-1.5 text-lg sm:text-xl font-bold text-foreground line-clamp-2 break-words leading-snug">
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
                title="Shift non-essential quests to tomorrow"
              >
                <RotateCcw
                  className={`size-3.5 mr-1.5 ${isRecalibrating ? "animate-spin" : ""}`}
                />
                <span>Reschedule</span>
              </Button>
              <Button
                onClick={() => void handleActionComplete(primaryActionQuest.id)}
                disabled={completingId === primaryActionQuest.id || saving}
                className="min-h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 px-6 text-xs font-semibold transition-all"
              >
                <Check className="size-4 mr-1.5" />
                <span>
                  {completingId === primaryActionQuest.id ? "Recording…" : "Mark done"}
                </span>
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
              <Button
                asChild
                className="min-h-11 rounded-xl bg-foreground text-background px-6 text-xs font-semibold"
              >
                <Link to="/quests">
                  <span>Choose Today's Focus</span>
                  <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── 7. Activity Ledger (Last 48 Hours) ── */}
      <div className="mt-8 space-y-3">
        <div className="flex items-start justify-between gap-4 px-1">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">
              Recent Activity
            </p>
            <h3 className="text-base font-bold text-foreground">
              Commitment Ledger (Last 48 hours)
            </h3>
          </div>
          <span className="shrink-0 whitespace-nowrap text-xs font-mono text-muted-foreground">
            {recentEvidence48h.length} recorded
          </span>
        </div>

        {recentEvidence48h.length > 0 ? (
          <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card overflow-hidden shadow-[var(--shadow-card)]">
            <ul className="divide-y divide-border/40">
              {visibleActivity.map((q) => {
                const isCompleted = q.completed;
                const resolved = new Date(deriveResolvedAt(q));
                const timeStr = resolved.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const dateStr = resolved.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <li
                    key={q.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Outcome dot */}
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          isCompleted ? "bg-success" : "bg-muted-foreground/40",
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={cn(
                          "line-clamp-2 break-words leading-snug text-sm block",
                          isCompleted
                            ? "line-through text-muted-foreground/60 font-normal"
                            : "text-foreground font-medium",
                        )}
                      >
                        {q.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {q.linkedToGoal && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-mono text-primary"
                          title="Linked to goal"
                        >
                          <Target className="size-2.5" />
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-muted-foreground">
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
                      <span>
                        Show more ({Math.min(recentEvidence48h.length, 10) - 4} more)
                      </span>
                      <ChevronDown className="size-3.5" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-border/60 bg-card/30 p-6 text-center text-xs text-muted-foreground">
            No activity recorded in the last 48 hours. When you complete a commitment, it
            will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
