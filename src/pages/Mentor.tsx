import { MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlaceholderExperience } from "@/components/shared/PlaceholderExperience";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { deriveGuidance } from "@/lib/guidance";
import { deriveInsights } from "@/lib/insights";

// Founder Decision (Mentor presentation chunk): a short, muted category
// label per message, identifying which of the 7 rules in lib/guidance.ts
// produced it — "Recurring commitment", not an icon or color, reusing
// the exact `text-label text-muted-foreground` convention Journey.tsx
// already established for its own section headers ("Evidence by
// priority", "Recurring commitments"). This is presentation only: it
// reads GuidanceMessage.id (already returned by deriveGuidance) and maps
// it to a label. It adds no new data, no new derivation, no interaction,
// and does not change which messages appear or in what order — that
// remains entirely lib/guidance.ts's responsibility. Falls back to no
// label for any id this map doesn't recognize, rather than guessing one,
// so a future rule addition can't silently render something wrong.
const GUIDANCE_CATEGORY_LABELS: Record<string, string> = {
  "repeated-commitment": "Recurring commitment",
  "weekday-miss-pattern": "Weekday pattern",
  "series-reliability": "Recurring series",
  "goal-linkage-gap": "Goal linkage",
  "recovery-after-miss": "Recovery",
  "trajectory-position": "Trajectory",
  "priority-completion-pattern": "Priority pattern",
};

// Founder Decision (Mentor selectivity chunk): guidance and insights are
// merged into ONE ranked pool and capped, rather than shown as two
// separately-uncapped lists (which could still total up to 11 items).
// "What is most important for me to understand right now?" implies a
// single prioritized answer, not two independently-sized sections.
// RankedItem is a normalized shape both GuidanceMessage and Insight map
// onto — every item still follows Observation → Evidence →
// Interpretation → Possible adjustment; guidance items simply have only
// the observation field populated (they never had the other three), so
// nothing about their existing content changes, only how they compete
// for a slot.
interface RankedItem {
  key: string;
  categoryLabel: string;
  observation: string;
  evidence?: string;
  interpretation?: string;
  adjustment?: string;
  strength: number;
}

// Only 3 slots on the page at a time, regardless of how many guidance
// rules and insights independently qualify. Ranking is a single
// deterministic sort by `strength` — the same internal 0–1 score already
// computed by each rule/insight function in guidance.ts/insights.ts
// (sample size × effect magnitude, with a small bonus for a concrete
// adjustment) — not a new scoring system layered on top; it's the number
// each rule already had and previously discarded.
const MAX_SURFACED_INSIGHTS = 3;
// Founder Decision (Mentor finalization chunk): the Mentor's only job is
// to say back, in words, patterns that are already true of the user's
// real Quest history — never to decide anything for them, never to
// invent a fact that isn't in state.quests. Both deriveGuidance and
// deriveInsights are pure, deterministic functions: no LLM call, no
// external API, no randomness — same quests in, same output out, every
// time. This page is a thin presentational shell (now including the
// ranking/cap above) around them; all the actual reasoning lives in
// those pure functions, same separation as Journey/trajectory.
export default function Mentor() {
  const { profile } = useAuth();
  const { state, loading, error, reload } = useDashboardDataContext();

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" aria-label="Loading your mentor" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
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
  ];

  // Deterministic: sort by strength descending, take the top 3. Ties
  // (rare, given strength blends multiple continuous factors) resolve by
  // original array order, which is stable in JS sort — no randomness.
  const surfaced = [...pool].sort((a, b) => b.strength - a.strength).slice(0, MAX_SURFACED_INSIGHTS);

  // Founder Decision (Reliability of "disappears automatically"):
  // nothing here is persisted or cached — guidance and insights are
  // recomputed fresh from state.quests on every render, exactly as
  // before. A pattern that stops being true (weekday concentration
  // evens out, momentum swing narrows, recurring share drops) simply
  // stops appearing in `pool` the next time this runs; there is no
  // separate dismissal state that could go stale.
  if (surfaced.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        <PlaceholderExperience
          icon={MessageSquare}
          title="No clear pattern yet."
          message="As you commit to and resolve more Quests, your Mentor will point out real patterns in what's working and what isn't — never a guess, only what's actually there."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Your mentor"
        title="What your history is showing."
        description="Grounded in your own Quests, never a guess or a score."
      />
      <ul className="mt-6 space-y-4">
        {surfaced.map((item) => (
          <li key={item.key} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-label text-muted-foreground">{item.categoryLabel}</p>
            <p className="mt-2 text-body-md font-medium leading-6 text-foreground">{item.observation}</p>
            {item.evidence && (
              <p className="mt-1.5 text-body-sm text-muted-foreground">{item.evidence}</p>
            )}
            {item.interpretation && (
              <p className="mt-3 text-body-sm text-foreground">
                <span className="text-muted-foreground">What this might mean — </span>
                {item.interpretation}
              </p>
            )}
            {item.adjustment && (
              <p className="mt-1.5 text-body-sm text-primary">{item.adjustment}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
