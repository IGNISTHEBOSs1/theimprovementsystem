import type { Quest, QuestPriority } from "@/types/quest";
import { toServerLocalDate } from "@/lib/serverTime";

// Founder Decision (Trajectory completeness chunk, backfill option ii):
// resolvedAt exists only on Quests resolved after the field was
// introduced. For Quests resolved before that (or any resolved Quest
// that somehow lacks it), fall back to createdAt — exactly today's
// existing behavior, made explicit rather than silently assumed. This is
// a read-time fallback only; no retroactive DB write is made to old
// records.
// Founder Decision (Visual override chunk): current-streak derivation.
// Consecutive CALENDAR days (server-local, via the same
// toServerLocalDate conversion used everywhere else in the app — no
// second time model) with at least one completed Quest, counting
// backward from today. Stops at the first day with zero completions.
// This is a real, honestly-computed count from existing resolvedAt
// data — not a fabricated or persisted number, and not gameable by
// creating empty Quests (only `completed: true` counts).
export function deriveResolvedAt(quest?: Quest | null): string {
  if (!quest) return new Date().toISOString();
  return quest.resolvedAt ?? quest.createdAt ?? new Date().toISOString();
}


export interface CadenceDay {
  dateStr: string;
  dayLabel: string;
  isToday: boolean;
  completed: boolean;
}

// Founder Decision (Godly UI inspiration — (Not Boring) Habits 7-day rhythm):
// Derives the last 7 calendar days ending today with real completion
// status from resolvedAt data. Zero synthetic points, honest computation.
export function deriveWeeklyCadence(quests: Quest[], todayStr: string, timezone: string): CadenceDay[] {
  if (!todayStr || typeof todayStr !== "string") return [];

  const validQuests = Array.isArray(quests) ? quests.filter((q) => q && q.completed) : [];
  const completedDates = new Set(
    validQuests.map((q) => {
      const resolved = deriveResolvedAt(q);
      const parsed = new Date(resolved);
      return toServerLocalDate(parsed, timezone).dateStr;
    }),
  );

  const days: CadenceDay[] = [];
  const weekdayInitials = ["S", "M", "T", "W", "T", "F", "S"];

  for (let i = 6; i >= 0; i--) {
    const cursor = new Date(`${todayStr}T12:00:00Z`);
    if (isNaN(cursor.getTime())) continue;
    cursor.setUTCDate(cursor.getUTCDate() - i);
    const dateStr = cursor.toISOString().split("T")[0];
    const dayOfWeek = cursor.getUTCDay();
    days.push({
      dateStr,
      dayLabel: weekdayInitials[dayOfWeek],
      isToday: i === 0,
      completed: completedDates.has(dateStr),
    });
  }

  return days;
}

export interface TrajectoryPoint {
  // Cumulative position after this evidence point.
  position: number;
  // The exact Quest that produced this movement — every point on the
  // actual line must be traceable to something concrete, per the
  // Trajectory Engine's core requirement. Never synthesized.
  quest: Quest;
  // ISO timestamp used for ordering/display. This is deriveResolvedAt(quest)
  // — the true resolution instant when available, falling back to
  // createdAt for Quests resolved before that field existed (see
  // deriveResolvedAt above).
  timestamp: string;
  outcome: "completed" | "failed";
}

export interface TrajectoryResult {
  // Chronological cumulative result of resolved, Goal-linked evidence.
  // Empty array when there is no such evidence — callers must not
  // fabricate a starting point or a fake line when this is empty.
  actual: TrajectoryPoint[];
  // The positive reference path: what the same evidence sequence would
  // look like if every one of those Quests had been completed instead of
  // however it actually resolved. Same length and same x-positions as
  // actual, by construction — always +1 at each step.
  intended: TrajectoryPoint[];
  // Convenience — same as the last actual point's position, or 0 if
  // there is no evidence yet. Not a separate calculation.
  currentPosition: number;
}

export interface GoalStats {
  // Every Quest ever linked to the active primary goal, regardless of
  // resolution state — includes still-active ones. Distinct from
  // trajectory's "evidence," which is resolved-only.
  linked: number;
  completed: number;
  failed: number;
}

