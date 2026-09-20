import { useState } from "react";
import { MessageSquare, Sprout, Compass, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { PlaceholderExperience } from "@/components/shared/PlaceholderExperience";
import { AutoRebalanceModal } from "@/components/mentor/AutoRebalanceModal";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { deriveGuidance } from "@/lib/guidance";
import { deriveInsights } from "@/lib/insights";
import { deriveTrajectory } from "@/lib/trajectory";
import { computeRebalanceProposal } from "@/lib/rebalance";

// Founder Decision (Visual override chunk — Mentor grid redesign):
// replaces the flat ranked list with a fixed 4-slot card grid, by
// explicit Founder instruction to match a provided reference layout.
// Each slot maps to a REAL, already-computed signal — nothing here is
// fabricated to fill a slot:
//   - Recurring:   lib/insights.ts's recurring-friction insight
//   - Trajectory:  lib/trajectory.ts's deriveTrajectory (same function
//                  Journey uses — not a second trajectory calculation)
//   - Recovery:    lib/guidance.ts's recovery-after-miss rule
//   - Momentum:    lib/insights.ts's momentum insight
// A slot simply does not render when its underlying condition isn't
// met — never a generic placeholder text standing in for real evidence.
// If NONE of the four have real data, the page falls back to the
// existing top-3 ranked list (same pool/ranking as before, unchanged),
// so a real pattern that doesn't happen to fit one of these four shapes
// still gets shown rather than silently dropped.
const GUIDANCE_CATEGORY_LABELS: Record<string, string> = {
  "repeated-commitment": "Recurring commitment",
  "weekday-miss-pattern": "Weekday pattern",
  "series-reliability": "Recurring series",
  "goal-linkage-gap": "Goal linkage",
  "recovery-after-miss": "Recovery",
  "trajectory-position": "Trajectory",
  "priority-completion-pattern": "Priority pattern",
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
          <p className="text-label text-muted-foreground">Your mentor</p>
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

  // Situational surfacing: this only ever reorders/promotes a slot that
  // already has REAL underlying data (`recovery` is undefined unless
  // deriveGuidance found an actual recovery-after-miss pattern) — it
  // never invents a Recovery note for someone with no missed Quest just
  // because it's evening. That would break the "never a guess" rule
  // this file's own comments enforce everywhere else. What it does: if
  // a genuine recovery pattern exists AND it's evening (when someone is
  // more likely reviewing/recovering from the day), it's worth leading
  // with rather than sitting equal-weighted next to Momentum/Trajectory.
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
          message="As you commit to and resolve more Quests, your Mentor will point out real patterns in what's working and what isn't — never a guess, only what's actually there."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-[calc(116px+env(safe-area-inset-bottom,0px))] sm:px-8 sm:py-10 sm:pb-12">
      <PageHeader
        eyebrow="Your mentor"
        title="Patterns in your history."
        description="Observations and practical adjustments grounded in your recorded Quests — never a score or verdict."
      />

      {anyGridSlot && (
        <div className="mt-6 space-y-4">
          {/* ── Primary Actionable Pattern (Recurring Friction) ── */}
          {recurring && (
            <section
              aria-labelledby="primary-insight-heading"
              className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-label font-semibold text-primary">
                  Primary Observation • Recurring commitments
                </span>
              </div>

              <h2
                id="primary-insight-heading"
                className="mt-2 text-body-lg font-semibold text-foreground leading-snug"
              >
                {recurring.observation}
              </h2>

              {/* Supporting Evidence — Integrated Miss Telemetry (No heavy nested gray container) */}
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
                        <span className="font-medium text-foreground">Miss Concentration</span>
                        <span className="font-mono text-muted-foreground">{totalMissed} recent misses recorded</span>
                      </div>

                      {/* 2-Tone Segmented Ratio Bar */}
                      <div
                        className="h-2 w-full overflow-hidden rounded-full bg-muted flex"
                        role="progressbar"
                        aria-valuenow={recurringPct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Miss distribution: ${recurringPct}% recurring, ${oneOffPct}% one-off`}
                      >
                        <div
                          className="bg-primary transition-[width] duration-500 rounded-l-full"
                          style={{ width: `${recurringPct}%` }}
                          title={`Recurring: ${recurringPct}%`}
                        />
                        <div
                          className="bg-muted-foreground/30 transition-[width] duration-500 rounded-r-full"
                          style={{ width: `${oneOffPct}%` }}
                          title={`One-off: ${oneOffPct}%`}
                        />
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-body-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
                          <span className="font-medium text-foreground">Recurring series</span>
                          <span className="font-mono text-muted-foreground">({recurringMissed} • {recurringPct}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-muted-foreground/40 shrink-0" aria-hidden="true" />
                          <span className="text-muted-foreground">One-off</span>
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

              {/* Practical Adjustment Suggestion */}
              {recurring.adjustment && (
                <div className="mt-3.5 rounded-xl border border-primary/20 bg-primary/[0.03] p-3 text-body-sm">
                  <span className="font-semibold text-primary">Suggested adjustment: </span>
                  <span className="text-foreground">{recurring.adjustment}</span>
                </div>
              )}

              {/* Clear Action Hierarchy - Mobile thumb-friendly buttons */}
              <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                {rebalanceProposal ? (
                  <>
                    <Button
                      size="sm"
                      className="w-full sm:w-auto min-h-11"
                      onClick={() => setRebalanceOpen(true)}
                    >
                      <RotateCcw className="mr-1.5 size-3.5" aria-hidden="true" />
                      Review Day-Shift Proposal
                    </Button>
                    <Button asChild size="sm" variant="outline" className="w-full sm:w-auto min-h-11">
                      <Link to="/quests">Manage Quests</Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild size="sm" className="w-full sm:w-auto min-h-11">
                    <Link to="/quests">Review Recurring Quests</Link>
                  </Button>
                )}
              </div>
            </section>
          )}

          {/* ── Secondary Metrics: Horizontal Snap Deck on Mobile, 2-Col Grid on Desktop ── */}
          <div>
            <div className="flex items-center justify-between mb-2 sm:hidden px-0.5">
              <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wider">
                Key Signals
              </span>
              <span className="text-[11px] text-muted-foreground/80 font-mono">
                Swipe to view →
              </span>
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 scrollbar-none sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible">
              {leadWithRecovery && recovery && (
                <div className="w-[82vw] max-w-[320px] shrink-0 snap-center sm:w-auto sm:col-span-2 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sprout className="size-4 text-primary" aria-hidden="true" />
                      <p className="text-label text-muted-foreground">Recovery</p>
                    </div>
                    <p className="mt-2 text-body-md font-medium leading-relaxed text-foreground">{recovery.text}</p>
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Grounded in how you resolve subsequent commitments after an uncompleted Quest.
                  </p>
                </div>
              )}

              {/* Trajectory Card with In-Place Grounded Context & Recent Step Horizon */}
              {hasTrajectory && (
                <div className="w-[82vw] max-w-[320px] shrink-0 snap-center sm:w-auto rounded-2xl border border-border/80 bg-card/80 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Compass className="size-4 text-primary" aria-hidden="true" />
                        <p className="text-label text-muted-foreground">Trajectory Position</p>
                      </div>
                      <span className="text-body-xs font-mono text-muted-foreground">
                        {trajectory.actual.length} resolved
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-2">
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        {trajectory.currentPosition >= 0 ? "+" : ""}{trajectory.currentPosition}
                      </p>
                      <span className="text-body-xs text-muted-foreground font-medium">net points</span>
                    </div>

                    {/* Recent Step Events Horizon */}
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[11px] text-muted-foreground">Recent resolution steps:</p>
                      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5" aria-label="Recent resolution steps">
                        {trajectory.actual.slice(-6).map((pt, idx) => (
                          <span
                            key={pt.quest.id || idx}
                            className={cn(
                              "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-mono font-semibold transition-transform active:scale-95",
                              pt.outcome === "completed"
                                ? "bg-primary/10 text-primary border border-primary/25"
                                : "bg-muted text-muted-foreground border border-border/60"
                            )}
                            title={`${pt.quest.title}: ${pt.outcome} (${pt.outcome === "completed" ? "+1" : "-1"})`}
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
                      View full trajectory on Journey →
                    </Link>
                  </div>
                </div>
              )}

              {recovery && !leadWithRecovery && (
                <div className="w-[82vw] max-w-[320px] shrink-0 snap-center sm:w-auto rounded-2xl border border-border/80 bg-card/80 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sprout className="size-4 text-primary" aria-hidden="true" />
                      <p className="text-label text-muted-foreground">Recovery</p>
                    </div>
                    <p className="mt-2 text-body-sm sm:text-body-md font-medium leading-relaxed text-foreground">{recovery.text}</p>
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Measured from chronological follow-up after misses.
                  </p>
                </div>
              )}

              {momentum && (
                <div className="w-[82vw] max-w-[320px] shrink-0 snap-center sm:w-auto rounded-2xl border border-border/80 bg-card/80 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
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
                      Goal-linked completion rate
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
                            <span className="text-muted-foreground">Prior</span>
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

                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Comparing chronological goal-linked halves.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Other Patterns Section (Secondary Surfaced List as Accordion) ── */}
      {surfaced.length > 0 && (
        <div className={anyGridSlot ? "mt-7 sm:mt-8" : "mt-6"}>
          <div className="flex items-center justify-between mb-3 px-0.5">
            <h2 className="text-label font-semibold text-muted-foreground">Other observed patterns</h2>
            <span className="text-body-xs font-mono text-muted-foreground">
              {surfaced.length} {surfaced.length === 1 ? "pattern" : "patterns"}
            </span>
          </div>
          <Accordion
            type="multiple"
            className="rounded-2xl border border-border/70 bg-card/60 divide-y divide-border/50 overflow-hidden shadow-sm"
          >
            {surfaced.map((item) => (
              <AccordionItem key={item.key} value={item.key} className="border-b-0 px-4 sm:px-5">
                <AccordionTrigger className="py-3.5 hover:no-underline text-left">
                  <div className="flex flex-col gap-1 pr-2 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                        {item.categoryLabel}
                      </span>
                      {item.evidence && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                          <span className="size-1 rounded-full bg-primary/70 shrink-0" aria-hidden="true" />
                          {item.evidence}
                        </span>
                      )}
                    </div>
                    <span className="text-body-sm font-medium text-foreground leading-snug">
                      {item.observation}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-4 text-body-sm space-y-2.5">
                  {item.interpretation && (
                    <div className="rounded-xl bg-muted/30 border border-border/40 p-3 text-body-xs sm:text-body-sm text-foreground/90 leading-relaxed">
                      <span className="font-semibold text-muted-foreground block mb-1">Why this happens:</span>
                      {item.interpretation}
                    </div>
                  )}
                  {item.adjustment && (
                    <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-3 text-body-xs sm:text-body-sm">
                      <span className="font-semibold text-primary">Possible adjustment: </span>
                      <span className="text-foreground">{item.adjustment}</span>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
