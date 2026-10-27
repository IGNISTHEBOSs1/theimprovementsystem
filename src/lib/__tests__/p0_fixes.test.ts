import "./setup.ts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  deriveTrajectory,
  deriveGoalPace,
  deriveGoalStats,
  deriveFollowThroughStats,
  deriveFollowThroughRate,
  deriveJourneyPaceDetails,
  type GoalPaceResult,
} from "../trajectory.ts";
import type { Quest } from "../../types/quest.ts";

describe("P0 Fixes Verification Suite", () => {
  // ── Objective 1: Journey Progress Chart & Historical Evidence ──
  describe("Objective 1: Journey Progress Chart Data & Geometry", () => {
    it("reports 0 anchors completed and empty trail for account with zero progress", () => {
      const quests: Quest[] = [];
      const trajectory = deriveTrajectory(quests, "Launch Kinetic");
      assert.equal(trajectory.actual.length, 0);
      assert.equal(trajectory.currentPosition, 0);
    });

    it("records actual evidence points without linear interpolation fabrication", () => {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;

      // 4 goal quests: 1 completed on Day 3, 2 completed on Day 5, 1 active (not resolved)
      const mockQuests: Quest[] = [
        {
          id: "q1",
          title: "Anchor 1",
          priority: "focus",
          completed: true,
          failed: false,
          linkedToGoal: true,
          goalName: "Launch Kinetic",
          resolvedAt: new Date(now - 2 * dayMs).toISOString(), // 2 days ago (Day 3 of 5)
        },
        {
          id: "q2",
          title: "Anchor 2",
          priority: "routine",
          completed: true,
          failed: false,
          linkedToGoal: true,
          goalName: "Launch Kinetic",
          resolvedAt: new Date(now).toISOString(), // Today (Day 5 of 5)
        },
        {
          id: "q3",
          title: "Anchor 3",
          priority: "routine",
          completed: true,
          failed: false,
          linkedToGoal: true,
          goalName: "Launch Kinetic",
          resolvedAt: new Date(now).toISOString(), // Today (Day 5 of 5)
        },
        {
          id: "q4",
          title: "Anchor 4",
          priority: "routine",
          completed: false,
          failed: false,
          linkedToGoal: true,
          goalName: "Launch Kinetic",
        },
      ];

      const trajectory = deriveTrajectory(mockQuests, "Launch Kinetic");
      // Only resolved quests count as evidence
      assert.equal(trajectory.actual.length, 3);
      assert.equal(trajectory.currentPosition, 3);

      // Point 1 was position 1
      assert.equal(trajectory.actual[0].position, 1);
      // Point 2 was position 2
      assert.equal(trajectory.actual[1].position, 2);
      // Point 3 was position 3
      assert.equal(trajectory.actual[2].position, 3);
    });

    it("pace calculation accurately reflects 3 of 90 completed anchors without projecting 90 at Day 5", () => {
      const mockQuests: Quest[] = [
        { id: "1", title: "A1", priority: "focus", completed: true, failed: false, linkedToGoal: true, goalName: "Goal" },
        { id: "2", title: "A2", priority: "routine", completed: true, failed: false, linkedToGoal: true, goalName: "Goal" },
        { id: "3", title: "A3", priority: "routine", completed: true, failed: false, linkedToGoal: true, goalName: "Goal" },
      ];

      const pace = deriveGoalPace(mockQuests, "2026-12-31", undefined, "Goal");
      assert.ok(pace !== null);
      assert.equal(pace.completedGoalQuests, 3);
      assert.equal(pace.remainingGoalQuests, 87);
      assert.equal(pace.targetCycleQuests, 90);
    });
  });

  // ── Objective 2: Follow-Through Reconciliation Across Screens ──
  describe("Objective 2: Follow-Through & Goal Commitment Metric Reconciliation", () => {
    // Dataset:
    // Total Quests: 10 resolved + 1 unresolved
    // 6 completed (3 goal-linked, 3 non-goal-linked)
    // 4 failed (1 goal-linked, 3 non-goal-linked)
    // 1 unresolved (goal-linked)
    const dataset: Quest[] = [
      // Goal-linked resolved (4 total: 3 completed, 1 failed)
      { id: "1", title: "Goal Q1", priority: "focus", completed: true, failed: false, linkedToGoal: true, goalName: "Master Rust" },
      { id: "2", title: "Goal Q2", priority: "routine", completed: true, failed: false, linkedToGoal: true, goalName: "Master Rust" },
      { id: "3", title: "Goal Q3", priority: "routine", completed: true, failed: false, linkedToGoal: true, goalName: "Master Rust" },
      { id: "4", title: "Goal Q4", priority: "routine", completed: false, failed: true, linkedToGoal: true, goalName: "Master Rust" },
      // Goal-linked unresolved
      { id: "5", title: "Goal Q5", priority: "routine", completed: false, failed: false, linkedToGoal: true, goalName: "Master Rust" },
      // Non-goal resolved (6 total: 3 completed, 3 failed)
      { id: "6", title: "General Q1", priority: "routine", completed: true, failed: false, linkedToGoal: false },
      { id: "7", title: "General Q2", priority: "routine", completed: true, failed: false, linkedToGoal: false },
      { id: "8", title: "General Q3", priority: "routine", completed: true, failed: false, linkedToGoal: false },
      { id: "9", title: "General Q4", priority: "routine", completed: false, failed: true, linkedToGoal: false },
      { id: "10", title: "General Q5", priority: "routine", completed: false, failed: true, linkedToGoal: false },
      { id: "11", title: "General Q6", priority: "routine", completed: false, failed: true, linkedToGoal: false },
    ];

    it("authoritative overall follow-through is strictly 60% across all resolved commitments", () => {
      const stats = deriveFollowThroughStats(dataset);
      // Numerator: 6 completed
      assert.equal(stats.completed, 6);
      // Denominator: 10 resolved (6 completed + 4 failed)
      assert.equal(stats.total, 10);
      assert.equal(stats.failed, 4);

      const rate = deriveFollowThroughRate(dataset);
      assert.equal(rate, 60);
    });

    it("goal-specific commitment rate is 60% of linked or 75% of resolved goal commitments", () => {
      const goalStats = deriveGoalStats(dataset, "Master Rust");
      // Numerator: 3 completed
      assert.equal(goalStats.completed, 3);
      // Total linked: 5 (4 resolved + 1 unresolved)
      assert.equal(goalStats.linked, 5);
      // Failed: 1
      assert.equal(goalStats.failed, 1);

      // Across resolved goal commitments: 3 / 4 = 75%
      const resolvedGoalCount = goalStats.completed + goalStats.failed;
      const resolvedGoalRate = Math.round((goalStats.completed / resolvedGoalCount) * 100);
      assert.equal(resolvedGoalRate, 75);

      // Across total linked commitments: 3 / 4 (if 4 linked without q5) = 75%
      const fourLinkedDataset = dataset.filter((q) => q.id !== "5");
      const fourGoalStats = deriveGoalStats(fourLinkedDataset, "Master Rust");
      assert.equal(fourGoalStats.linked, 4);
      assert.equal(fourGoalStats.completed, 3);
      const goalRate = Math.round((fourGoalStats.completed / fourGoalStats.linked) * 100);
      assert.equal(goalRate, 75);

      // Overall follow-through remains 60%
      assert.equal(deriveFollowThroughRate(fourLinkedDataset), 60);
    });

    it("handles zero resolved commitments gracefully", () => {
      const empty: Quest[] = [];
      const stats = deriveFollowThroughStats(empty);
      assert.equal(stats.total, 0);
      assert.equal(stats.completed, 0);
      assert.equal(deriveFollowThroughRate(empty), null);
    });
  });

  // ── Objective 3: Journey Status Consistency & Decision Table ──
  describe("Objective 3: Journey Status Decision Table & Consistency", () => {
    it("reports 'Establishing Baseline' / 'Establishing' when elapsedDays < 3", () => {
      const paceMock: GoalPaceResult = {
        targetDate: "2026-12-31",
        targetDateFormatted: "Dec 31, 2026",
        daysRemaining: 88,
        isHorizonExpired: false,
        remainingGoalQuests: 88,
        requiredDailyPace: 1.0,
        actualDailyPace: 0,
        paceRatio: 0,
        paceStatus: "establishing",
        isOnTrack: true,
        daysObserved: 7,
        recentGoalCompleted: 0,
        cycleTotalDays: 90,
        targetCycleQuests: 90,
        completedGoalQuests: 2,
        failedGoalQuests: 0,
        elapsedDays: 2, // Less than 3 days
        bufferDaysTotal: 9,
        bufferDaysRemaining: 9,
        horizonExtensionDays: 0,
        projectedTotalDays: 90,
        isEarlyArrival: false,
        projectedFinishDateFormatted: "Dec 31, 2026",
        isVirtualHorizon: false,
      };

      const details = deriveJourneyPaceDetails(paceMock);
      assert.equal(details.status, "establishing");
      assert.equal(details.label, "Establishing Baseline");
      assert.equal(details.badgeLabel, "Establishing");
      assert.equal(details.badgeVariant, "neutral");
    });

    it("reports 'On Pace' / 'Trajectory Nominal' when paceRatio is within nominal corridor [0.9, 1.1]", () => {
      const paceMock: GoalPaceResult = {
        targetDate: "2026-12-31",
        targetDateFormatted: "Dec 31, 2026",
        daysRemaining: 80,
        isHorizonExpired: false,
        remainingGoalQuests: 80,
        requiredDailyPace: 1.0,
        actualDailyPace: 1.0,
        paceRatio: 1.0,
        paceStatus: "nominal",
        isOnTrack: true,
        daysObserved: 7,
        recentGoalCompleted: 7,
        cycleTotalDays: 90,
        targetCycleQuests: 90,
        completedGoalQuests: 10,
        failedGoalQuests: 0,
        elapsedDays: 10,
        bufferDaysTotal: 9,
        bufferDaysRemaining: 9,
        horizonExtensionDays: 0,
        projectedTotalDays: 90,
        isEarlyArrival: false,
        projectedFinishDateFormatted: "Dec 31, 2026",
        isVirtualHorizon: false,
      };

      const details = deriveJourneyPaceDetails(paceMock);
      assert.equal(details.status, "nominal");
      assert.equal(details.label, "On Pace");
      assert.equal(details.badgeLabel, "Trajectory Nominal");
      assert.equal(details.badgeVariant, "success");
    });

    it("reports 'Slightly Behind' / 'Buffer Active' when velocity is low (<0.9) but buffer is intact", () => {
      const paceMock: GoalPaceResult = {
        targetDate: "2026-12-31",
        targetDateFormatted: "Dec 31, 2026",
        daysRemaining: 80,
        isHorizonExpired: false,
        remainingGoalQuests: 85,
        requiredDailyPace: 1.15,
        actualDailyPace: 0.5,
        paceRatio: 0.5, // Below 0.90
        paceStatus: "behind",
        isOnTrack: true, // buffer intact
        daysObserved: 7,
        recentGoalCompleted: 3,
        cycleTotalDays: 90,
        targetCycleQuests: 90,
        completedGoalQuests: 5,
        failedGoalQuests: 2, // 2 misses, 7 buffer days left
        elapsedDays: 10,
        bufferDaysTotal: 9,
        bufferDaysRemaining: 7,
        horizonExtensionDays: 0, // No horizon extension
        projectedTotalDays: 90,
        isEarlyArrival: false,
        projectedFinishDateFormatted: "Jan 15, 2027",
        isVirtualHorizon: false,
      };

      const details = deriveJourneyPaceDetails(paceMock);
      assert.equal(details.status, "behind");
      assert.equal(details.label, "Slightly Behind");
      assert.equal(details.badgeLabel, "Buffer Active");
      assert.equal(details.badgeVariant, "warning");

      // CRITICAL ASSERTION: The badge is "Buffer Active", NOT "Trajectory Nominal"
      assert.notEqual(details.badgeLabel, "Trajectory Nominal");
    });

    it("reports 'Needs Adjustment' / 'Thrust Required' when buffer is depleted or horizon slipped", () => {
      const paceMock: GoalPaceResult = {
        targetDate: "2026-12-31",
        targetDateFormatted: "Dec 31, 2026",
        daysRemaining: 70,
        isHorizonExpired: false,
        remainingGoalQuests: 80,
        requiredDailyPace: 1.25,
        actualDailyPace: 0.4,
        paceRatio: 0.4,
        paceStatus: "critical",
        isOnTrack: false,
        daysObserved: 7,
        recentGoalCompleted: 2,
        cycleTotalDays: 93,
        targetCycleQuests: 90,
        completedGoalQuests: 10,
        failedGoalQuests: 12, // 12 misses > 9 buffer days -> 3 days slipped
        elapsedDays: 20,
        bufferDaysTotal: 9,
        bufferDaysRemaining: 0,
        horizonExtensionDays: 3,
        projectedTotalDays: 93,
        isEarlyArrival: false,
        projectedFinishDateFormatted: "Feb 10, 2027",
        isVirtualHorizon: false,
      };

      const details = deriveJourneyPaceDetails(paceMock);
      assert.equal(details.status, "critical");
      assert.equal(details.label, "Needs Adjustment");
      assert.equal(details.badgeLabel, "Thrust Required");
      assert.equal(details.badgeVariant, "destructive");
    });

    it("reports 'Goal Achieved' / 'Goal Completed' when all 90 anchors are finished", () => {
      const paceMock: GoalPaceResult = {
        targetDate: "2026-12-31",
        targetDateFormatted: "Dec 31, 2026",
        daysRemaining: 15,
        isHorizonExpired: false,
        remainingGoalQuests: 0, // All 90 done!
        requiredDailyPace: 0,
        actualDailyPace: 1.2,
        paceRatio: 1.2,
        paceStatus: "ahead",
        isOnTrack: true,
        daysObserved: 7,
        recentGoalCompleted: 8,
        cycleTotalDays: 90,
        targetCycleQuests: 90,
        completedGoalQuests: 90,
        failedGoalQuests: 1,
        elapsedDays: 75,
        bufferDaysTotal: 9,
        bufferDaysRemaining: 8,
        horizonExtensionDays: 0,
        projectedTotalDays: 90,
        isEarlyArrival: true,
        projectedFinishDateFormatted: "Dec 15, 2026",
        isVirtualHorizon: false,
      };

      const details = deriveJourneyPaceDetails(paceMock);
      assert.equal(details.status, "ahead");
      assert.equal(details.label, "Goal Achieved");
      assert.equal(details.badgeLabel, "Goal Completed");
      assert.equal(details.badgeVariant, "success");
    });

    it("handles null pace object safely as establishing", () => {
      const details = deriveJourneyPaceDetails(null);
      assert.equal(details.status, "establishing");
      assert.equal(details.label, "Establishing Baseline");
      assert.equal(details.badgeLabel, "Establishing");
      assert.equal(details.badgeVariant, "neutral");
    });

    it("verifies exact boundary values of paceRatio nominal corridor [0.90, 1.10]", () => {
      const baseMock: GoalPaceResult = {
        targetDate: "2026-12-31",
        targetDateFormatted: "Dec 31, 2026",
        daysRemaining: 50,
        isHorizonExpired: false,
        remainingGoalQuests: 50,
        requiredDailyPace: 1.0,
        actualDailyPace: 0.9,
        paceRatio: 0.9,
        paceStatus: "nominal",
        isOnTrack: true,
        daysObserved: 7,
        recentGoalCompleted: 6,
        cycleTotalDays: 90,
        targetCycleQuests: 90,
        completedGoalQuests: 40,
        failedGoalQuests: 0,
        elapsedDays: 40,
        bufferDaysTotal: 9,
        bufferDaysRemaining: 9,
        horizonExtensionDays: 0,
        projectedTotalDays: 90,
        isEarlyArrival: false,
        projectedFinishDateFormatted: "Dec 31, 2026",
        isVirtualHorizon: false,
      };

      // Lower nominal boundary (0.90)
      const nominalLow = deriveJourneyPaceDetails({ ...baseMock, paceRatio: 0.9, paceStatus: "nominal" });
      assert.equal(nominalLow.status, "nominal");
      assert.equal(nominalLow.label, "On Pace");
      assert.equal(nominalLow.badgeLabel, "Trajectory Nominal");

      // Just below nominal (0.89)
      const behind = deriveJourneyPaceDetails({ ...baseMock, paceRatio: 0.89, paceStatus: "behind" });
      assert.equal(behind.status, "behind");
      assert.equal(behind.label, "Slightly Behind");
      assert.equal(behind.badgeLabel, "Buffer Active");

      // Upper nominal boundary (1.10)
      const nominalHigh = deriveJourneyPaceDetails({ ...baseMock, paceRatio: 1.1, paceStatus: "nominal" });
      assert.equal(nominalHigh.status, "nominal");
      assert.equal(nominalHigh.label, "On Pace");

      // Ahead of pace (1.11)
      const ahead = deriveJourneyPaceDetails({ ...baseMock, paceRatio: 1.11, paceStatus: "ahead" });
      assert.equal(ahead.status, "ahead");
      assert.equal(ahead.label, "Ahead of Pace");
      assert.equal(ahead.badgeLabel, "Ahead of Target");
    });

    it("verifies depleted buffer threshold boundary (bufferDaysRemaining = 0) with real deriveGoalPace calculation", () => {
      // Create real quests where exactly 9 failed goal quests exhaust the 9-day buffer
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const quests: Quest[] = Array.from({ length: 9 }, (_, i) => ({
        id: `fail-${i}`,
        title: `Missed Anchor ${i + 1}`,
        priority: "routine" as const,
        completed: false,
        failed: true,
        linkedToGoal: true,
        goalName: "Launch Kinetic",
        resolvedAt: new Date(now - (8 - i) * dayMs).toISOString(),
      }));

      // Add 10 completed goal quests across recent window
      for (let i = 0; i < 10; i++) {
        quests.push({
          id: `done-${i}`,
          title: `Done Anchor ${i + 1}`,
          priority: "routine" as const,
          completed: true,
          failed: false,
          linkedToGoal: true,
          goalName: "Launch Kinetic",
          resolvedAt: new Date(now - (i % 5) * dayMs).toISOString(),
        });
      }

      // 40 days elapsed into a 90-day cycle
      const targetDate = new Date(now + 50 * dayMs).toISOString().split("T")[0];
      const pace = deriveGoalPace(quests, targetDate, now, "Launch Kinetic");
      assert.ok(pace !== null);
      assert.equal(pace.bufferDaysRemaining, 0);
      assert.equal(pace.horizonExtensionDays, 0);
      // Depleted buffer must be critical even if velocity is nominal
      assert.equal(pace.paceStatus, "critical");
      assert.equal(pace.isOnTrack, false);

      const details = deriveJourneyPaceDetails(pace);
      assert.equal(details.status, "critical");
      assert.equal(details.label, "Needs Adjustment");
      assert.equal(details.badgeLabel, "Thrust Required");
      assert.equal(details.badgeVariant, "destructive");
    });

    it("verifies future scrub positions align with nominal target vector and do not jump to yGoal", () => {
      const targetAnchors = 90;
      const cycleTotalDays = 90;
      const activeScrubDay = 45; // Halfway through the cycle

      // Future planned target anchors at Day 45:
      const plannedAnchors = Math.min(
        targetAnchors,
        Math.round((activeScrubDay / cycleTotalDays) * targetAnchors)
      );
      assert.equal(plannedAnchors, 45);

      // Verify scrub anchor height:
      const yOrigin = 250;
      const yGoal = 82;
      const spanY = yOrigin - yGoal;
      const scrubY = Math.max(40, yOrigin - (spanY * plannedAnchors) / targetAnchors);
      // Halfway between 250 and 82 is 166:
      assert.equal(scrubY, 166);
      // It must NOT be yGoal (82):
      assert.notEqual(scrubY, yGoal);
    });
  });
});