// Matching rule: A quest belongs to the active goal if Boolean(q.linkedToGoal) is true
// AND (!activeGoalName || !q.goalName || q.goalName.trim().toLowerCase() === activeGoalName.trim().toLowerCase()).
export function isLinkedToActiveGoal(quest?: Quest | null, activeGoalName?: string | null): boolean {
  if (!quest || !quest.linkedToGoal) return false;
  if (!activeGoalName || !quest.goalName) return true;
  return quest.goalName.trim().toLowerCase() === activeGoalName.trim().toLowerCase();
}

// Founder Decision (Goal→Quest→Outcome chunk): a small, honestly-derived
// summary of what a goal has actually gotten from the user — same
// no-fabrication rule as deriveTrajectory: only counts real linkedToGoal
// Quests, scoped to the active goal when provided.
export function deriveGoalStats(quests: Quest[], activeGoalName?: string | null): GoalStats {
  const safeQuests = Array.isArray(quests) ? quests.filter(Boolean) : [];
  const linkedQuests = safeQuests.filter((q) => isLinkedToActiveGoal(q, activeGoalName));
  return {
    linked: linkedQuests.length,
    completed: linkedQuests.filter((q) => q.completed).length,
    failed: linkedQuests.filter((q) => q.failed).length,
  };
}

// Deterministic, evidence-based, 90-Anchor Quota / 9-Day Buffer Trajectory Engine.
// Pure function: same quests array in, same result out, every time. No AI, no external state, no randomness.
export function deriveTrajectory(quests: Quest[], activeGoalName?: string | null): TrajectoryResult {
  // Evidence rule: linkedToGoal === true AND (completed === true OR failed === true).
  // A Quest that is merely active or was never goal-linked contributes nothing —
  // creating a Quest never moves trajectory, only its resolution does.
  const safeQuests = Array.isArray(quests) ? quests.filter(Boolean) : [];
  const evidence = safeQuests
    .filter((q) => isLinkedToActiveGoal(q, activeGoalName) && (q.completed || q.failed))
    .sort((a, b) => (deriveResolvedAt(a) || "").localeCompare(deriveResolvedAt(b) || ""));

  let actualPosition = 0;
  let intendedPosition = 0;
  const actual: TrajectoryPoint[] = [];
  const intended: TrajectoryPoint[] = [];

  for (const quest of evidence) {
    const outcome: "completed" | "failed" = quest.completed ? "completed" : "failed";
    // Non-punitive: +1 for completed, +0 for missed (evidence never vanishes; plateaus).
    // Intended advances at 1.0 anchor per step (nominal 90 anchors / 90 active days).
    if (outcome === "completed") {
      actualPosition += 1;
    }
    intendedPosition = Number((intendedPosition + 1.0).toFixed(2));
    const timestamp = deriveResolvedAt(quest);

    actual.push({ position: actualPosition, quest, timestamp, outcome });
    intended.push({ position: intendedPosition, quest, timestamp, outcome: "completed" });
  }

  return {
    actual,
    intended,
    currentPosition: actual.length > 0 ? actual[actual.length - 1].position : 0,
  };
}

// Single source of truth for the "±10% mathematical buffer bank".
// Dynamic by design with an early-cycle floor to gracefully absorb early misses within buffer.
export const TRAJECTORY_BUFFER_RATIO = 0.1;

export function deriveTrajectoryTolerance(trajectory: TrajectoryResult): number {
  const intendedEnd = trajectory.intended.length > 0
    ? trajectory.intended[trajectory.intended.length - 1].position
    : 0;
  return Math.max(1.0, intendedEnd * TRAJECTORY_BUFFER_RATIO);
}

// Founder Decision (Trajectory completeness chunk, Tier 1 #2): shows what
// the actual evidence line is actually made of, by priority. Pure
// aggregation of trajectory.actual — does not change EVIDENCE_STEP or
// currentPosition. Every goal-linked Quest already carries an explicit,
// user-set priority (see types/quest.ts); this reads that field, it does
// not compute or infer one.
export interface PriorityBreakdownEntry {
  priority: QuestPriority;
  completed: number;
  failed: number;
}

export function derivePriorityBreakdown(actual: TrajectoryPoint[]): PriorityBreakdownEntry[] {
  const order: QuestPriority[] = ["Essential", "Important", "Optional"];
  return order
    .map((priority) => ({
      priority,
      completed: actual.filter((p) => p.quest.priority === priority && p.outcome === "completed").length,
      failed: actual.filter((p) => p.quest.priority === priority && p.outcome === "failed").length,
    }))
    .filter((entry) => entry.completed > 0 || entry.failed > 0);
}

