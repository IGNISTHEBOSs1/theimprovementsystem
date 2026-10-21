import { useState } from "react";
import { Link } from "react-router-dom";
import { Compass, ArrowRight, Check, Plus } from "lucide-react";
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
  isLinkedToActiveGoal,
} from "@/lib/trajectory";
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
      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 sm:px-8 sm:py-10 sm:pb-16 space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-muted/60" />
        <div className="h-80 rounded-3xl bg-muted/60" aria-label="Loading trajectory flight instrument" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="h-44 rounded-2xl bg-muted/60" />
          <div className="h-44 rounded-2xl bg-muted/60" />
          <div className="col-span-2 h-44 rounded-2xl bg-muted/60" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 sm:px-8 sm:py-10 sm:pb-16">
        <section
          className="rounded-3xl border border-border bg-card p-8 shadow-xs text-center"
          aria-label="Trajectory unavailable"
        >
          <Compass className="size-8 mx-auto text-muted-foreground/60 mb-2" />
          <h2 className="text-lg font-bold font-sans text-foreground">
            We couldn't initialize your trajectory telemetry.
          </h2>
          <p className="mt-2 text-sm font-sans text-muted-foreground max-w-md mx-auto">
            Unable to compute trajectory coordinates from stored commitment evidence.
          </p>
          <Button variant="outline" size="sm" className="mt-5 rounded-xl px-5 font-sans" onClick={() => void reload()}>
            Recompute Telemetry
          </Button>
        </section>
      </div>
    );
  }

  const hasGoal = Boolean(profile?.primary_goal);
  if (!hasGoal) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 sm:px-8 sm:py-10 sm:pb-16">
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
  const accuracyPct = goalStats.linked > 0 ? Math.round((goalStats.completed / goalStats.linked) * 100) : 100;

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
    <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 sm:px-8 sm:py-10 sm:pb-16 space-y-6">

      {/* ── ZONE 1: Editorial Header ── */}
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
              90-Day North Star Vector
            </span>
          </div>

          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1 text-xs font-sans font-medium text-foreground hover:bg-muted/50 transition-colors shadow-xs"
          >
            <span>Horizon</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-foreground">
          {profile?.primary_goal}
        </h1>

        <p className="text-sm font-sans text-muted-foreground">
          Day <span className="font-mono font-medium text-foreground tabular-nums">{pace?.elapsedDays ?? 1}</span> of{" "}
          <span className="font-mono tabular-nums">{pace?.cycleTotalDays ?? 90}</span> · Target{" "}
          {pace?.targetDateFormatted ?? "90-Day Cycle"} (
          {pace?.isHorizonExpired || pace?.daysRemaining === 0 ? (
            <span className="text-warning font-medium">Horizon reached</span>
          ) : (
            <span>{pace?.daysRemaining ?? 89}d left</span>
          )}
          )
        </p>
      </header>

      {/* ── ZONE 2: Hero Instrument (Trajectory Plotter) ── */}
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

      {/* ── ZONE 3: Bento Grid ── */}
      <section aria-label="Flight Telemetry Console">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">

          {/* Tile A: Velocity */}
          <div className="col-span-1 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold block">
                Velocity
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-foreground tabular-nums">
                  {pace?.actualDailyPace ?? 0}
                </span>
                <span className="text-xs font-sans text-muted-foreground">/ day</span>
              </div>
              <p className="text-xs font-sans text-muted-foreground mt-0.5">
                Target: 1.0/d ({pace?.requiredDailyPace ?? 1.0}/d catch-up)
              </p>
            </div>

            <div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((pace?.paceRatio ?? 1) * 100))}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-[11px] font-sans text-muted-foreground">
                <span className="font-mono font-medium text-foreground tabular-nums">
                  {Math.round((pace?.paceRatio ?? 1) * 100)}%
                </span>{" "}
                of nominal pace
              </p>
            </div>
          </div>

          {/* Tile B: Flex Buffer */}
          <div className="col-span-1 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold block">
                Flex Buffer
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-foreground tabular-nums">
                  {pace?.bufferDaysRemaining ?? 9}
                </span>
                <span className="text-xs font-sans text-muted-foreground">/ 9 days</span>
              </div>
              <p className="text-xs font-sans text-muted-foreground mt-0.5 truncate">
                {(pace?.horizonExtensionDays ?? 0) > 0
                  ? `+${pace?.horizonExtensionDays}d slip active`
                  : "10% shock absorber"}
              </p>
            </div>

            <div>
              {/* Tactile 9-segment LED Matrix */}
              <div className="grid grid-cols-9 gap-1">
                {Array.from({ length: 9 }).map((_, i) => {
                  const isIntact = i < (pace?.bufferDaysRemaining ?? 9);
                  return (
                    <div
                      key={i}
                      className={cn(
                        "h-2 rounded-xs transition-all",
                        isIntact
                          ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]"
                          : "bg-foreground/15 dark:bg-white/15 border border-border/50",
                      )}
                      title={`Flex Slot ${i + 1}: ${isIntact ? "Intact" : "Absorbed"}`}
                    />
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] font-sans text-muted-foreground truncate">
                {(pace?.bufferDaysRemaining ?? 9) > 0
                  ? `${pace?.bufferDaysRemaining ?? 9} flex days intact`
                  : "Buffer exhausted"}
              </p>
            </div>
          </div>

          {/* Tile C: Evidence Breakdown (Full Width col-span-2) */}
          <div className="col-span-2 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Evidence Breakdown
              </span>
              <span className="text-xs font-sans text-muted-foreground">
                {goalStats.completed} completed · {goalStats.failed} missed (
                <span className="font-mono font-medium text-foreground tabular-nums">
                  {accuracyPct}%
                </span>
                )
              </span>
            </div>

            {priorityBreakdown.length > 0 ? (
              <div className="space-y-3 pt-1">
                {priorityBreakdown.map(({ priority, completed, total }) => {
                  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
                  return (
                    <div key={priority} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-sans font-medium text-foreground">
                          {priority}
                        </span>
                        <span className="font-mono text-muted-foreground tabular-nums">
                          <strong className="text-foreground">{completed}</strong>/{total} · {rate}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-foreground transition-all duration-500"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs font-sans text-muted-foreground py-1">
                Complete daily commitments linked to your North Star to populate evidence weight distribution.
              </p>
            )}
          </div>

          {/* Tile D / Zone 4: Next Vector Action Card (Full Width col-span-2) */}
          <div className="col-span-2 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                TODAY'S ANCHOR
              </span>
              <Link
                to="/quests"
                className="text-xs font-sans font-medium text-muted-foreground hover:text-foreground shrink-0 whitespace-nowrap transition-colors"
              >
                Manage →
              </Link>
            </div>

            {activeGoalQuest ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-sans font-medium text-foreground">
                      {activeGoalQuest.priority}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-500 font-medium flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Queued for Today
                    </span>
                  </div>
                  <p className="text-sm font-sans font-medium text-foreground truncate">
                    {activeGoalQuest.title}
                  </p>
                </div>

                <Button
                  size="sm"
                  disabled={completingId === activeGoalQuest.id}
                  onClick={() => void handleCompleteAnchor(activeGoalQuest.id)}
                  className="rounded-xl px-4 h-9 bg-foreground text-background hover:bg-foreground/90 font-sans font-medium text-xs shrink-0 active:scale-[0.98] transition-all"
                >
                  <Check className="size-3.5 mr-1.5" />
                  {completingId === activeGoalQuest.id ? "Honoring Anchor..." : "Honor Anchor"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-sans font-medium text-foreground">
                    No active anchor queued for today's vector.
                  </p>
                  <p className="text-xs font-sans text-muted-foreground mt-0.5">
                    Lock today's commitment to advance your trajectory toward the 90-anchor horizon.
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-xl px-4 h-9 font-sans font-medium text-xs shrink-0 border-border hover:bg-muted/60 active:scale-[0.98] transition-all"
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
