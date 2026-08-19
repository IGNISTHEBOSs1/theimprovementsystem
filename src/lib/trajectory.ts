import type { Quest } from "@/types/quest";

export interface TrajectoryPoint {
  // Cumulative position after this evidence point.
  position: number;
  // The exact Quest that produced this movement — every point on the
  // actual line must be traceable to something concrete, per the
  // Trajectory Engine's core requirement. Never synthesized.
  quest: Quest;
  // ISO timestamp used for ordering/display. NOTE: this is Quest.createdAt,
  // not a true resolution timestamp — see the data-model limitation
  // documented in useDashboardData.ts and the chunk report. No new field
  // was invented to work around this.
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

const EVIDENCE_STEP = 1;

// Deterministic, evidence-based, single implicit dimension ("progress
// toward the current Goal") for v1 — see the inspection report for why a
// separate evidence table / goals table / multidimensional model is not
// introduced here. Pure function: same quests array in, same result out,
// every time. No AI, no external state, no randomness.
export function deriveTrajectory(quests: Quest[]): TrajectoryResult {
  // Evidence rule, exactly as specified: linkedToGoal === true AND
  // (completed === true OR failed === true). A Quest that is merely
  // active or was never goal-linked contributes nothing — creating a
  // Quest never moves trajectory, only its resolution does.
  const evidence = quests
    .filter((q) => q.linkedToGoal && (q.completed || q.failed))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  let actualPosition = 0;
  let intendedPosition = 0;
  const actual: TrajectoryPoint[] = [];
  const intended: TrajectoryPoint[] = [];

  for (const quest of evidence) {
    const outcome: "completed" | "failed" = quest.completed ? "completed" : "failed";
    actualPosition += outcome === "completed" ? EVIDENCE_STEP : -EVIDENCE_STEP;
    intendedPosition += EVIDENCE_STEP; // the reference path: every linked Quest, had it gone as intended

    actual.push({ position: actualPosition, quest, timestamp: quest.createdAt, outcome });
    intended.push({ position: intendedPosition, quest, timestamp: quest.createdAt, outcome: "completed" });
  }

  return {
    actual,
    intended,
    currentPosition: actual.length > 0 ? actual[actual.length - 1].position : 0,
  };
}