// Founder Decision (Trajectory completeness chunk, Tier 1 #1): per-series
// consistency, for recurring goal-linked commitments only. Reads
// Quest.seriesId, which already exists (see types/quest.ts) and was
// previously unused by any trajectory computation. One-shot Quests
// (no seriesId) are not part of any series and are excluded here — they
// already appear individually in trajectory.actual and Journey's
// "Recent evidence" list.
export interface SeriesStat {
  seriesId: string;
  title: string;
  completed: number;
  failed: number;
  total: number;
}

export function deriveSeriesStats(quests: Quest[]): SeriesStat[] {
  const bySeriesId = new Map<string, Quest[]>();
  for (const quest of quests) {
    if (!quest.seriesId || !quest.linkedToGoal || (!quest.completed && !quest.failed)) continue;
    const existing = bySeriesId.get(quest.seriesId) ?? [];
    existing.push(quest);
    bySeriesId.set(quest.seriesId, existing);
  }

  return Array.from(bySeriesId.entries())
    .map(([seriesId, occurrences]) => {
      // Title is denormalized per-occurrence, not stored once per series
      // (see Quest.seriesId's comment — no separate series record
      // exists). Using the most recently resolved occurrence's title
      // avoids showing a stale title if it was ever edited, without
      // inventing a series-title concept that isn't in the data model.
      const mostRecent = [...occurrences].sort(
        (a, b) => deriveResolvedAt(b).localeCompare(deriveResolvedAt(a)),
      )[0];
      return {
        seriesId,
        title: mostRecent.title,
        completed: occurrences.filter((q) => q.completed).length,
        failed: occurrences.filter((q) => q.failed).length,
        total: occurrences.length,
      };
    })
    .sort((a, b) => b.total - a.total);
}

// Founder Decision (Trajectory completeness chunk, decision #7): overall
// follow-through across ALL resolved Quests, not just goal-linked ones.
// Deliberately kept separate from deriveTrajectory/deriveGoalStats, which
// are Goal-linked evidence only — this answers a different question
// ("do I generally follow through?") from Trajectory's ("am I moving
// toward my Goal?"), matching the IA doc's separation of Dashboard-style
// general reliability from Journey-style goal progress. Never merged
// into the trajectory position calculation.
export interface FollowThroughStats {
  completed: number;
  failed: number;
  total: number;
}

export function deriveFollowThroughStats(quests: Quest[]): FollowThroughStats {
  const resolved = quests.filter((q) => q.completed || q.failed);
  return {
    completed: resolved.filter((q) => q.completed).length,
    failed: resolved.filter((q) => q.failed).length,
    total: resolved.length,
  };
}

export interface GoalPaceResult {
  targetDate: string;
  targetDateFormatted: string;
  daysRemaining: number;
  remainingGoalQuests: number;
  requiredDailyPace: number;
  actualDailyPace: number;
  paceRatio: number;
  isOnTrack: boolean;
  daysObserved: number;
  recentGoalCompleted: number;
  // Dynamic Anchor-Locked 90-Anchor Quota & 9-Day Buffer Bank telemetry fields
  cycleTotalDays: number;
  targetCycleQuests: number;
  completedGoalQuests: number;
  failedGoalQuests: number;
  elapsedDays: number;
  bufferDaysTotal: number;
  bufferDaysRemaining: number;
  horizonExtensionDays: number;
  projectedTotalDays: number;
  isEarlyArrival: boolean;
  projectedFinishDateFormatted: string;
}

