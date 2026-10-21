import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Gauge,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  BarChart2,
  Calendar,
  Check,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlaceholderExperience } from "@/components/shared/PlaceholderExperience";
import { TrajectoryVisualizer } from "@/components/journey/TrajectoryVisualizer";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import {
  deriveGoalPace,
  deriveGoalStats,
  deriveTrajectory,
  derivePriorityBreakdown,
  deriveFollowThroughStats,
  isLinkedToActiveGoal,
} from "@/lib/trajectory";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";
import { triggerHaptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

export default function Journey() {
  const { profile } = useAuth();
  const {
    state,
    activeQuests,
    completeQuest,
    loading,
    error,
    reload,
  } = useDashboardDataContext();

  const [completingId, setCompletingId] = useState<string | null>(null);

  // ── Loading / Error / Empty states ──
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10 space-y-5 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-muted/60" />
        <div className="h-80 rounded-3xl bg-muted/60" aria-label="Loading trajectory flight instrument" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-44 rounded-3xl bg-muted/60" />
          <div className="h-44 rounded-3xl bg-muted/60" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
        <section
          className="rounded-3xl border border-border bg-card p-8 shadow-sm text-center"
          aria-label="Trajectory unavailable"
        >
          <Compass className="size-8 mx-auto text-muted-foreground/60 mb-2" />
          <h2 className="text-lg font-bold text-foreground">
            We couldn't initialize your trajectory telemetry.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Unable to compute trajectory coordinates from stored commitment evidence.
          </p>
          <Button variant="outline" size="sm" className="mt-5 rounded-xl px-5" onClick={() => void reload()}>
            Recompute Telemetry
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
          title="No 90-Day North Star Set."
          message="Your Path instrument plots mathematical trajectory toward a specific horizon. Lock your 90-day North Star goal in your Profile to initiate the flight vector."
        />
      </div>
    );
  }

  // ── Mathematical Telemetry Derivation ──
  const goalStats = deriveGoalStats(state.quests, profile?.primary_goal);
  const trajectory = deriveTrajectory(state.quests, profile?.primary_goal);
  const pace = deriveGoalPace(
    state.quests,
    profile?.primary_goal_target_date,
    undefined,
    profile?.primary_goal,
  );

  const priorityBreakdown = derivePriorityBreakdown(state.quests, profile?.primary_goal);
  const followThrough = deriveFollowThroughStats(state.quests);
  const followThroughRate =
    followThrough.total > 0
      ? Math.round((followThrough.completed / followThrough.total) * 100)
      : null;

  const bufferUsed = 9 - (pace?.bufferDaysRemaining ?? 9);

  const activeGoalQuest = activeQuests.find(
    (q) => isLinkedToActiveGoal(q, profile?.primary_goal) && !q.completed && !q.failed
  );

  const handleCompleteAnchor = async (questId: string) => {
    try {
      setCompletingId(questId);
      triggerHaptic("success");
      await completeQuest(questId);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 sm:px-8 sm:py-10 space-y-6">

      {/* ── ZONE 1: Horizon HUD (Header & Mathematical Posture) ── */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                Macro Trajectory Telemetry
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Your Path.
            </h1>
          </div>

          {/* Quick Profile Horizon Link */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-xl h-8 px-3 text-xs text-muted-foreground hover:text-foreground font-mono"
          >
            <Link to="/profile">
              <Calendar className="size-3.5 mr-1.5" />
              <span>Horizon Settings</span>
              <ArrowRight className="size-3 ml-1" />
            </Link>
          </Button>
        </div>

        {/* Goal Framing Banner */}
        <div className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3 sm:px-5 sm:py-3.5 backdrop-blur-md shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block">
              90-Anchor North Star Quota
            </span>
            <p className="text-sm sm:text-base font-bold text-foreground truncate mt-0.5">
              "{profile?.primary_goal}"
            </p>
          </div>

          {/* Key Flight Stats Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] shrink-0">
            <span className="rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 text-muted-foreground">
              Day <strong className="text-foreground">{pace?.elapsedDays ?? 1}</strong> of {pace?.cycleTotalDays ?? 90}
            </span>
            {pace?.isHorizonExpired || pace?.daysRemaining === 0 ? (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-lg h-7 border-warning/50 bg-warning/10 text-warning hover:bg-warning/20 hover:text-warning px-2.5 py-1 text-[11px] font-mono font-semibold"
              >
                <Link to="/profile">
                  Horizon Reached · Extend Target Date →
                </Link>
              </Button>
            ) : (
              <span className="rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 text-muted-foreground">
                Target: <strong className="text-foreground">{pace?.targetDateFormatted ?? "90-Day Cycle"}</strong>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── ZONE 2: The Hero Instrument (Trajectory Plotter) ── */}
      <section aria-label="Trajectory Flight Plotter">
        <TrajectoryVisualizer
          completedQuests={goalStats.completed}
          targetQuests={90}
          elapsedDays={pace?.elapsedDays ?? 1}
          daysRemaining={pace?.daysRemaining ?? 89}
          isHorizonExpired={pace?.isHorizonExpired ?? false}
          actualPoints={trajectory.actual}
          bufferDaysRemaining={pace?.bufferDaysRemaining ?? 9}
          paceRatio={pace?.paceRatio ?? 1.0}
          isOnTrack={pace ? pace.isOnTrack : goalStats.failed === 0}
          goalLabel={profile?.primary_goal || undefined}
          cycleTotalDays={pace?.cycleTotalDays ?? 90}
          horizonExtensionDays={pace?.horizonExtensionDays ?? 0}
          isEarlyArrival={pace?.isEarlyArrival ?? false}
        />
      </section>

      {/* ── ZONE 3: Mathematical Flight Console (Asymmetric Bento Grid) ── */}
      <section aria-label="Flight Telemetry Console" className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Gauge className="size-4 text-primary" aria-hidden="true" />
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Flight Telemetry Console
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Tile A: The 9-Day Flex Buffer Bank */}
          <div className="rounded-3xl border border-border/80 bg-card/80 p-5 sm:p-6 backdrop-blur-xl shadow-[var(--shadow-card)] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                  <ShieldCheck className={cn("size-3.5", (pace?.bufferDaysRemaining ?? 9) > 0 ? "text-emerald-500" : "text-warning")} />
                  <span>±10% Flex Buffer Bank</span>
                </span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {pace?.bufferDaysRemaining ?? 9} / 9 Flex Days
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Kinetic's 10% mathematical shock absorber. First 9 missed days are absorbed without slipping your horizon.
              </p>
            </div>

            {/* Tactile 9-Segment Physical LED Matrix */}
            <div className="space-y-2 py-1">
              <div className="grid grid-cols-9 gap-1.5">
                {Array.from({ length: 9 }).map((_, i) => {
                  const isIntact = i < (pace?.bufferDaysRemaining ?? 9);
                  return (
                    <div
                      key={i}
                      className={cn(
                        "h-7 rounded-md border flex items-center justify-center text-[10px] font-mono transition-all",
                        isIntact
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500 font-semibold"
                          : "bg-muted/40 border-border/60 text-muted-foreground/40",
                      )}
                      title={`Buffer Slot ${i + 1}: ${isIntact ? "Intact" : "Absorbed"}`}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1">
                {(pace?.horizonExtensionDays ?? 0) > 0 ? (
                  <span className="text-warning font-semibold">
                    Buffer Exhausted · Dynamic Extension Active (+{pace?.horizonExtensionDays}d)
                  </span>
                ) : (
                  <>
                    <span>{bufferUsed} flex days absorbed</span>
                    <span className="text-emerald-500 font-medium">
                      {Math.round(((pace?.bufferDaysRemaining ?? 9) / 9) * 100)}% resilience intact
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground shrink-0">Goal Quota</span>
              <span className="text-xs font-mono font-semibold text-foreground shrink-0 whitespace-nowrap">
                90 Completed Anchors
              </span>
            </div>
          </div>

          {/* Tile B: Velocity & Horizon Target Vector */}
          <div className="rounded-3xl border border-border/80 bg-card/80 p-5 sm:p-6 backdrop-blur-xl shadow-[var(--shadow-card)] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Zap className="size-3.5 text-primary" />
                  <span>Velocity Vector</span>
                </span>
                {pace && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-mono font-medium",
                      pace.horizonExtensionDays > 0
                        ? "border-warning/40 bg-warning/10 text-warning"
                        : pace.isEarlyArrival
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-bold"
                        : pace.paceRatio >= 1.1
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                        : pace.isOnTrack
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-warning/40 bg-warning/10 text-warning",
                    )}
                  >
                    {pace.horizonExtensionDays > 0
                      ? `Horizon Slip (+${pace.horizonExtensionDays}d)`
                      : pace.isEarlyArrival
                      ? "Early Arrival Vector"
                      : pace.paceRatio >= 1.1
                      ? "Vector Accelerating"
                      : pace.isOnTrack
                      ? "Nominal Pursuit"
                      : "Thrust Deficit"}
                  </Badge>
                )}
              </div>
              
              <div className="mt-3 flex flex-wrap items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-foreground">
                  {pace?.actualDailyPace ?? 0}
                  <span className="text-base sm:text-lg font-normal text-muted-foreground ml-1">/ day</span>
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  vs <strong className="text-foreground">1.0/day</strong> nominal{" "}
                  <span className="text-muted-foreground/80">
                    ({pace?.requiredDailyPace ?? 1.0}/day required to hit target)
                  </span>
                </span>
              </div>
            </div>

            {/* Velocity Comparison Gauge */}
            <div className="space-y-1.5">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    pace?.isOnTrack ? "bg-foreground" : "bg-warning",
                  )}
                  style={{
                    width: `${Math.min(Math.round((pace?.paceRatio ?? 1) * 100), 100)}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-0.5">
                <span>
                  {Math.round((pace?.paceRatio ?? 1) * 100)}% of nominal rate
                </span>
                <span className={pace?.isOnTrack ? "text-emerald-500" : "text-warning"}>
                  {pace?.isOnTrack ? "✓ On Schedule" : "⚠ Velocity Gap"}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-border/50 text-[11px] font-mono text-muted-foreground flex items-center justify-between">
              <span>Horizon Target:</span>
              <strong className="text-foreground">
                {goalStats.completed} / 90 Anchors ({Math.min(100, Math.round((goalStats.completed / 90) * 100))}%)
              </strong>
            </div>
          </div>

          {/* Tile C: Evidence Weight & Goal Accordance (Full Width) */}
          <div className="md:col-span-2 rounded-3xl border border-border/80 bg-card/80 p-5 sm:p-6 backdrop-blur-xl shadow-[var(--shadow-card)] space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <BarChart2 className="size-4 text-primary shrink-0" aria-hidden="true" />
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                  Trajectory Evidence Attribution
                </h3>
              </div>
              <span className="shrink-0 whitespace-nowrap rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-mono font-medium text-muted-foreground">
                {goalStats.linked} Linked
              </span>
            </div>

            {priorityBreakdown.length > 0 ? (
              <div className="space-y-2.5">
                {priorityBreakdown.map(({ priority, completed, total }) => {
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
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/60">
                          <div
                            className="h-full rounded-full bg-foreground transition-all duration-500"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground w-28 text-right shrink-0">
                        <strong className="text-foreground">{completed}</strong>
                        <span className="text-muted-foreground/60">/{total}</span>
                        <span className="ml-1.5 text-foreground font-semibold">{rate}%</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">
                Complete daily commitments linked to your North Star to populate evidence weight distribution.
              </p>
            )}

            {followThroughRate !== null && (
              <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Target className="size-3.5 text-primary" />
                  <span>Cumulative Goal Follow-Through</span>
                </span>
                <span className="text-foreground font-semibold">
                  {goalStats.completed} completed · {goalStats.failed} missed ·{" "}
                  <strong className={followThroughRate >= 80 ? "text-emerald-500" : "text-foreground"}>
                    {Math.round((goalStats.completed / Math.max(1, goalStats.linked)) * 100)}% Accuracy
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Next Vector Action Card (Direct Execution Actionability) */}
          <div className="md:col-span-2 rounded-3xl border border-border/80 bg-card/80 p-5 sm:p-6 backdrop-blur-xl shadow-[var(--shadow-card)] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Target className="size-3.5 text-primary" />
                <span>Next Vector Action</span>
              </span>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground font-mono"
              >
                <Link to="/quests">
                  <span>Manage Anchors</span>
                  <ArrowRight className="size-3 ml-1" />
                </Link>
              </Button>
            </div>

            {activeGoalQuest ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-2 py-0.5", PRIORITY_BADGE_CLASSES[activeGoalQuest.priority])}
                    >
                      {activeGoalQuest.priority}
                    </Badge>
                    <span className="text-[11px] font-mono text-emerald-500 font-medium flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Queued for Today
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {activeGoalQuest.title}
                  </p>
                </div>

                <Button
                  size="sm"
                  disabled={completingId === activeGoalQuest.id}
                  onClick={() => void handleCompleteAnchor(activeGoalQuest.id)}
                  className="rounded-xl px-4 h-9 bg-foreground text-background hover:bg-foreground/90 font-medium text-xs shrink-0 active:scale-[0.98] transition-all"
                >
                  <Check className="size-3.5 mr-1.5" />
                  {completingId === activeGoalQuest.id ? "Honoring Anchor..." : "Honor Anchor"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    No active anchor queued for today's vector.
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Lock today's commitment to advance your trajectory toward the 90-anchor horizon.
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-xl px-4 h-9 font-medium text-xs shrink-0 border-border hover:bg-muted/60 active:scale-[0.98] transition-all"
                >
                  <Link to="/quests">
                    <Plus className="size-3.5 mr-1.5" />
                    Lock Today's Anchor →
                  </Link>
                </Button>
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
