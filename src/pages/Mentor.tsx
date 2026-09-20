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
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" aria-label="Loading your mentor" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
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
      <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
        <PlaceholderExperience
          icon={MessageSquare}
          title="No clear pattern yet."
          message="As you commit to and resolve more Quests, your Mentor will point out real patterns in what's working and what isn't — never a guess, only what's actually there."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Your mentor"
        title="Your history."
        description="Grounded in your own Quests, never a guess or a score."
      />

      {anyGridSlot && (
        <div className="mt-6 space-y-4">
          {recurring && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-label text-muted-foreground">Recurring commitments</p>
              <div className="mt-3 flex items-center gap-4">
                <CompletionRing
                  fraction={recurring.ratio ? recurring.ratio.value / recurring.ratio.total : 0}
                  label={recurring.evidence}
                />
                <div>
                  <p className="text-body-md font-medium leading-5 text-foreground">{recurring.observation}</p>
                  <p className="mt-1 text-body-sm text-muted-foreground">{recurring.evidence}</p>
                </div>
              </div>
              <Button asChild size="sm" className="mt-4 min-h-9">
                <Link to="/quests">Restructure Quests</Link>
              </Button>
              {rebalanceProposal && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4 ml-2 min-h-9"
                  onClick={() => setRebalanceOpen(true)}
                >
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  Auto-Rebalance
                </Button>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {leadWithRecovery && recovery && (
              <div className="rounded-2xl border border-border bg-card p-5 sm:col-span-2">
                <div className="flex items-center gap-2">
                  <Sprout className="size-4 text-primary" aria-hidden="true" />
                  <p className="text-label text-muted-foreground">Recovery</p>
                </div>
                <p className="mt-2 text-body-md font-medium leading-6 text-foreground">{recovery.text}</p>
              </div>
            )}
            {hasTrajectory && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Compass className="size-4 text-primary" aria-hidden="true" />
                  <p className="text-label text-muted-foreground">Trajectory</p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {trajectory.currentPosition >= 0 ? "+" : ""}{trajectory.currentPosition}
                </p>
                <p className="mt-1 text-body-sm text-muted-foreground">Your current position — see Journey for the full picture.</p>
              </div>
            )}
            {recovery && !leadWithRecovery && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Sprout className="size-4 text-primary" aria-hidden="true" />
                  <p className="text-label text-muted-foreground">Recovery</p>
                </div>
                <p className="mt-2 text-body-md font-medium leading-6 text-foreground">{recovery.text}</p>
              </div>
            )}
          </div>

          {momentum && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <RotateCcw className="size-4 text-primary" aria-hidden="true" />
                <p className="text-label text-muted-foreground">Momentum</p>
              </div>
              <p className="mt-2 text-body-md font-medium leading-6 text-foreground">{momentum.observation}</p>
              <p className="mt-1 text-body-sm text-muted-foreground">{momentum.evidence}</p>
            </div>
          )}
        </div>
      )}

      {/* Founder Decision (Visual override chunk — Mentor grid redesign):
          any other real pattern that doesn't fit the four grid slots
          above (e.g. weekday concentration, priority gap, series
          reliability) still shows here — same ranked pool as before,
          just relabeled from the page's sole content to a secondary
          "Other patterns" section beneath the grid. */}
      {surfaced.length > 0 && (
        <div className={anyGridSlot ? "mt-8" : "mt-6"}>
          {anyGridSlot && <p className="text-label text-muted-foreground">Other patterns</p>}
          <ul className="mt-3 space-y-4">
            {surfaced.map((item) => (
              <li key={item.key} className="rounded-2xl border border-border/60 bg-card/40 p-5">
                <p className="text-label text-muted-foreground">{item.categoryLabel}</p>
                <p className="mt-2 text-body-md leading-6 text-foreground">{item.observation}</p>
                {item.evidence && <p className="mt-1.5 text-body-sm text-muted-foreground">{item.evidence}</p>}
                {item.interpretation && (
                  <p className="mt-3 text-body-sm text-foreground">
                    <span className="text-muted-foreground">What this might mean — </span>
                    {item.interpretation}
                  </p>
                )}
                {item.adjustment && <p className="mt-1.5 text-body-sm text-primary">{item.adjustment}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
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
