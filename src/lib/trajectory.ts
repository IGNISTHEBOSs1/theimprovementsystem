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
  total: number;
}

export function normalizePriority(priority?: string | null): QuestPriority {
  if (priority === "Essential" || priority === "Core") return "Essential";
  if (priority === "Important") return "Important";
  return "Optional";
}

export function derivePriorityBreakdown(
  items: Array<Quest | TrajectoryPoint>,
  activeGoalName?: string | null,
): PriorityBreakdownEntry[] {
  const order: QuestPriority[] = ["Essential", "Important", "Optional"];
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];

  const quests: Quest[] = safeItems.map((item) => {
    if ("quest" in item && item.quest) {
      return item.quest;
    }
    return item as Quest;
  });

  const linkedQuests = quests.filter((q) => isLinkedToActiveGoal(q, activeGoalName));

  return order
    .map((priority) => {
      const matching = linkedQuests.filter((q) => normalizePriority(q.priority) === priority);
      const completed = matching.filter((q) => q.completed).length;
      const failed = matching.filter((q) => q.failed).length;
      return {
        priority,
        completed,
        failed,
        total: matching.length,
      };
    })
    .filter((entry) => entry.total > 0);
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

export function deriveFollowThroughRate(quests: Quest[]): number | null {
  const stats = deriveFollowThroughStats(quests);
  return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : null;
}

// Fix 3: Five-state velocity signal — authoritative pace reporting.
// "establishing"  — fewer than 3 days elapsed, no reliable signal yet
// "ahead"         — 7-day trailing pace > 1.1/day or all 90 anchors complete
// "nominal"       — pace within 0.9–1.1/day
// "behind"        — pace < 0.9/day, buffer still absorbing misses
// "critical"      — buffer exhausted (horizonExtensionDays > 0 or bufferDaysRemaining <= 0)
export type PaceStatus = "establishing" | "ahead" | "nominal" | "behind" | "critical";

export interface JourneyPaceDetails {
  status: PaceStatus;
  label: string;
  badgeLabel: string;
  explanation: string;
  badgeVariant: "neutral" | "success" | "warning" | "destructive";
}

export function deriveJourneyPaceDetails(pace: GoalPaceResult | null): JourneyPaceDetails {
  if (!pace || pace.paceStatus === "establishing") {
    return {
      status: "establishing",
      label: "Establishing Baseline",
      badgeLabel: "Establishing",
      explanation: "Baseline pace is calibrating (3 days of history required). One missed day will not change your plan.",
      badgeVariant: "neutral",
    };
  }

  if (pace.remainingGoalQuests === 0) {
    return {
      status: "ahead",
      label: "Goal Achieved",
      badgeLabel: "Goal Completed",
      explanation: "You have completed all 90 goal anchors! Your trajectory is fully accomplished.",
      badgeVariant: "success",
    };
  }

  if (
    pace.paceStatus === "critical" ||
    pace.isHorizonExpired ||
    pace.daysRemaining <= 0 ||
    pace.bufferDaysRemaining <= 0
  ) {
    return {
      status: "critical",
      label: "Needs Adjustment",
      badgeLabel: "Thrust Required",
      explanation: "Your target date is too close or buffer is depleted. Adjust your milestone date in Profile or rebalance your daily commitments.",
      badgeVariant: "destructive",
    };
  }

  if (pace.paceStatus === "behind") {
    const neededThisWeek = Math.max(1, Math.min(7, Math.ceil(pace.requiredDailyPace * 7) - 6));
    return {
      status: "behind",
      label: "Slightly Behind",
      badgeLabel: "Buffer Active",
      explanation: `Velocity is below nominal, but your flex buffer is currently absorbing the variance. You need ${neededThisWeek} goal-linked ${neededThisWeek === 1 ? "completion" : "completions"} this week to return to nominal pace.`,
      badgeVariant: "warning",
    };
  }

  if (pace.paceStatus === "ahead") {
    return {
      status: "ahead",
      label: "Ahead of Pace",
      badgeLabel: "Ahead of Target",
      explanation: "Your velocity is exceeding the nominal target pace. Strong momentum maintained.",
      badgeVariant: "success",
    };
  }

  return {
    status: "nominal",
    label: "On Pace",
    badgeLabel: "Trajectory Nominal",
    explanation: "Your buffer is intact: one missed day will not change your plan.",
    badgeVariant: "success",
  };
}

export interface GoalPaceResult {
  targetDate: string | null | undefined;
  targetDateFormatted: string;
  daysRemaining: number;
  isHorizonExpired: boolean;
  remainingGoalQuests: number;
  requiredDailyPace: number;
  actualDailyPace: number;
  paceRatio: number;
  paceStatus: PaceStatus;
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
  // Fix 6: true when no real target date was set — Journey shows a soft banner
  isVirtualHorizon: boolean;
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
  // Fix 6: No longer returns null when targetDateStr is absent.
  // Previously a missing date caused Journey to fall back to arbitrary values
  // (pace?.elapsedDays ?? 1) — chart looked authoritative but used fabricated
  // coordinates. Now we synthesise a virtual 90-day horizon and set
  // isVirtualHorizon = true so the UI can show a soft non-blocking banner.
  const now = typeof nowMs === "number" ? new Date(nowMs) : new Date();
  const safeQuests = Array.isArray(quests) ? quests.filter(Boolean) : [];
  const trimmedTargetDate = typeof targetDateStr === "string" ? targetDateStr.trim() : targetDateStr;
  const isVirtualHorizon = !trimmedTargetDate;

