import { useState } from "react";
import { MessageSquare, Sprout, Compass, RotateCcw, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { cn } from "@/lib/utils";
import { PlaceholderExperience } from "@/components/shared/PlaceholderExperience";
import { AutoRebalanceModal } from "@/components/mentor/AutoRebalanceModal";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { deriveGuidance } from "@/lib/guidance";
import { deriveInsights } from "@/lib/insights";
import { deriveTrajectory } from "@/lib/trajectory";
import { computeRebalanceProposal } from "@/lib/rebalance";

const GUIDANCE_CATEGORY_LABELS: Record<string, string> = {
  "repeated-commitment": "Repeating habit",
  "weekday-miss-pattern": "Day pattern",
  "series-reliability": "Repeating quest",
  "goal-linkage-gap": "Goal link",
  "recovery-after-miss": "Bouncing back",
  "trajectory-position": "Direction",
  "priority-completion-pattern": "Priority",
};

interface RankedItem {
  key: string;
  categoryLabel: string;
  observation: string;
  evidence?: string;
  interpretation?: string;
  adjustment?: string;
  strength: number;
}

const MAX_SURFACED_INSIGHTS = 4;

export default function Mentor() {
  const { profile } = useAuth();
  const { state, loading, error, reload } = useDashboardDataContext();
  const [rebalanceOpen, setRebalanceOpen] = useState(false);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-[calc(112px+env(safe-area-inset-bottom,0px))] sm:px-8 sm:py-10 sm:pb-12">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" aria-label="Loading your mentor" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-[calc(112px+env(safe-area-inset-bottom,0px))] sm:px-8 sm:py-10 sm:pb-12">
        <section className="rounded-3xl border border-border bg-card p-7" aria-label="Mentor unavailable">
          <p className="text-label text-muted-foreground">Mentor</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">We couldn't load your history.</h2>
          <p className="mt-2 text-body-md text-muted-foreground">This is usually temporary. You can try again now.</p>
          <Button
            size="lg"
            onClick={() => void reload()}
            className="mt-4 min-h-11"
          >
            Try again
          </Button>
        </section>
      </div>
    );
  }

  const guidance = deriveGuidance(state.quests, profile?.timezone || "UTC");
  const insights = deriveInsights(state.quests);
  const trajectory = deriveTrajectory(state.quests);

  const recurring = insights.find((i) => i.id === "recurring-friction");
  const momentum = insights.find((i) => i.id === "momentum");
  const recovery = guidance.find((g) => g.id === "recovery-after-miss");
  const hasTrajectory = trajectory.actual.length > 0;
  const rebalanceProposal = computeRebalanceProposal(state.quests, profile?.timezone || "UTC");

  const currentHour = new Date().getHours();
  const isEvening = currentHour >= 18 || currentHour < 4;
  const leadWithRecovery = Boolean(recovery) && isEvening;

  const isRecurringHero = Boolean(recurring);
  const isRecoveryHero = !isRecurringHero && leadWithRecovery && Boolean(recovery);
  const isMomentumHero = !isRecurringHero && !isRecoveryHero && Boolean(momentum);

  const showTrajectoryCard = hasTrajectory;
  const showRecoveryCard = Boolean(recovery) && !isRecoveryHero;
  const showMomentumCard = Boolean(momentum) && !isMomentumHero;

  const signalCardsCount = (showTrajectoryCard ? 1 : 0) + (showRecoveryCard ? 1 : 0) + (showMomentumCard ? 1 : 0);
  const hasHero = isRecurringHero || isRecoveryHero || isMomentumHero;
  const anyGridSlot = hasHero || signalCardsCount > 0;

  const usedInGrid = new Set([
    isRecurringHero ? "insight-recurring-friction" : null,
    isRecurringHero ? "guidance-series-reliability" : null,
    isRecurringHero ? "guidance-repeated-commitment" : null,
    isRecoveryHero || showRecoveryCard ? "guidance-recovery-after-miss" : null,
    isMomentumHero || showMomentumCard ? "insight-momentum" : null,
    showTrajectoryCard ? "guidance-trajectory-position" : null,
    // If richer insight-goal-alignment exists, suppress the single-line guidance-goal-linkage-gap duplicate
    insights.some((i) => i.id === "goal-alignment") ? "guidance-goal-linkage-gap" : null,
  ].filter(Boolean));

  const pool: RankedItem[] = [
    ...guidance.map((g): RankedItem => ({
      key: `guidance-${g.id}`,
      categoryLabel: GUIDANCE_CATEGORY_LABELS[g.id] ?? "Pattern",
      observation: g.text,
      strength: g.strength,
    })),
    ...insights.map((i): RankedItem => ({
      key: `insight-${i.id}`,
      categoryLabel: i.categoryLabel,
      observation: i.observation,
      evidence: i.evidence,
      interpretation: i.interpretation,
      adjustment: i.adjustment,
      strength: i.strength,
    })),
  ].filter((item) => !usedInGrid.has(item.key));
  const surfaced = [...pool].sort((a, b) => b.strength - a.strength).slice(0, MAX_SURFACED_INSIGHTS);

  if (!anyGridSlot && surfaced.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-[calc(112px+env(safe-area-inset-bottom,0px))] sm:px-8 sm:py-10 sm:pb-12">
        <PlaceholderExperience
          icon={MessageSquare}
          title="No clear pattern yet."
          message="As you complete and miss more quests, your mentor will point out what's happening."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-8 sm:px-8 sm:py-10 sm:pb-12">
      <PageHeader
        eyebrow="Mentor"
        title="Your patterns."
        description="What works and where you get stuck, based on what you actually do."
      />

      {/* ── 1. Executive Advisory Briefing (Zero Nested Cards) ── */}
      {hasHero && (
        <div className="mt-6">
          {recurring && (
            <section
              aria-labelledby="primary-insight-heading"
              className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                  Executive Briefing • Primary Pattern
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  Behavioral Analysis
                </span>
              </div>

              <h2
                id="primary-insight-heading"
                className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug"
              >
                {recurring.observation}
              </h2>

              {/* Supporting Evidence — Clean 2-Tone Ratio Bar */}
              {recurring.ratio ? (
                (() => {
                  const recurringMissed = recurring.ratio.value;
                  const totalMissed = recurring.ratio.total;
                  const oneOffMissed = Math.max(0, totalMissed - recurringMissed);
                  const recurringPct = totalMissed > 0 ? Math.round((recurringMissed / totalMissed) * 100) : 0;
                  const oneOffPct = 100 - recurringPct;

                  return (
                    <div className="pt-2 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-medium text-foreground">Where misses happen</span>
                        <span className="text-muted-foreground">{totalMissed} total misses</span>
                      </div>

                      {/* 2-Tone Segmented Ratio Bar */}
                      <div
                        className="h-2.5 w-full overflow-hidden rounded-full bg-muted flex"
                        role="progressbar"
                        aria-valuenow={recurringPct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Miss breakdown: ${recurringPct}% repeating, ${oneOffPct}% one-time`}
                      >
                        <div
                          className="bg-primary transition-[width] duration-500 rounded-l-full"
                          style={{ width: `${recurringPct}%` }}
                          title={`Repeating: ${recurringPct}%`}
                        />
                        <div
                          className="bg-muted-foreground/30 transition-[width] duration-500 rounded-r-full"
                          style={{ width: `${oneOffPct}%` }}
                          title={`One-time: ${oneOffPct}%`}
                        />
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
                          <span className="font-semibold text-foreground">Repeating series</span>
                          <span className="text-muted-foreground">({recurringMissed} • {recurringPct}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-muted-foreground/40 shrink-0" aria-hidden="true" />
                          <span className="text-muted-foreground">One-time quests</span>
                          <span className="text-muted-foreground">({oneOffMissed} • {oneOffPct}%)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {recurring.evidence}
                </div>
              )}

              {/* Seamless Recommendation Accent (No Nested Card Box) */}
              {recurring.adjustment && (
                <div className="flex items-start gap-3 rounded-2xl bg-muted/40 p-4 border-l-2 border-primary text-xs sm:text-sm">
                  <Sparkles className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-foreground">Recommended adjustment: </span>
                    <span className="text-muted-foreground">{recurring.adjustment}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                {rebalanceProposal ? (
                  <>
                    <Button
                      size="sm"
                      className="w-full sm:w-auto min-h-11"
                      onClick={() => setRebalanceOpen(true)}
                    >
                      <RotateCcw className="mr-1.5 size-3.5" aria-hidden="true" />
                      Change days
                    </Button>
                    <Button asChild size="sm" variant="outline" className="w-full sm:w-auto min-h-11">
                      <Link to="/quests">Manage quests</Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild size="sm" className="w-full sm:w-auto min-h-11">
                    <Link to="/quests">See repeating quests</Link>
                  </Button>
                )}
              </div>
            </section>
          )}

          {isRecoveryHero && recovery && (
            <section
              aria-labelledby="primary-insight-heading"
              className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                  Your focus right now • Bouncing back
                </span>
              </div>
              <h2
                id="primary-insight-heading"
                className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug"
              >
                {recovery.text}
              </h2>
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <Button asChild size="sm" className="w-full sm:w-auto min-h-11">
                  <Link to="/quests">Commit to today's focus →</Link>
                </Button>
              </div>
            </section>
          )}

          {isMomentumHero && momentum && (
            <section
              aria-labelledby="primary-insight-heading"
              className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                  Executive Briefing • Momentum
                </span>
                {momentum.comparison && (
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono font-medium",
                    momentum.comparison.delta >= 0
                      ? "bg-success/15 text-success border border-success/30"
                      : "bg-warning/15 text-warning border border-warning/30"
                  )}>
                    {momentum.comparison.delta >= 0 ? "+" : ""}{Math.round(momentum.comparison.delta * 100)}% shift
                  </span>
                )}
              </div>
              <h2
                id="primary-insight-heading"
                className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug"
              >
                {momentum.observation}
              </h2>
              {momentum.comparison && (
                <div className="pt-2 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-medium text-foreground">Goal quest finish rate</span>
                    <span className="text-muted-foreground">
                      {momentum.comparison.recentCompleted}/{momentum.comparison.recentTotal} recent
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-medium text-foreground">Recent</span>
                      <span className="text-foreground font-semibold">
                        {Math.round(momentum.comparison.recentRate * 100)}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary rounded-full transition-[width] duration-500"
                        style={{ width: `${Math.round(momentum.comparison.recentRate * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Earlier</span>
                      <span className="text-muted-foreground">
                        {Math.round(momentum.comparison.previousRate * 100)}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-muted-foreground/40 rounded-full transition-[width] duration-500"
                        style={{ width: `${Math.round(momentum.comparison.previousRate * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {momentum.adjustment && (
                <div className="flex items-start gap-3 rounded-2xl bg-muted/40 p-4 border-l-2 border-primary text-xs sm:text-sm">
                  <Sparkles className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-foreground">Recommended adjustment: </span>
                    <span className="text-muted-foreground">{momentum.adjustment}</span>
                  </div>
                </div>
              )}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <Button asChild size="sm" className="w-full sm:w-auto min-h-11">
                  <Link to="/journey">View trajectory →</Link>
                </Button>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── 2. Unified Telemetry Band (Zero Stacked Cards) ── */}
      {signalCardsCount > 0 && (
        <div className="mt-6 rounded-3xl border border-border/80 bg-card/50 overflow-hidden shadow-sm">
          <div className={cn(
            "grid divide-y md:divide-y-0 divide-border/60",
            signalCardsCount === 1 ? "grid-cols-1" :
            signalCardsCount === 2 ? "grid-cols-1 md:grid-cols-2 md:divide-x" :
            "grid-cols-1 md:grid-cols-3 md:divide-x"
          )}>
            {/* Tile A: Trajectory Direction & Score */}
            {showTrajectoryCard && (
              <div className="p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono font-medium uppercase tracking-wider">
                      <Compass className="size-4 text-primary" aria-hidden="true" />
                      <span>Momentum Score</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {trajectory.actual.length} events
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
                      {trajectory.currentPosition >= 0 ? "+" : ""}{trajectory.currentPosition}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">net direction</span>
                  </div>

                  {/* Recent Step Events */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[11px] font-mono text-muted-foreground">Recent outcomes:</span>
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5" aria-label="Recent outcomes">
                      {trajectory.actual.slice(-7).map((pt, idx) => (
                        <span
                          key={pt.quest.id || idx}
                          className={cn(
                            "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-mono font-semibold transition-transform active:scale-95",
                            pt.outcome === "completed"
                              ? "bg-primary/10 text-primary border border-primary/25"
                              : "bg-muted text-muted-foreground border border-border/60"
                          )}
                          title={`${pt.quest.title}: ${pt.outcome}`}
                        >
                          {pt.outcome === "completed" ? "+1" : "-1"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/50">
                  <Link
                    to="/journey"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Explore trajectory</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* Tile B: Resilience / Recovery */}
            {showRecoveryCard && recovery && (
              <div className="p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono font-medium uppercase tracking-wider">
                    <Sprout className="size-4 text-primary" aria-hidden="true" />
                    <span>Bouncing Back</span>
                  </div>
                  <p className="mt-3 text-sm sm:text-base font-medium leading-relaxed text-foreground">
                    {recovery.text}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-border/50">
                  <Link
                    to="/quests"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Commit to today's focus</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* Tile C: Goal Momentum Shift */}
            {showMomentumCard && momentum && (
              <div className="p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono font-medium uppercase tracking-wider">
                      <RotateCcw className="size-4 text-primary" aria-hidden="true" />
                      <span>Velocity Momentum</span>
                    </div>
                    {momentum.comparison && (
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-mono font-medium",
                        momentum.comparison.delta >= 0
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      )}>
                        {momentum.comparison.delta >= 0 ? "+" : ""}{Math.round(momentum.comparison.delta * 100)}% shift
                      </span>
                    )}
                  </div>

                  {momentum.comparison ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground font-mono">Goal quest finish rate</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-foreground font-medium">Recent</span>
                          <span className="text-foreground font-semibold">
                            {Math.round(momentum.comparison.recentRate * 100)}%{" "}
                            <span className="text-muted-foreground font-normal">
                              ({momentum.comparison.recentCompleted}/{momentum.comparison.recentTotal})
                            </span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary rounded-full transition-[width] duration-500"
                            style={{ width: `${Math.round(momentum.comparison.recentRate * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-muted-foreground">Earlier</span>
                          <span className="text-muted-foreground">
                            {Math.round(momentum.comparison.previousRate * 100)}%{" "}
                            <span>
                              ({momentum.comparison.previousCompleted}/{momentum.comparison.previousTotal})
                            </span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-muted-foreground/40 rounded-full transition-[width] duration-500"
                            style={{ width: `${Math.round(momentum.comparison.previousRate * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-foreground">{momentum.observation}</p>
                  )}
                </div>
                <div className="mt-5 pt-3 border-t border-border/50">
                  <Link
                    to="/journey"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>View trajectory telemetry</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. Open Behavioral Pattern Ledger (Zero Nested Cards) ── */}
      {surfaced.length > 0 && (
        <div className="mt-6 rounded-3xl border border-border/80 bg-card/50 overflow-hidden shadow-sm">
          <div className="px-5 sm:px-6 py-4 bg-muted/20 border-b border-border/50 flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-semibold text-muted-foreground tracking-wider">
              Observed Behavioral Dynamics
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {surfaced.length} signals tracked
            </span>
          </div>

          <div className="divide-y divide-border/40">
            {surfaced.map((item) => (
              <div key={item.key} className="p-5 sm:p-6 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-primary">
                    {item.categoryLabel}
                  </span>
                  {item.evidence && (
                    <span className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-mono text-muted-foreground border border-border/50">
                      {item.evidence}
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                  {item.observation}
                </p>

                {item.adjustment && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground pt-1">
                    <div className="flex items-start sm:items-center gap-2">
                      <span className="font-semibold text-primary shrink-0">Recommendation:</span>
                      <span className="text-foreground/90">{item.adjustment}</span>
                    </div>
                    <Link
                      to="/quests"
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline text-xs shrink-0 self-start sm:self-auto"
                    >
                      <span>Apply adjustment</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety spacer ensuring clean scroll buffer above mobile SystemBar */}
      <div className="h-6 sm:h-0" aria-hidden="true" />

      {rebalanceProposal && (
        <AutoRebalanceModal
          open={rebalanceOpen}
          onOpenChange={setRebalanceOpen}
          proposal={rebalanceProposal}
        />
      )}
    </div>
  );
}