// Dynamic Anchor-Locked 90-Anchor Quota & 9-Day Buffer Bank Derivation.
// Target volume: 90 Goal Anchors.
// Buffer Bank: 9 Flex/Rest Days (strict 10% allowance for life variance).
// B_rem = max(0, 9 - failedGoalQuests)
// S = max(0, failedGoalQuests - 9)
// If M <= 9 -> S = 0 (horizon does not slip, buffer absorbs misses).
// If M > 9 -> S = M - 9 (every miss past day 9 adds +1 calendar day).
// Pure function: deterministic, mathematically grounded, no artificial volatility.
export function deriveGoalPace(
  quests: Quest[],
  targetDateStr: string | null | undefined,
  nowMs?: number,
  activeGoalName?: string | null,
): GoalPaceResult | null {
  if (!targetDateStr) return null;

  const targetDate = new Date(
    targetDateStr.includes("T") ? targetDateStr : `${targetDateStr}T23:59:59`
  );
  if (isNaN(targetDate.getTime())) return null;

  const now = typeof nowMs === "number" ? new Date(nowMs) : new Date();

  const completedGoalQuests = quests.filter((q) => isLinkedToActiveGoal(q, activeGoalName) && q.completed).length;
  const failedGoalQuests = quests.filter((q) => isLinkedToActiveGoal(q, activeGoalName) && q.failed).length;

  const targetCycleQuests = 90;
  const bufferDaysTotal = 9;
  const bufferDaysRemaining = Math.max(0, bufferDaysTotal - failedGoalQuests);
  const horizonExtensionDays = Math.max(0, failedGoalQuests - bufferDaysTotal);
  const projectedTotalDays = 90 + failedGoalQuests;
  const cycleTotalDays = 90 + horizonExtensionDays;

  // Dynamic target date accounts for excess horizon slips S
  const effectiveTargetDate = new Date(targetDate.getTime() + horizonExtensionDays * 24 * 60 * 60 * 1000);
  const diffMs = effectiveTargetDate.getTime() - now.getTime();

  const daysRemaining = Math.max(1, Math.ceil(Math.max(0, diffMs) / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.max(1, Math.min(cycleTotalDays, cycleTotalDays - daysRemaining + 1));

  const remainingGoalQuests = Math.max(0, targetCycleQuests - completedGoalQuests);

  // Required daily pace to finish remaining quota in remaining days (nominal baseline is 1.0)
  const requiredDailyPace = Number(Math.min(2.5, Math.max(0.1, remainingGoalQuests / daysRemaining)).toFixed(2));

  // Compute actualDailyPace against observed window (up to 14 days, bounded by elapsedDays)
  const observedDays = Math.max(1, Math.min(14, elapsedDays));
  const windowStart = now.getTime() - observedDays * 24 * 60 * 60 * 1000;

  const recentGoalCompletedQuests = quests.filter((q) => {
    if (!isLinkedToActiveGoal(q, activeGoalName) || !q.completed) return false;
    const resolved = new Date(deriveResolvedAt(q)).getTime();
    return !isNaN(resolved) && resolved >= windowStart;
  });
  const recentGoalCompleted = recentGoalCompletedQuests.length;
  const actualDailyPace = Number((recentGoalCompleted / observedDays).toFixed(2));

  let paceRatio: number;
  if (requiredDailyPace > 0) {
    paceRatio = Number((actualDailyPace / requiredDailyPace).toFixed(2));
  } else {
    paceRatio = remainingGoalQuests === 0 ? 1 : 0;
  }

  // On track if: all done, or within 10% buffer tolerance without active horizon slip
  const isOnTrack = remainingGoalQuests === 0 || (paceRatio >= 0.9 && horizonExtensionDays === 0);

  // Projected finish under current velocity
  const effectiveVelocity = Math.max(0.2, actualDailyPace > 0 ? actualDailyPace : 1.0);
  const daysToFinish = Math.ceil(remainingGoalQuests / effectiveVelocity);
  const projectedFinishDate = new Date(now.getTime() + daysToFinish * 24 * 60 * 60 * 1000);

  // Early arrival if projected finish is ahead of nominal target date
  const isEarlyArrival = completedGoalQuests > 0 && projectedFinishDate.getTime() < targetDate.getTime();

  const targetDateFormatted = effectiveTargetDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const projectedFinishDateFormatted = projectedFinishDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    targetDate: targetDateStr,
    targetDateFormatted,
    daysRemaining,
    remainingGoalQuests,
    requiredDailyPace,
    actualDailyPace,
    paceRatio,
    isOnTrack,
    daysObserved: observedDays,
    recentGoalCompleted,
    cycleTotalDays,
    targetCycleQuests,
    completedGoalQuests,
    failedGoalQuests,
    elapsedDays,
    bufferDaysTotal,
    bufferDaysRemaining,
    horizonExtensionDays,
    projectedTotalDays,
    isEarlyArrival,
    projectedFinishDateFormatted,
  };
}