  let targetDate: Date;
  if (trimmedTargetDate) {
    targetDate = new Date(
      trimmedTargetDate.includes("T") ? trimmedTargetDate : `${trimmedTargetDate}T23:59:59`
    );
    if (isNaN(targetDate.getTime())) return null;
  } else {
    // Virtual horizon: 90 calendar days from today
    targetDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  }

  const completedGoalQuests = safeQuests.filter((q) => isLinkedToActiveGoal(q, activeGoalName) && q.completed).length;
  const failedGoalQuests = safeQuests.filter((q) => isLinkedToActiveGoal(q, activeGoalName) && q.failed).length;

  const targetCycleQuests = 90;
  const bufferDaysTotal = 9;
  const bufferDaysRemaining = Math.max(0, bufferDaysTotal - failedGoalQuests);
  const horizonExtensionDays = Math.max(0, failedGoalQuests - bufferDaysTotal);
  const projectedTotalDays = 90 + failedGoalQuests;
  const cycleTotalDays = 90 + horizonExtensionDays;

  // Dynamic target date accounts for excess horizon slips S
  const effectiveTargetDate = new Date(targetDate.getTime() + horizonExtensionDays * 24 * 60 * 60 * 1000);
  const diffMs = effectiveTargetDate.getTime() - now.getTime();
  const isHorizonExpired = diffMs <= 0;

  // Allow daysRemaining to reach 0 when diffMs <= 0
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  // Fix 1: Cycle start derived deterministically from user intent (targetDate),
  // not from resolved quest timestamps. The old approach meant a new user with
  // zero resolved quests got cycleStartMs = targetDate - 90 days, so
  // elapsedDays = 90 on Day 1 of their cycle. New: always stable, independent
  // of quest activity. If now < cycleStart (far-future target), clamps to Day 1.
  const cycleStartMs = targetDate.getTime() - cycleTotalDays * 24 * 60 * 60 * 1000;
  const rawElapsed = Math.floor((now.getTime() - cycleStartMs) / (1000 * 60 * 60 * 24)) + 1;
  const elapsedDays = Math.max(1, Math.min(cycleTotalDays, rawElapsed));

  const remainingGoalQuests = Math.max(0, targetCycleQuests - completedGoalQuests);

  // Required daily pace to finish remaining quota in remaining days (or remaining count if horizon reached)
  const requiredDailyPace = daysRemaining > 0
    ? Number(Math.min(3.0, Math.max(0.1, remainingGoalQuests / daysRemaining)).toFixed(2))
    : (remainingGoalQuests > 0 ? remainingGoalQuests : 0);

  // Fix 2: Honest 7-day trailing average — no burst flattery.
  // Old: max(overallPace, windowPace) meant 3 quests in one day = 3.0/day forever.
  // New: strict 7-day window only. Before 3 days elapsed, report 0.0 (not enough
  // signal) so the UI shows "Establishing baseline" rather than inflated confidence.
  const TRAILING_WINDOW_DAYS = 7;
  const MIN_OBSERVATION_DAYS = 3;
  const observedDays = TRAILING_WINDOW_DAYS;
  const windowStart = now.getTime() - TRAILING_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  const recentGoalCompletedQuests = safeQuests.filter((q) => {
    if (!isLinkedToActiveGoal(q, activeGoalName) || !q.completed) return false;
    const resolved = new Date(deriveResolvedAt(q)).getTime();
    return !isNaN(resolved) && resolved >= windowStart;
  });
  const recentGoalCompleted = recentGoalCompletedQuests.length;

  const hasEnoughData = elapsedDays >= MIN_OBSERVATION_DAYS;
  const actualDailyPace = Number(
    (hasEnoughData ? recentGoalCompleted / TRAILING_WINDOW_DAYS : 0).toFixed(2)
  );

  const nominalDailyPace = 1.0;
  const paceRatio = Number((actualDailyPace / nominalDailyPace).toFixed(2));

  // Fix 3a: isOnTrack is now purely buffer-based — decoupled from velocity.
  // "On track" = the horizon hasn't slipped yet and buffer is not exhausted.
  const isOnTrack =
    remainingGoalQuests === 0 ||
    (horizonExtensionDays === 0 && bufferDaysRemaining > 0 && !isHorizonExpired && daysRemaining > 0);

  // Fix 3b: Five-state paceStatus — authoritative velocity & buffer signal aligned with decision table.
  const paceStatus: PaceStatus = (() => {
    if (!hasEnoughData)              return "establishing";
    if (remainingGoalQuests === 0)   return "ahead";
    if (
      horizonExtensionDays > 0 ||
      bufferDaysRemaining <= 0 ||
      isHorizonExpired ||
      daysRemaining <= 0
    ) {
      return "critical";
    }
    if (paceRatio > 1.1)             return "ahead";
    if (paceRatio >= 0.9)            return "nominal";
    return "behind";
  })();

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
    isHorizonExpired,
    remainingGoalQuests,
    requiredDailyPace,
    actualDailyPace,
    paceRatio,
    paceStatus,
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
    isVirtualHorizon,
  };
}

