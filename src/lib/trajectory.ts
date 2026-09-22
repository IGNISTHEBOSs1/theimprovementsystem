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

// Founder Decision (Visual override chunk): current-streak derivation.
// Consecutive CALENDAR days (server-local, via the same
// toServerLocalDate conversion used everywhere else in the app — no
// second time model) with at least one completed Quest, counting
// backward from today. Stops at the first day with zero completions.
// This is a real, honestly-computed count from existing resolvedAt
// data — not a fabricated or persisted number, and not gameable by
// creating empty Quests (only `completed: true` counts).
export function deriveCurrentStreak(quests: Quest[], todayStr: string, timezone: string): number {
  if (!todayStr || typeof todayStr !== "string") return 0;

  const validQuests = Array.isArray(quests) ? quests.filter((q) => q && q.completed) : [];
  const completedDates = new Set(
    validQuests.map((q) => {
      const resolved = deriveResolvedAt(q);
      const parsed = new Date(resolved);
      return toServerLocalDate(parsed, timezone).dateStr;
    }),
  );

  let streak = 0;
  const cursor = new Date(`${todayStr}T12:00:00Z`);
  if (isNaN(cursor.getTime())) {
    return 0;
  }

  for (let i = 0; i < 3650; i++) {
    const cursorStr = cursor.toISOString().split("T")[0];
    if (!completedDates.has(cursorStr)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
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
  // Every Quest ever linked to the current primary goal, regardless of
  // resolution state — includes still-active ones. Distinct from
  // trajectory's "evidence," which is resolved-only.
  linked: number;
  completed: number;
  failed: number;
}

// Founder Decision (Goal→Quest→Outcome chunk): a small, honestly-derived
// summary of what a goal has actually gotten from the user — same
// no-fabrication rule as deriveTrajectory: only counts real linkedToGoal
// Quests, nothing inferred or estimated. Deliberately does not filter by
// which goal's name matches goalName — every Quest's goalName is a
// snapshot of whatever the primary goal was when it was linked (see
// Quest.goalName), so this reflects the account's full linked history,
// not just Quests linked to today's exact goal text. That mirrors how
// Journey's trajectory already treats goal-linked evidence.
export function deriveGoalStats(quests: Quest[]): GoalStats {
  const safeQuests = Array.isArray(quests) ? quests.filter(Boolean) : [];
  const linkedQuests = safeQuests.filter((q) => q.linkedToGoal);
  return {
    linked: linkedQuests.length,
    completed: linkedQuests.filter((q) => q.completed).length,
    failed: linkedQuests.filter((q) => q.failed).length,
  };
}

// Deterministic, evidence-based, single implicit dimension ("progress
// toward the current Goal") for v1 — see the inspection report for why a
// separate evidence table / goals table / multidimensional model is not
// introduced here. Pure function: same quests array in, same result out,
// every time. No AI, no external state, no randomness.
const EVIDENCE_STEP = 1;

export function deriveTrajectory(quests: Quest[]): TrajectoryResult {
  // Evidence rule, exactly as specified: linkedToGoal === true AND
  // (completed === true OR failed === true). A Quest that is merely
  // active or was never goal-linked contributes nothing — creating a
  // Quest never moves trajectory, only its resolution does.
  const safeQuests = Array.isArray(quests) ? quests.filter(Boolean) : [];
  const evidence = safeQuests
    .filter((q) => q.linkedToGoal && (q.completed || q.failed))
    .sort((a, b) => (deriveResolvedAt(a) || "").localeCompare(deriveResolvedAt(b) || ""));

  let actualPosition = 0;
  let intendedPosition = 0;
  const actual: TrajectoryPoint[] = [];
  const intended: TrajectoryPoint[] = [];

  for (const quest of evidence) {
    const outcome: "completed" | "failed" = quest.completed ? "completed" : "failed";
    actualPosition += outcome === "completed" ? EVIDENCE_STEP : -EVIDENCE_STEP;
    intendedPosition += EVIDENCE_STEP; // the reference path: every linked Quest, had it gone as intended
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
}

// Evidence-based Goal Pace derivation.
// Computes required daily pace from the remaining goal-linked quests and target date,
// and compares it against actual daily pace observed over the user's recent history (up to 14 days).
// Pure function: no invented quotas, no fallback numbers, no fake momentum.
export function deriveGoalPace(
  quests: Quest[],
  targetDateStr: string | null | undefined,
): GoalPaceResult | null {
  if (!targetDateStr) return null;

  const targetDate = new Date(
    targetDateStr.includes("T") ? targetDateStr : `${targetDateStr}T23:59:59`
  );
  if (isNaN(targetDate.getTime())) return null;

  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  if (diffMs <= 0) return null;

  const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const remainingGoalQuests = quests.filter((q) => q.linkedToGoal && !q.completed).length;
  const requiredDailyPace = Number((remainingGoalQuests / daysRemaining).toFixed(2));

  const fourteenDaysAgo = now.getTime() - 14 * 24 * 60 * 60 * 1000;
  const recentGoalCompletedQuests = quests.filter((q) => {
    if (!q.linkedToGoal || !q.completed) return false;
    const resolved = new Date(deriveResolvedAt(q)).getTime();
    return !isNaN(resolved) && resolved >= fourteenDaysAgo;
  });
  const recentGoalCompleted = recentGoalCompletedQuests.length;

  const timestamps = quests
    .map((q) => new Date(deriveResolvedAt(q)).getTime())
    .filter((t) => !isNaN(t));
  const earliestTimestamp = timestamps.length > 0 ? Math.min(...timestamps) : now.getTime();
  const daysSinceEarliest = Math.max(1, Math.ceil((now.getTime() - earliestTimestamp) / (1000 * 60 * 60 * 24)));
  const daysObserved = Math.min(14, daysSinceEarliest);

  const actualDailyPace = Number((recentGoalCompleted / daysObserved).toFixed(2));

  let paceRatio: number;
  if (requiredDailyPace > 0) {
    paceRatio = Number((actualDailyPace / requiredDailyPace).toFixed(2));
  } else {
    paceRatio = remainingGoalQuests === 0 ? 1 : 0;
  }

  const isOnTrack = paceRatio >= 0.9;

  const targetDateFormatted = targetDate.toLocaleDateString(undefined, {
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
    daysObserved,
    recentGoalCompleted,
  };
}

