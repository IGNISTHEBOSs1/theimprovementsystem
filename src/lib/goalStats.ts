import type { Quest } from "@/types/quest";

// Founder Decision (Goal→Quest→Outcome loop chunk, #5A/#5B): a small,
// deterministic summary of what a Goal has actually gotten from the
// user — how many Quests were explicitly linked to it, and how many of
// those were completed. Deliberately broader than trajectory evidence
// (see lib/trajectory.ts): this counts EVERY linked Quest, including
// ones still active/unresolved, not just resolved evidence — "12 Quests
// linked, 8 completed" is a different, complementary question from
// "where does your trajectory currently sit." Pure function, no AI, no
// invented data — every number traces directly to quests.linkedToGoal.
export interface GoalLinkageStats {
  totalLinked: number;
  completedLinked: number;
}

export function deriveGoalLinkageStats(quests: Quest[]): GoalLinkageStats {
  const linked = quests.filter((q) => q.linkedToGoal);
  return {
    totalLinked: linked.length,
    completedLinked: linked.filter((q) => q.completed).length,
  };
}
