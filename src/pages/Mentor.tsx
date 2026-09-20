import { useState } from "react";
import { MessageSquare, Sprout, Compass, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
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

function CompletionRing({ fraction, label }: { fraction: number; label: string }) {
  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" role="img" aria-label={label}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--primary))" strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - fraction)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

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

              {/* Supporting Evidence */}
              <div className="mt-3.5 flex items-center gap-4 rounded-xl bg-muted/40 p-3.5">
                <CompletionRing
                  fraction={recurring.ratio ? recurring.ratio.value / recurring.ratio.total : 0}
                  label={recurring.evidence}
                />
                <div className="min-w-0">
                  <p className="text-body-sm font-medium text-foreground">
                    {recurring.ratio
                      ? `${recurring.ratio.value} of ${recurring.ratio.total} missed occurrences`
                      : "Recorded pattern"}
                  </p>
                  <p className="mt-0.5 text-body-xs text-muted-foreground">{recurring.evidence}</p>
                </div>
              </div>

              {/* Practical Adjustment Suggestion */}
              {recurring.adjustment && (
                <div className="mt-3.5 border-l-2 border-primary/60 pl-3 py-0.5 text-body-sm text-foreground">
                  <span className="font-medium text-primary">Suggested adjustment: </span>
                  <span className="text-muted-foreground">{recurring.adjustment}</span>
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

            {/* Trajectory Card with In-Place Grounded Context */}
            {hasTrajectory && (
              <div className="rounded-2xl border border-border/80 bg-card/80 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Compass className="size-4 text-primary" aria-hidden="true" />
                    <p className="text-label text-muted-foreground">Trajectory Position</p>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tight text-foreground">
                      {trajectory.currentPosition >= 0 ? "+" : ""}{trajectory.currentPosition}
                    </p>
                    <span className="text-body-xs text-muted-foreground">net points</span>
                  </div>
                  <p className="mt-2 text-body-sm text-muted-foreground leading-relaxed">
                    Net movement across your goal-linked Quests (+1 for completed, -1 for missed). Not a grade or personal score.
                  </p>
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
              <div className="rounded-2xl border border-border/80 bg-card/80 p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <RotateCcw className="size-4 text-primary" aria-hidden="true" />
                  <p className="text-label text-muted-foreground">Momentum</p>
                </div>
                <p className="text-body-md font-medium leading-relaxed text-foreground">{momentum.observation}</p>
                {momentum.evidence && (
                  <div className="rounded-lg bg-muted/40 px-3 py-2 text-body-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Evidence: </span>
                    {momentum.evidence}
                  </div>
                )}
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
                <div className="flex items-center justify-between">
                  <span className="text-label text-muted-foreground">{item.categoryLabel}</span>
                </div>
                <p className="text-body-md font-medium leading-snug text-foreground">{item.observation}</p>
                {item.evidence && (
                  <div className="rounded-lg bg-muted/40 px-3 py-2 text-body-sm">
                    <span className="font-medium text-foreground">Evidence: </span>
                    <span className="text-muted-foreground">{item.evidence}</span>
                  </div>
                )}
                {item.interpretation && (
                  <p className="text-body-sm text-foreground">
                    <span className="text-muted-foreground">What this might mean: </span>
                    {item.interpretation}
                  </p>
                )}
                {item.adjustment && (
                  <div className="border-l-2 border-primary/60 pl-3 py-0.5 text-body-sm">
                    <span className="font-medium text-primary">Possible adjustment: </span>
                    <span className="text-muted-foreground">{item.adjustment}</span>
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
