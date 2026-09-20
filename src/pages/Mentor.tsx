import { useState } from "react";
import { MessageSquare, Sprout, Compass, RotateCcw } from "lucide-react";
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

const MAX_SURFACED_INSIGHTS = 3;

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
        <section className="rounded-2xl border border-border bg-card p-7" aria-label="Mentor unavailable">
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

  const anyGridSlot = Boolean(recurring || hasTrajectory || recovery || momentum);

  const usedInGrid = new Set([
    recurring ? "insight-recurring-friction" : null,
    momentum ? "insight-momentum" : null,
    recovery ? "guidance-recovery-after-miss" : null,
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
    <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-[calc(116px+env(safe-area-inset-bottom,0px))] sm:px-8 sm:py-10 sm:pb-12">
      <PageHeader
        eyebrow="Mentor"
        title="Your patterns."
        description="What works and where you get stuck, based on what you actually do."
      />

      {anyGridSlot && (
        <div className="mt-6 space-y-4">
          {/* ── Main Habit Pattern (Recurring) ── */}
          {recurring && (
            <section
              aria-labelledby="primary-insight-heading"
              className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-label font-semibold text-primary">
                  Your main pattern
                </span>
              </div>

              <h2
                id="primary-insight-heading"
                className="mt-2 text-body-lg font-semibold text-foreground leading-snug"
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
                    <div className="mt-4 pt-3.5 border-t border-border/50 space-y-2.5">
                      <div className="flex items-center justify-between text-body-xs">
                        <span className="font-medium text-foreground">Where misses happen</span>
                        <span className="font-mono text-muted-foreground">{totalMissed} misses</span>
                      </div>

                      {/* 2-Tone Segmented Ratio Bar */}
                      <div
                        className="h-2 w-full overflow-hidden rounded-full bg-muted flex"
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
                      <div className="flex flex-wrap items-center justify-between gap-2 text-body-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
                          <span className="font-medium text-foreground">Repeating</span>
                          <span className="font-mono text-muted-foreground">({recurringMissed} • {recurringPct}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-muted-foreground/40 shrink-0" aria-hidden="true" />
                          <span className="text-muted-foreground">One-time</span>
                          <span className="font-mono text-muted-foreground">({oneOffMissed} • {oneOffPct}%)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="mt-3.5 text-body-sm text-muted-foreground">
                  {recurring.evidence}
                </div>
              )}

              {/* Suggested Adjustment */}
              {recurring.adjustment && (
                <div className="mt-3.5 rounded-xl border border-primary/20 bg-primary/[0.03] p-3 text-body-sm">
                  <span className="font-semibold text-primary">Try this: </span>
                  <span className="text-foreground">{recurring.adjustment}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
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

          {/* ── Key Signals: Horizontal Snap Deck on Mobile, 2-Col Grid on Desktop ── */}
          <div>
            <div className="flex items-center justify-between mb-2 sm:hidden px-0.5">
              <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wider">
                What we observe
              </span>
              <span className="text-[11px] text-muted-foreground/80 font-mono">
                Swipe for more →
              </span>
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 scrollbar-none sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible">
              {/* Recovery Card (Evening / Lead) */}
              {leadWithRecovery && recovery && (
                <div className="w-[78vw] max-w-[300px] shrink-0 snap-start sm:w-auto sm:col-span-2 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sprout className="size-4 text-primary" aria-hidden="true" />
                      <p className="text-label text-muted-foreground">Bouncing back</p>
                    </div>
                    <p className="mt-2 text-body-md font-medium leading-relaxed text-foreground">{recovery.text}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <Link
                      to="/quests"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Commit to today's focus →
                    </Link>
                  </div>
                </div>
              )}

              {/* Trajectory Card */}
              {hasTrajectory && (
                <div className="w-[78vw] max-w-[300px] shrink-0 snap-start sm:w-auto rounded-2xl border border-border/80 bg-card/80 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Compass className="size-4 text-primary" aria-hidden="true" />
                        <p className="text-label text-muted-foreground">Momentum score</p>
                      </div>
                      <span className="text-body-xs font-mono text-muted-foreground">
                        {trajectory.actual.length} done
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-2">
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        {trajectory.currentPosition >= 0 ? "+" : ""}{trajectory.currentPosition}
                      </p>
                      <span className="text-body-xs text-muted-foreground font-medium">net score</span>
                    </div>

                    {/* Recent Step Events Horizon */}
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[11px] text-muted-foreground">Recent:</p>
                      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5" aria-label="Recent outcomes">
                        {trajectory.actual.slice(-6).map((pt, idx) => (
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

                  <div className="mt-3.5 pt-2.5 border-t border-border/40">
                    <Link
                      to="/journey"
                      className="inline-flex items-center gap-1 text-body-xs sm:text-body-sm font-medium text-primary hover:underline"
                    >
                      See Journey →
                    </Link>
                  </div>
                </div>
              )}

              {/* Recovery Card (Standard) */}
              {recovery && !leadWithRecovery && (
                <div className="w-[78vw] max-w-[300px] shrink-0 snap-start sm:w-auto rounded-2xl border border-border/80 bg-card/80 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sprout className="size-4 text-primary" aria-hidden="true" />
                      <p className="text-label text-muted-foreground">Bouncing back</p>
                    </div>
                    <p className="mt-2 text-body-sm sm:text-body-md font-medium leading-relaxed text-foreground">{recovery.text}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <Link
                      to="/quests"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Commit to today's focus →
                    </Link>
                  </div>
                </div>
              )}

              {/* Momentum Card */}
              {momentum && (
                <div className="w-[78vw] max-w-[300px] shrink-0 snap-start sm:w-auto rounded-2xl border border-border/80 bg-card/80 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="size-4 text-primary" aria-hidden="true" />
                        <p className="text-label text-muted-foreground">Momentum</p>
                      </div>
                      {momentum.comparison && (
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-mono font-medium",
                          momentum.comparison.delta >= 0
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                        )}>
                          {momentum.comparison.delta >= 0 ? "+" : ""}{Math.round(momentum.comparison.delta * 100)}%
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-body-xs sm:text-body-sm font-medium text-foreground">
                      Goal quest finish rate
                    </p>

                    {momentum.comparison ? (
                      <div className="mt-3 space-y-2">
                        {/* Recent Period Track */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] sm:text-body-xs">
                            <span className="font-medium text-foreground">Recent</span>
                            <span className="font-mono text-foreground font-semibold">
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

                        {/* Prior Period Track */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] sm:text-body-xs">
                            <span className="text-muted-foreground">Earlier</span>
                            <span className="font-mono text-muted-foreground">
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
                      <p className="mt-2 text-body-xs sm:text-body-sm text-foreground">{momentum.observation}</p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <Link
                      to="/journey"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      View trajectory →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Additional Surfaced Observations (Always shown when available) ── */}
      {surfaced.length > 0 && (
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wider">
              More observations
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {surfaced.length} noted
            </span>
          </div>
          {surfaced.map((item) => (
            <div key={item.key} className="rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  {item.categoryLabel}
                </span>
                {item.evidence && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                    {item.evidence}
                  </span>
                )}
              </div>
              <p className="text-body-sm font-medium text-foreground">{item.observation}</p>
              {item.adjustment && (
                <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-2.5 text-body-xs sm:text-body-sm flex items-center justify-between gap-2.5">
                  <div>
                    <span className="font-semibold text-primary">Try this: </span>
                    <span className="text-foreground">{item.adjustment}</span>
                  </div>
                  <Link
                    to="/quests"
                    className="shrink-0 text-xs font-semibold text-primary hover:underline px-1 py-0.5"
                  >
                    Act →
                  </Link>
                </div>
              )}
            </div>
          ))}
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
