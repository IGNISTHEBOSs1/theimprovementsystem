import type { Quest } from "@/types/quest";
import { deriveResolvedAt } from "@/lib/trajectory";

// Founder Decision (Personal Insight System — architecture): Mentor
// evolves to include this, rather than being replaced by it or sitting
// as an unrelated new top-level page. Mentor's existing 7 rules
// (lib/guidance.ts) stay exactly as they are — short, single-sentence,
// "worth a note right now" observations. Insights are a different
// granularity: multi-part (observation + evidence + optional
// interpretation + optional adjustment), temporally aware (recent vs.
// previous period), and internally confidence-graded. Both read the
// same underlying quests array and both render on the Mentor page, but
// as two clearly separate sections — "these should feel connected, not
// like unrelated analytics pages," per the brief. Kept in a separate
// file from guidance.ts (not folded into it) because the data shape and
// the temporal-comparison logic genuinely differ, not for arbitrary
// separation.
//
// Deterministic only — no LLM, no external call, no randomness. Same
// input, same output, identical spirit to deriveTrajectory and
// deriveGuidance. If AI-generated insights are ever wanted, that is a
// separate, explicit Founder Decision — this file does not do that.

export type InsightCategory = "momentum" | "follow-through" | "recurring-friction" | "goal-alignment";

export interface Insight {
  id: string;
  category: InsightCategory;
  categoryLabel: string;
  observation: string;
  evidence: string;
  interpretation?: string;
  adjustment?: string;
}

// Founder Decision (Personal Insight System — confidence model): a
// single missed Quest must never become an insight. MIN_SAMPLE is the
// floor for ANY insight type to render at all — below it, that insight
// type is silently skipped (not shown as a forced "insufficient data"
// card; see the Mentor page for the one honest overall empty state used
// when nothing qualifies at all). This mirrors guidance.ts's own
// MIN_REPEAT_COUNT-style thresholds — a real, deliberate bar, not a
// stylistic minimum.
const MIN_SAMPLE = 4;
// Minimum swing (percentage points) for a momentum comparison to be
// worth surfacing — avoids manufacturing a trend out of ordinary
// week-to-week noise.
const MIN_MOMENTUM_SWING = 0.15;

function rate(completed: number, total: number): number {
  return total > 0 ? completed / total : 0;
}

// Founder Decision (Personal Insight System — Momentum): the one
// genuinely NEW derivation in this file — TIS did not previously compare
// any two time periods against each other anywhere. Scoped to
// goal-linked resolved Quests specifically (matching the brief's own
// worked example: "completed 8 of your last 10 goal-linked Quests").
// Splits chronologically-ordered goal-linked evidence into two
// comparable halves by COUNT, not by calendar date — robust for sparse
// accounts where a fixed date window (e.g. "last 30 days") might catch
// only 1–2 Quests and manufacture a trend from noise. Requires at least
// MIN_SAMPLE in EACH half before comparing.
function momentumInsight(quests: Quest[]): Insight | null {
  const resolved = [...quests.filter((q) => q.linkedToGoal && (q.completed || q.failed))].sort(
    (a, b) => deriveResolvedAt(a).localeCompare(deriveResolvedAt(b)),
  );
  if (resolved.length < MIN_SAMPLE * 2) return null;

  const mid = Math.floor(resolved.length / 2);
  const previous = resolved.slice(0, mid);
  const recent = resolved.slice(mid);

  const previousRate = rate(previous.filter((q) => q.completed).length, previous.length);
  const recentRate = rate(recent.filter((q) => q.completed).length, recent.length);
  const delta = recentRate - previousRate;
  if (Math.abs(delta) < MIN_MOMENTUM_SWING) return null;

  const direction = delta > 0 ? "improved" : "declined";
  const recentCompleted = recent.filter((q) => q.completed).length;

  return {
    id: "momentum",
    category: "momentum",
    categoryLabel: "Momentum",
    observation: `Your goal-linked completion rate has ${direction} — ${Math.round(recentRate * 100)}% recently, vs ${Math.round(previousRate * 100)}% before that.`,
    evidence: `${recentCompleted} of your last ${recent.length} goal-linked Quests completed, compared to ${previous.filter((q) => q.completed).length} of ${previous.length} before.`,
  };
}

