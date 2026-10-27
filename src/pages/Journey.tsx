import { useState } from "react";
import { Link } from "react-router-dom";
import { Compass, ArrowRight, Check, Plus, ChevronDown, ChevronUp, ShieldCheck, AlertCircle } from "lucide-react";
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
  deriveJourneyPaceDetails,
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
  const [showTechnicalTelemetry, setShowTechnicalTelemetry] = useState(false);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 sm:px-8 sm:py-10 space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-muted/60" />
        <div className="h-80 rounded-3xl bg-muted/60" aria-label="Loading trajectory" />
        <div className="h-44 rounded-2xl bg-muted/60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 sm:px-8 sm:py-10">
        <section
          className="rounded-3xl border border-border bg-card p-8 shadow-xs text-center"
          aria-label="Trajectory unavailable"
        >
          <Compass className="size-8 mx-auto text-muted-foreground/60 mb-2" />
          <h2 className="text-lg font-bold font-sans text-foreground">
            We couldn't load your trajectory.
          </h2>
          <p className="mt-2 text-sm font-sans text-muted-foreground max-w-md mx-auto">
            Unable to compute trajectory from stored commitment history.
          </p>
          <Button variant="outline" size="sm" className="mt-5 rounded-xl px-5 font-sans" onClick={() => void reload()}>
            Try again
          </Button>
        </section>
      </div>
    );
  }

  const hasGoal = Boolean(profile?.primary_goal);
  if (!hasGoal) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 sm:px-8 sm:py-10">
        <PlaceholderExperience
          icon={Compass}
          title="No 90-Day North Star Set."
          message="Your Path plots deterministic trajectory toward a chosen milestone. Set your 90-day North Star goal in your Profile to initiate the trajectory."
        />
      </div>
    );
  }

  const goalStats = deriveGoalStats(state.quests, profile?.primary_goal);
  const trajectory = deriveTrajectory(state.quests, profile?.primary_goal);
  // Fix 6: deriveGoalPace now synthesises a virtual 90-day horizon when
  // targetDate is absent — no longer returns null for missing dates.
  // pace.isVirtualHorizon flags whether to show the soft banner below.
  const pace = deriveGoalPace(
    state.quests,
    profile?.primary_goal_target_date ?? null,
    undefined,
    profile?.primary_goal,
  );

  const priorityBreakdown = derivePriorityBreakdown(state.quests, profile?.primary_goal);
  const accuracyPct = goalStats.linked > 0 ? Math.round((goalStats.completed / goalStats.linked) * 100) : 100;

  const activeGoalQuest = activeQuests.find(
    (q) => isLinkedToActiveGoal(q, profile?.primary_goal) && !q.completed && !q.failed,
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

  // Authoritative pace details derived from trajectory.ts engine
  const paceDetails = deriveJourneyPaceDetails(pace);
  const buffer = pace?.bufferDaysRemaining ?? 9;
  const daysLeft = pace?.daysRemaining ?? 90;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 sm:px-8 sm:py-10 space-y-6">
      {/* ── 1. HEADER (IDENTITY & PURPOSE) ── */}
      <header className="space-y-2 pb-2 border-b border-border/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "size-2 rounded-full",
                paceDetails.badgeVariant === "success"
                  ? "bg-emerald-500"
                  : paceDetails.badgeVariant === "warning"
                  ? "bg-amber-500"
                  : paceDetails.badgeVariant === "destructive"
                  ? "bg-rose-500"
                  : "bg-muted-foreground",
              )}
            />
            <span className="text-xs font-sans font-medium text-muted-foreground">
              North Star Path
            </span>
          </div>

          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1 text-xs font-sans font-medium text-foreground hover:bg-muted/50 transition-colors shadow-xs"
          >
            <span>Goal details</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {profile?.primary_goal}
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground">
          Day <span className="font-mono font-medium text-foreground">{pace?.elapsedDays ?? 1}</span> of{" "}
          <span className="font-mono">{pace?.cycleTotalDays ?? 90}</span> · Target{" "}
          {pace?.targetDateFormatted ?? "90-Day Cycle"} ({daysLeft}d left)
        </p>
      </header>

      {/* ── 2. PLAIN-LANGUAGE STATUS & EXPLANATION (DOMINANT ATTENTION BOX) ── */}
      <section
        aria-label="Pace status"
        className={cn(
          "rounded-2xl border p-5 sm:p-6 shadow-sm transition-all",
          paceDetails.badgeVariant === "success"
            ? "border-emerald-500/30 bg-emerald-500/[0.04]"
            : paceDetails.badgeVariant === "warning"
            ? "border-amber-500/30 bg-amber-500/[0.04]"
            : paceDetails.badgeVariant === "destructive"
            ? "border-destructive/30 bg-destructive/[0.04]"
            : "border-border/60 bg-muted/20",
        )}
      >
        <div className="flex items-center gap-2">
          {paceDetails.badgeVariant === "success" ? (
            <ShieldCheck className="size-5 text-emerald-500 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle
              className={cn(
                "size-5 shrink-0",
                paceDetails.badgeVariant === "warning"
                  ? "text-amber-500"
                  : paceDetails.badgeVariant === "destructive"
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
              aria-hidden="true"
            />
          )}
          <span
            className={cn(
              "text-xs font-sans font-semibold",
              paceDetails.badgeVariant === "success"
                ? "text-emerald-500"
                : paceDetails.badgeVariant === "warning"
                ? "text-amber-500"
                : paceDetails.badgeVariant === "destructive"
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {paceDetails.label}
          </span>
        </div>

        <p className="text-base sm:text-lg font-semibold tracking-tight text-foreground mt-2 leading-snug">
          {paceDetails.explanation}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{goalStats.completed} of 90 anchors completed</span>
          <span>·</span>
          <span>{buffer} of 9 flex days intact</span>
          <span>·</span>
          <span>{daysLeft} days remaining</span>
        </div>
      </section>

      {/* Fix 6: Virtual horizon banner — non-blocking, shown only when no target
          date is set. Chart still renders with estimated 90-day coordinates. */}
      {pace?.isVirtualHorizon && (
        <div
          className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/40 px-3.5 py-2.5 text-xs font-sans text-muted-foreground"
          role="status"
        >
          <span className="mt-0.5 shrink-0">📍</span>
          <span>
            No target date set — showing a{" "}
            <span className="font-medium text-foreground">90-day estimate</span> from today.{" "}
            <Link to="/profile" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Set a date in Profile
            </Link>{" "}
            for accurate tracking.
          </span>
        </div>
      )}

      {/* ── 3. THE VISUAL TRAJECTORY (THE VISUAL PROOF) ── */}
      <section aria-label="Visual Trajectory Chart">
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
          paceStatus={paceDetails.status}
          goalLabel={profile?.primary_goal || undefined}
          cycleTotalDays={pace?.cycleTotalDays ?? 90}
          horizonExtensionDays={pace?.horizonExtensionDays ?? 0}
          isEarlyArrival={pace?.isEarlyArrival ?? false}
        />
      </section>

      {/* ── 4. ONE NEXT ACTION (WHAT TO DO NEXT) ── */}
      <section
        aria-label="Next action for today"
        className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm"
      >
        <span className="text-xs font-sans font-semibold text-muted-foreground block mb-2">
          Next Useful Move
        </span>

        {activeGoalQuest ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="text-xs text-emerald-500 font-medium">Today's Goal Anchor Queued:</span>
              <p className="text-base font-semibold text-foreground mt-0.5 truncate">
                {activeGoalQuest.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Completing this advances your trajectory into the safe buffer zone.
              </p>
            </div>

            <Button
              size="sm"
              disabled={completingId === activeGoalQuest.id}
              onClick={() => void handleCompleteAnchor(activeGoalQuest.id)}
              className="rounded-xl px-5 h-11 bg-foreground text-background hover:bg-foreground/90 font-medium text-xs shrink-0 active:scale-[0.98] transition-all"
            >
              <Check className="size-4 mr-1.5" />
              {completingId === activeGoalQuest.id ? "Recording completion..." : "Complete Today's Focus"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-semibold text-foreground">
                No commitment linked to your goal today.
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Commit to today's primary focus to log evidence toward your 90-anchor horizon.
              </p>
            </div>
            <Button
              asChild
              size="sm"
              className="rounded-xl px-5 h-11 font-medium text-xs shrink-0 active:scale-[0.98] transition-all"
            >
              <Link to="/quests">
                <Plus className="size-4 mr-1.5" />
                Commit to Today's Focus →
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* ── 5. OPTIONAL TECHNICAL TELEMETRY (SUBORDINATED BELOW) ── */}
      <section className="pt-2">
        <button
          type="button"
          onClick={() => setShowTechnicalTelemetry((v) => !v)}
          className="flex items-center justify-between w-full p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors text-xs text-muted-foreground"
          aria-expanded={showTechnicalTelemetry}
        >
          <span className="text-xs font-sans font-medium text-foreground">
            {showTechnicalTelemetry ? "Hide Technical Telemetry" : "View Technical Telemetry & Distribution"}
          </span>
          {showTechnicalTelemetry ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        {showTechnicalTelemetry && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in duration-200">
            {/* Flex Buffer breakdown */}
            <div className="rounded-xl border border-border/80 bg-card p-4 text-xs space-y-2">
              <span className="text-xs font-sans font-semibold text-muted-foreground block">
                Flex Buffer Slots
              </span>
              <div className="grid grid-cols-9 gap-1 pt-1">
                {Array.from({ length: 9 }).map((_, i) => {
                  const isIntact = i < buffer;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "h-2.5 rounded-xs transition-all",
                        isIntact
                          ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]"
                          : "bg-muted-foreground/20 border border-border/50",
                      )}
                      title={`Flex Day ${i + 1}: ${isIntact ? "Intact" : "Used"}`}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                {buffer} of 9 safety margin days intact (±10% mathematical resilience cone).
              </p>
            </div>

            {/* Daily Pace */}
            <div className="rounded-xl border border-border/80 bg-card p-4 text-xs space-y-2">
              <span className="text-xs font-sans font-semibold text-muted-foreground block">
                Daily Completion Velocity
              </span>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-2xl font-mono font-bold text-foreground">
                  {pace?.actualDailyPace ?? 0}
                </span>
                <span className="text-muted-foreground">completions / day</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Target pace: 1.0/day. Catch-up required: {pace?.requiredDailyPace ?? 1.0}/day.
              </p>
            </div>

            {/* Evidence Breakdown */}
            <div className="sm:col-span-2 rounded-xl border border-border/80 bg-card p-4 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-semibold text-muted-foreground">
                  Evidence Breakdown by Priority
                </span>
                <span className="font-mono text-muted-foreground">
                  {goalStats.completed} completed · {goalStats.failed} missed ({accuracyPct}%)
                </span>
              </div>

              {priorityBreakdown.length > 0 ? (
                <div className="space-y-2">
                  {priorityBreakdown.map(({ priority, completed, total }) => {
                    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
                    return (
                      <div key={priority} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">{priority}</span>
                          <span className="font-mono text-muted-foreground">
                            {completed} / {total} · {rate}%
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
                <p className="text-xs text-muted-foreground">
                  Complete goal-linked commitments to populate priority evidence distribution.
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
