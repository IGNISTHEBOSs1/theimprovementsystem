import type { Quest } from "@/types/quest";
import { deriveResolvedAt } from "@/lib/trajectory";

export interface NarrativeMetrics {
  momentum: number; // 0 - 100 percentage
  recentMisses: number; // misses in last 48-72h
  consecutiveDays: number; // current streak
  targetDaysRemaining: number;
  paceVsTarget: number; // actual pace / required pace (e.g. 1.1 = 10% ahead)
  dailyVelocity: number; // quests per day
  completedCount: number;
  totalLinked: number;
}

/**
 * Deterministic "Mad Libs" Narrative Synthesis Engine
 * Purely local, rule-based heuristic generation with zero LLM API costs.
 */
export function getNarrativeSummary(metrics: NarrativeMetrics): string {
  const { momentum, recentMisses, consecutiveDays, targetDaysRemaining, paceVsTarget } = metrics;

  // 1. Gentle Re-entry (highest priority: prevent abandonment & cognitive overwhelm)
  if (recentMisses >= 3) {
    return "Rest is part of the process. Tap here to gently realign your trajectory for tomorrow.";
  }

  // 2. The Slump (protect user energy before severe burnout)
  if (momentum < 50 && recentMisses >= 2) {
    return "Momentum naturally ebbs and flows. Let's make today's Quest half-size to protect your energy.";
  }

  // 3. The Hot Streak (positive reinforcement & clear milestone target)
  if (consecutiveDays >= 5) {
    const daysToHit = Math.max(1, targetDaysRemaining);
    return `You are pacing ahead of schedule. Keep this exact velocity for ${daysToHit} more days to hit your milestone.`;
  }

  // 4. High Velocity / Pulling Milestone In
  if (paceVsTarget > 1.2 && consecutiveDays >= 2) {
    return "High velocity detected. Your steady execution is pulling your target arrival date forward.";
  }

  // 5. On Track / Inside Corridor
  if (paceVsTarget >= 0.9 && paceVsTarget <= 1.2) {
    return "Flight path steady and locked inside the optimal corridor. Maintain your standard cadence.";
  }

  // 6. Minor Drift (1 recent miss)
  if (recentMisses === 1) {
    return "Minor course drift detected. A single completed focus today returns your trajectory to centerline.";
  }

  // 7. Default baseline
  return "Your flight path is set. Commit to your primary focus today to anchor your initial velocity.";
}

export interface TrajectoryEngineState {
  velocity: number; // quests per day (e.g. 1.8)
  requiredPace: number; // required daily pace (e.g. 1.5)
  paceRatio: number; // velocity / requiredPace
  targetDate: Date;
  targetDateLabel: string;
  daysRemaining: number;
  isOnTrack: boolean;
  variancePct: number; // acceptable variance, e.g. 10%
  completedQuests: number;
  targetQuests: number;
  narrative: string;
  metrics: NarrativeMetrics;
}

/**
 * Derives dynamic aviation ETA and velocity metrics based on user quest history
 */
export function computeTrajectoryEngine(
  quests: Quest[],
  streak: number,
  goalLabel?: string
): TrajectoryEngineState {
  const resolved = quests.filter((q) => q.completed || q.failed);

  // Consider quests resolved in the past 14 days for dynamic velocity
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const recentResolved = resolved.filter(
    (q) => new Date(deriveResolvedAt(q)).getTime() >= fourteenDaysAgo
  );
  const recentCompleted = recentResolved.filter((q) => q.completed);

  // Velocity = completed / days observed (minimum 1 day sample)
  const daysObserved = Math.max(1, Math.min(14, Math.ceil((Date.now() - fourteenDaysAgo) / (24 * 3600 * 1000))));
  const rawVelocity = recentCompleted.length / (daysObserved || 1);
  const velocity = Math.max(0.5, Math.round(rawVelocity * 10) / 10);

  // Target quota: linked quests or standard 12-quest sprint milestone
  const goalLinked = quests.filter((q) => q.linkedToGoal);
  const targetQuests = goalLinked.length > 0 ? Math.max(goalLinked.length, 6) : 10;
  const completedGoalCount = goalLinked.filter((q) => q.completed).length;
  const remainingQuests = Math.max(1, targetQuests - completedGoalCount);

  // Required pace based on a standard 7-day milestone window
  const defaultHorizonDays = 7;
  const requiredPace = Math.round((remainingQuests / defaultHorizonDays) * 10) / 10;

  // Dynamic ETA: If velocity > required, arrival pulls closer. If velocity < required, pushes back.
  const daysToArrival = Math.max(1, Math.ceil(remainingQuests / (velocity || 1)));
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysToArrival);

  // Format arrival label (e.g. "Friday, Oct 4")
  const targetDateLabel = targetDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Recent misses in last 48 hours
  const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
  const recentMisses = resolved.filter(
    (q) => q.failed && new Date(deriveResolvedAt(q)).getTime() >= fortyEightHoursAgo
  ).length;

  const momentum = recentResolved.length > 0
    ? Math.round((recentCompleted.length / recentResolved.length) * 100)
    : 75;

  const paceRatio = requiredPace > 0 ? velocity / requiredPace : 1.0;
  // 10% acceptable variance corridor: [0.90, 1.10+]
  const isOnTrack = paceRatio >= 0.90;

  const metrics: NarrativeMetrics = {
    momentum,
    recentMisses,
    consecutiveDays: streak,
    targetDaysRemaining: daysToArrival,
    paceVsTarget: paceRatio,
    dailyVelocity: velocity,
    completedCount: completedGoalCount,
    totalLinked: targetQuests,
  };

  const narrative = getNarrativeSummary(metrics);

  return {
    velocity,
    requiredPace,
    paceRatio,
    targetDate,
    targetDateLabel,
    daysRemaining: daysToArrival,
    isOnTrack,
    variancePct: 10,
    completedQuests: completedGoalCount,
    targetQuests,
    narrative,
    metrics,
  };
}