// Founder Decision (Personal Insight System — Follow-through): the
// plainest of the four — overall completion rate, no comparison, no
// forced interpretation. "Sometimes understanding is enough," per the
// brief. Deliberately scoped to ALL resolved Quests (not just
// goal-linked), same scope as deriveFollowThroughStats already uses on
// Journey — this is intentionally the one insight that mirrors an
// existing Journey stat, just reframed as a card with room for
// evidence-backed commentary if a pattern is actually worth naming.
function followThroughInsight(quests: Quest[]): Insight | null {
  const resolved = quests.filter((q) => q.completed || q.failed);
  if (resolved.length < MIN_SAMPLE) return null;

  const completed = resolved.filter((q) => q.completed).length;
  const r = rate(completed, resolved.length);

  return {
    id: "follow-through",
    category: "follow-through",
    categoryLabel: "Follow-through",
    observation: `You complete ${Math.round(r * 100)}% of what you commit to.`,
    evidence: `${completed} of ${resolved.length} Quests completed overall.`,
  };
}

// Founder Decision (Personal Insight System — Recurring Friction): NEW
// angle, not a duplicate of guidance.ts's per-series reliability rule.
// That rule asks "is ONE specific series unreliable?" This asks a
// different, aggregate question: "of everything that gets missed, how
// much of it is recurring vs. one-off?" — directly matching the brief's
// own worked example ("6 of 8 recent misses came from recurring
// commitments"). Requires MIN_SAMPLE total misses before speaking, and
// only surfaces when recurring misses are a clear majority (>60%) of all
// misses — a real skew, not a coin-flip split.
function recurringFrictionInsight(quests: Quest[]): Insight | null {
  const missed = quests.filter((q) => q.failed);
  if (missed.length < MIN_SAMPLE) return null;

  const recurringMissed = missed.filter((q) => q.seriesId).length;
  const share = rate(recurringMissed, missed.length);
  if (share < 0.6) return null;

  return {
    id: "recurring-friction",
    category: "recurring-friction",
    categoryLabel: "Recurring commitments",
    observation: "Recurring commitments are currently your biggest source of missed occurrences.",
    evidence: `${recurringMissed} of your last ${missed.length} missed Quests came from recurring series.`,
    interpretation: "Your one-off commitments are currently more reliable than your recurring ones.",
    adjustment: "Consider reducing or restructuring one recurring commitment.",
  };
}

// Founder Decision (Personal Insight System — Goal Alignment): the
// richer, card-format sibling of guidance.ts's goal-linkage-gap rule —
// same underlying comparison (goal-linked vs. non-goal-linked completion
// rate), recomputed independently here rather than imported, since the
// output shapes genuinely differ (a single terse sentence there vs. a
// structured card with an optional interpretation here). Same
// MIN_SAMPLE-per-group and minimum-gap discipline as the guidance rule.
function goalAlignmentInsight(quests: Quest[]): Insight | null {
  const resolved = quests.filter((q) => q.completed || q.failed);
  const linked = resolved.filter((q) => q.linkedToGoal);
  const unlinked = resolved.filter((q) => !q.linkedToGoal);
  if (linked.length < MIN_SAMPLE || unlinked.length < MIN_SAMPLE) return null;

  const linkedRate = rate(linked.filter((q) => q.completed).length, linked.length);
  const unlinkedRate = rate(unlinked.filter((q) => q.completed).length, unlinked.length);
  const gap = linkedRate - unlinkedRate;
  if (Math.abs(gap) < 0.2) return null;

  return gap < 0
    ? {
        id: "goal-alignment",
        category: "goal-alignment",
        categoryLabel: "Goal alignment",
        observation: "Commitments linked to your goal complete less often than everything else you commit to.",
        evidence: `${Math.round(linkedRate * 100)}% completion on goal-linked Quests, vs ${Math.round(unlinkedRate * 100)}% elsewhere.`,
        interpretation: "Goal-linked commitments may currently be set at a harder bar than the rest of what you take on.",
      }
    : {
        id: "goal-alignment",
        category: "goal-alignment",
        categoryLabel: "Goal alignment",
        observation: "Commitments linked to your goal complete more reliably than everything else you commit to.",
        evidence: `${Math.round(linkedRate * 100)}% completion on goal-linked Quests, vs ${Math.round(unlinkedRate * 100)}% elsewhere.`,
      };
}

// Ordered by how directly useful each is likely to be — momentum (a
// trend) and follow-through (the headline number) first, structural
// patterns after. At most one card per type; a type simply doesn't
// appear when its own threshold isn't met, rather than rendering an
// empty/insufficient placeholder per type.
export function deriveInsights(quests: Quest[]): Insight[] {
  const insights: Insight[] = [];
  const momentum = momentumInsight(quests);
  if (momentum) insights.push(momentum);
  const followThrough = followThroughInsight(quests);
  if (followThrough) insights.push(followThrough);
  const friction = recurringFrictionInsight(quests);
  if (friction) insights.push(friction);
  const alignment = goalAlignmentInsight(quests);
  if (alignment) insights.push(alignment);
  return insights;
}
