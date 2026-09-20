import { useState } from "react";
import { MessageSquare, Sprout, Compass, RotateCcw, ChevronDown } from "lucide-react";
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
          <button
            type="button"
            onClick={() => void reload()}
            className="mt-4 min-h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
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
              className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm"
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

              {/* Supporting Evidence — Distribution Telemetry Bar */}
              {recurring.ratio ? (
                (() => {
                  const recurringMissed = recurring.ratio.value;
                  const totalMissed = recurring.ratio.total;
                  const oneOffMissed = Math.max(0, totalMissed - recurringMissed);
                  const recurringPct = totalMissed > 0 ? Math.round((recurringMissed / totalMissed) * 100) : 0;
                  const oneOffPct = 100 - recurringPct;

                  return (
                    <div className="mt-3.5 rounded-xl bg-muted/40 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-body-xs">
                        <span className="font-medium text-foreground">Miss Concentration</span>
                        <span className="font-mono text-muted-foreground">{totalMissed} recent misses recorded</span>
                      </div>

                      {/* 2-Tone Segmented Ratio Bar */}
                      <div
                        className="h-2.5 w-full overflow-hidden rounded-full bg-muted flex"
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
                          <span className="font-mono text-muted-foreground">({recurringMissed} misses • {recurringPct}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-muted-foreground/40 shrink-0" aria-hidden="true" />
                          <span className="text-muted-foreground">One-off</span>
                          <span className="font-mono text-muted-foreground">({oneOffMissed} misses • {oneOffPct}%)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="mt-3.5 rounded-xl bg-muted/40 p-3 text-body-sm text-muted-foreground">
                  {recurring.evidence}
                </div>
              )}

              {/* Practical Adjustment Suggestion */}
              {recurring.adjustment && (
                <div className="mt-3.5 rounded-xl border border-primary/25 bg-primary/[0.04] p-3 text-body-sm">
                  <span className="font-semibold text-primary">Suggested adjustment: </span>
                  <span className="text-foreground">{recurring.adjustment}</span>
                </div>
              )}

              {/* Clear Action Hierarchy */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {rebalanceProposal ? (
                  <>
                    <Button
                      size="sm"
                      className="min-h-10"
                      onClick={() => setRebalanceOpen(true)}
                    >
                      <RotateCcw className="mr-1.5 size-3.5" aria-hidden="true" />
                      Review Day-Shift Proposal
                    </Button>
                    <Button asChild size="sm" variant="outline" className="min-h-10">
                      <Link to="/quests">Manage Quests</Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild size="sm" className="min-h-10">
                    <Link to="/quests">Review Recurring Quests</Link>
                  </Button>
                )}
              </div>
            </section>
          )}

          {/* ── Secondary Insights Grid ── */}
          <div className="grid gap-4 sm:grid-cols-2">
            {leadWithRecovery && recovery && (
              <div className="rounded-2xl border border-border bg-card p-5 sm:col-span-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sprout className="size-4 text-primary" aria-hidden="true" />
                  <p className="text-label text-muted-foreground">Recovery</p>
                </div>
                <p className="mt-2 text-body-md font-medium leading-relaxed text-foreground">{recovery.text}</p>
                <p className="mt-2 text-body-xs text-muted-foreground">
                  Grounded in how you resolve subsequent commitments after an uncompleted Quest.
                </p>
              </div>
            )}

            {/* Trajectory Card with In-Place Grounded Context & Recent Step Horizon */}
            {hasTrajectory && (
              <div className="rounded-2xl border border-border/80 bg-card/80 p-5 flex flex-col justify-between">
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
                    <p className="text-3xl font-bold tracking-tight text-foreground">
                      {trajectory.currentPosition >= 0 ? "+" : ""}{trajectory.currentPosition}
                    </p>
                    <span className="text-body-xs text-muted-foreground font-medium">net points</span>
                  </div>

                  {/* Recent Step Events Horizon */}
                  <div className="mt-3.5 space-y-1.5">
                    <p className="text-body-xs text-muted-foreground">Recent resolution steps:</p>
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

                <div className="mt-4 pt-3 border-t border-border/40">
                  <Link
                    to="/journey"
                    className="inline-flex items-center gap-1 text-body-sm font-medium text-primary hover:underline"
                  >
                    View full trajectory on Journey →
                  </Link>
                </div>
              </div>
            )}

            {recovery && !leadWithRecovery && (
              <div className="rounded-2xl border border-border/80 bg-card/80 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sprout className="size-4 text-primary" aria-hidden="true" />
                    <p className="text-label text-muted-foreground">Recovery</p>
                  </div>
                  <p className="mt-2 text-body-md font-medium leading-relaxed text-foreground">{recovery.text}</p>
                </div>
                <p className="mt-3 text-body-xs text-muted-foreground">
                  Measured from chronological follow-up after misses.
                </p>
              </div>
            )}

            {momentum && (
              <div className="rounded-2xl border border-border/80 bg-card/80 p-5 flex flex-col justify-between">
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

                  <p className="mt-2 text-body-sm font-medium text-foreground">
                    Goal-linked completion rate
                  </p>

                  {momentum.comparison ? (
                    <div className="mt-3 space-y-2.5">
                      {/* Recent Period Track */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-body-xs">
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
                        <div className="flex items-center justify-between text-body-xs">
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
                    <p className="mt-2 text-body-sm text-foreground">{momentum.observation}</p>
                  )}
                </div>

                <p className="mt-3 text-body-xs text-muted-foreground">
                  Comparing chronological goal-linked halves.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Other Patterns Section (Secondary Surfaced List) ── */}
      {surfaced.length > 0 && (
        <div className={anyGridSlot ? "mt-8" : "mt-6"}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-label font-semibold text-muted-foreground">Other observed patterns</h2>
            <span className="text-body-xs text-muted-foreground">
              {surfaced.length} {surfaced.length === 1 ? "pattern" : "patterns"}
            </span>
          </div>
          <ul className="space-y-3.5">
            {surfaced.map((item) => (
              <li key={item.key} className="rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-label text-muted-foreground">{item.categoryLabel}</span>
                  {item.evidence && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-0.5 text-xs font-mono text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-primary/70 shrink-0" aria-hidden="true" />
                      {item.evidence}
                    </span>
                  )}
                </div>
                <p className="text-body-md font-medium leading-snug text-foreground">{item.observation}</p>
                {item.interpretation && (
                  <details className="group text-body-xs text-muted-foreground">
                    <summary className="cursor-pointer list-none inline-flex items-center gap-1 font-medium hover:text-foreground transition-colors">
                      <span>Why this happens</span>
                      <ChevronDown className="size-3 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="mt-2 rounded-xl bg-muted/30 border border-border/40 p-3 text-body-sm text-foreground/90 leading-relaxed">
                      {item.interpretation}
                    </div>
                  </details>
                )}
                {item.adjustment && (
                  <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-3 text-body-sm">
                    <span className="font-semibold text-primary">Possible adjustment: </span>
                    <span className="text-foreground">{item.adjustment}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
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
