import type { Quest } from "@/types/quest";
import { deriveTrajectory, deriveResolvedAt } from "@/lib/trajectory";

// Founder Decision (Guidance chunk): "deterministic, data-grounded
// guidance only — no LLM." Every message here is produced by a pure
// function over the account's real Quest history: no external API call,
// no model inference, no randomness, no invented facts. Same input,
// same output, every time — identical spirit to deriveTrajectory.
//
// Founder Decision (Mentor depth chunk): two further rules, same
// standard — trajectory position (reuses deriveTrajectory's own numbers,
// no new derivation) and priority-specific completion rate (reads
// completed/failed directly, same as the weekday rule below).
//
// Founder Decision (Mentor depth chunk, evidence expansion): three more
// rules on top of those, reading data already in the model that no
// guidance rule previously touched — seriesId (recurring-series
// reliability), linkedToGoal (goal-linked vs non-goal-linked follow-
// through), and cross-Quest chronological ordering via deriveResolvedAt
// (recovery after a miss). Seven rules total, deliberately still narrow
// rather than an open-ended rule engine:
//
// 1. Repeated one-shot commitment — the same commitment typed 3+ times
//    as separate one-shot Quests is itself evidence the user is already
//    treating it as recurring; recurrence isn't invented, it's noticed.
// 2. Weekday miss concentration — when a clear majority of failures
//    cluster on one weekday, that's a real, visible pattern worth
//    naming, not a prediction.
// 3. Recurring-series reliability — one specific series completing
//    notably worse than the account's overall rate, with a real sample.
// 4. Goal-linkage gap — goal-linked vs non-goal-linked completion rates
//    diverging meaningfully, in either direction.
// 5. Recovery after a miss — how often a miss is immediately followed by
//    another miss, not a consecutive-run streak count.
// 6. Trajectory position — only fires when meaningfully behind the
//    intended path (a higher bar than Journey's own no-threshold
//    reporting, so this is "worth a note," not a running score).
//    Deliberately does not fire when ahead — an "ahead" message reads as
//    praise/gamification, which guidance is not for.
// 7. Priority completion pattern — compares resolved-Quest completion
//    rates across priority tiers; only fires on a real, sizeable gap
//    with a minimum sample in both tiers, not on a couple of data points.
//
// Every rule recomputes from `quests` on every call — nothing here is
// stored, cached, or persisted. If the underlying pattern stops being
// true (the repeated commitment becomes recurring, the weekday
// concentration evens out, trajectory catches up, completion rates
// converge), the corresponding message simply isn't produced the next
// time this runs. There is no separate "dismiss" mechanism because none
// is needed — a resolved pattern cannot linger as stale advice.
//
// Known, stated limitation (same one documented in trajectory.ts): Quest
// has no true resolution timestamp, only createdAt, and createdAt is a
// UTC instant. Rule 2 derives weekday via createdAt's UTC calendar day
// (Date.getUTCDay()), not the user's local day (unlike the recurrence
// engine, this has no access to the async server-local date — it must
// stay a synchronous pure function). For users far from UTC this can
// misattribute a small number of boundary-case Quests to the adjacent
// weekday. This is disclosed in the guidance copy itself, not hidden.
export interface GuidanceMessage {
  id: string;
  text: string;
}

const MIN_REPEAT_COUNT = 3;
const MIN_FAILURES_FOR_WEEKDAY_RULE = 3;
const WEEKDAY_CONCENTRATION_THRESHOLD = 0.5;
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// Higher than "any deficit" — Journey already reports the exact position
// plainly and unconditionally. Mentor's bar is "worth pointing out," not
// "worth reporting," so this stays quiet on small, normal fluctuation.
const MIN_TRAJECTORY_DEFICIT = 3;
const MIN_RESOLVED_PER_PRIORITY = 3;
const MIN_COMPLETION_RATE_GAP = 0.4;
// Founder Decision (Mentor depth chunk, evidence expansion): same
// standard as the four rules above — a real, sizeable gap with a
// minimum sample, not a couple of data points. These three new rules
// read seriesId, linkedToGoal, and cross-Quest chronological ordering —
// all already present in the data model, none previously read by
// guidance.
const MIN_RESOLVED_PER_SERIES = 3;
const MIN_SERIES_RELIABILITY_GAP = 0.4;
const MIN_RESOLVED_PER_GOAL_GROUP = 3;
const MIN_GOAL_LINKAGE_GAP = 0.4;
const MIN_MISSES_WITH_FOLLOWUP_FOR_RECOVERY_RULE = 3;
const RECOVERY_REPEAT_FAILURE_THRESHOLD = 0.6;

function repeatedCommitmentGuidance(quests: Quest[]): GuidanceMessage | null {
  const oneShotTitles = quests
    .filter((q) => !q.seriesId)
    .map((q) => q.title.trim().toLowerCase())
    .filter(Boolean);

  const counts = new Map<string, number>();
  for (const title of oneShotTitles) {
    counts.set(title, (counts.get(title) ?? 0) + 1);
  }

  let best: { title: string; count: number } | null = null;
  for (const [title, count] of counts) {
    if (count >= MIN_REPEAT_COUNT && (!best || count > best.count)) {
      best = { title, count };
    }
  }
  if (!best) return null;

  // Recover original-case title for display — first matching Quest.
  const original = quests.find((q) => q.title.trim().toLowerCase() === best!.title)?.title ?? best.title;

  return {
    id: "repeated-commitment",
    text: `You've committed to "${original}" ${best.count} separate times. Making it a recurring Quest would mean you don't have to re-commit to it manually each time.`,
  };
}

function weekdayMissPatternGuidance(quests: Quest[]): GuidanceMessage | null {
  const failed = quests.filter((q) => q.failed);
  if (failed.length < MIN_FAILURES_FOR_WEEKDAY_RULE) return null;

  const countsByWeekday = new Array(7).fill(0) as number[];
  for (const quest of failed) {
    const weekday = new Date(quest.createdAt).getUTCDay();
    countsByWeekday[weekday] += 1;
  }

  const maxCount = Math.max(...countsByWeekday);
  const weekday = countsByWeekday.indexOf(maxCount);
  if (maxCount / failed.length < WEEKDAY_CONCENTRATION_THRESHOLD) return null;

  const dayLabel = WEEKDAY_NAMES[weekday];
  return {
    id: "weekday-miss-pattern",
    text: `${maxCount} of your last ${failed.length} missed Quests fell on a ${dayLabel}. Worth noticing if ${dayLabel}s tend to be busier than you're planning for.`,
  };
}

function trajectoryPositionGuidance(quests: Quest[]): GuidanceMessage | null {
  const trajectory = deriveTrajectory(quests);
  const intendedEnd = trajectory.intended.length > 0
    ? trajectory.intended[trajectory.intended.length - 1].position
    : 0;
  const deficit = intendedEnd - trajectory.currentPosition;
  if (deficit < MIN_TRAJECTORY_DEFICIT) return null;

  return {
    id: "trajectory-position",
    text: `You're ${deficit} steps behind where you intended to be on your goal. That's not a verdict on you — it's information for what to commit to next.`,
  };
}

function priorityCompletionGuidance(quests: Quest[]): GuidanceMessage | null {
  const resolved = quests.filter((q) => q.completed || q.failed);
  const priorities: Quest["priority"][] = ["Essential", "Important", "Optional"];

  const rates = priorities.map((priority) => {
    const inTier = resolved.filter((q) => q.priority === priority);
    if (inTier.length < MIN_RESOLVED_PER_PRIORITY) return null;
    return { priority, rate: inTier.filter((q) => q.completed).length / inTier.length, count: inTier.length };
  }).filter((r): r is { priority: Quest["priority"]; rate: number; count: number } => r !== null);

  if (rates.length < 2) return null;

  const best = rates.reduce((a, b) => (b.rate > a.rate ? b : a));
  const worst = rates.reduce((a, b) => (b.rate < a.rate ? b : a));
  if (best.priority === worst.priority || best.rate - worst.rate < MIN_COMPLETION_RATE_GAP) return null;

  return {
    id: "priority-completion-pattern",
    text: `Your ${worst.priority} Quests complete ${Math.round(worst.rate * 100)}% of the time, compared to ${Math.round(best.rate * 100)}% for your ${best.priority} ones. Worth noticing which commitments are actually realistic at that priority.`,
  };
}

// Founder Decision (Mentor depth chunk, evidence expansion): recurring-
// series reliability. Reads Quest.seriesId — already present on every
// occurrence of a recurring commitment (see types/quest.ts), previously
// unread by any guidance rule. Finds the one recurring series whose
// completion rate is notably worse than the account's overall resolved-
// Quest completion rate, with a real sample in both. Answers "what" (the
// specific series and its rate), "why it matters" (it's an outlier
// against the account's own baseline, not an arbitrary bar), and "what
// to adjust" (the commitment's cadence or scope may not match reality).
function seriesReliabilityGuidance(quests: Quest[]): GuidanceMessage | null {
  const resolved = quests.filter((q) => q.completed || q.failed);
  if (resolved.length < MIN_RESOLVED_PER_SERIES) return null;
  const overallRate = resolved.filter((q) => q.completed).length / resolved.length;

  const bySeriesId = new Map<string, Quest[]>();
  for (const quest of resolved) {
    if (!quest.seriesId) continue;
    const existing = bySeriesId.get(quest.seriesId) ?? [];
    existing.push(quest);
    bySeriesId.set(quest.seriesId, existing);
  }

  let worst: { title: string; rate: number; count: number } | null = null;
  for (const occurrences of bySeriesId.values()) {
    if (occurrences.length < MIN_RESOLVED_PER_SERIES) continue;
    const rate = occurrences.filter((q) => q.completed).length / occurrences.length;
    if (overallRate - rate < MIN_SERIES_RELIABILITY_GAP) continue;
    if (!worst || rate < worst.rate) {
      const mostRecentTitle = [...occurrences].sort(
        (a, b) => deriveResolvedAt(b).localeCompare(deriveResolvedAt(a)),
      )[0].title;
      worst = { title: mostRecentTitle, rate, count: occurrences.length };
    }
  }
  if (!worst) return null;

  return {
    id: "series-reliability",
    text: `Your recurring commitment "${worst.title}" completes ${Math.round(worst.rate * 100)}% of the time, well below your overall ${Math.round(overallRate * 100)}%. That gap is worth noticing — it may mean the cadence or scope you set for it doesn't match what's realistic right now.`,
  };
}

// Founder Decision (Mentor depth chunk, evidence expansion): goal-linked
// vs non-goal-linked follow-through. Reuses the same linkedToGoal field
// Journey's deriveGoalStats already reads, but asks a different
// question: not "how is the goal doing" (Journey's job) but "do I follow
// through differently depending on whether something is tied to my goal"
// (Mentor's job — a pattern in behavior, not a position on the goal).
function goalLinkageGapGuidance(quests: Quest[]): GuidanceMessage | null {
  const resolved = quests.filter((q) => q.completed || q.failed);
  const linked = resolved.filter((q) => q.linkedToGoal);
  const unlinked = resolved.filter((q) => !q.linkedToGoal);
  if (linked.length < MIN_RESOLVED_PER_GOAL_GROUP || unlinked.length < MIN_RESOLVED_PER_GOAL_GROUP) return null;

  const linkedRate = linked.filter((q) => q.completed).length / linked.length;
  const unlinkedRate = unlinked.filter((q) => q.completed).length / unlinked.length;
  const gap = linkedRate - unlinkedRate;
  if (Math.abs(gap) < MIN_GOAL_LINKAGE_GAP) return null;

  return gap < 0
    ? {
        id: "goal-linkage-gap",
        text: `Quests linked to your goal complete ${Math.round(linkedRate * 100)}% of the time, compared to ${Math.round(unlinkedRate * 100)}% for everything else. Worth noticing if goal-linked commitments are being set at a harder bar than the rest of what you commit to.`,
      }
    : {
        id: "goal-linkage-gap",
        text: `Quests linked to your goal complete ${Math.round(linkedRate * 100)}% of the time, compared to ${Math.round(unlinkedRate * 100)}% for everything else — noticeably more reliable. Worth noticing what's different about how you approach goal-linked commitments.`,
      };
}

// Founder Decision (Mentor depth chunk, evidence expansion): recovery
// after a miss. Orders ALL resolved Quests (not just goal-linked, unlike
// deriveTrajectory) by deriveResolvedAt to find, for each failed Quest,
// the next Quest resolved afterward — then asks how often that next
// Quest is also a miss. Deliberately not framed as a "streak" (no
// consecutive-run counting, no visual meter) — this is a single
// factual rate, phrased once, non-judgmentally. Answers "what" (the
// rate), "why it matters" (a miss compounding into another miss is a
// different situation than an isolated one), "what to adjust" (framed as
// a neutral suggestion, never a verdict).
function recoveryAfterMissGuidance(quests: Quest[]): GuidanceMessage | null {
  const resolved = [...quests.filter((q) => q.completed || q.failed)].sort(
    (a, b) => deriveResolvedAt(a).localeCompare(deriveResolvedAt(b)),
  );

  let followedByAnotherMiss = 0;
  let missesWithFollowup = 0;
  for (let i = 0; i < resolved.length - 1; i++) {
    if (!resolved[i].failed) continue;
    missesWithFollowup += 1;
    if (resolved[i + 1].failed) followedByAnotherMiss += 1;
  }
  if (missesWithFollowup < MIN_MISSES_WITH_FOLLOWUP_FOR_RECOVERY_RULE) return null;

  const repeatRate = followedByAnotherMiss / missesWithFollowup;
  if (repeatRate < RECOVERY_REPEAT_FAILURE_THRESHOLD) return null;

  return {
    id: "recovery-after-miss",
    text: `After a missed Quest, your next one is also missed ${Math.round(repeatRate * 100)}% of the time. A miss doesn't have to lead to another — a smaller, easier next commitment right after one might be worth trying.`,
  };
}

// Ordered by how directly actionable each rule is. At most one of each
// rule ever fires (not one per matching title/weekday/priority) — this
// stays a short, occasional note, not a running commentary.
export function deriveGuidance(quests: Quest[]): GuidanceMessage[] {
  const messages: GuidanceMessage[] = [];
  const repeated = repeatedCommitmentGuidance(quests);
  if (repeated) messages.push(repeated);
  const weekday = weekdayMissPatternGuidance(quests);
  if (weekday) messages.push(weekday);
  const seriesReliability = seriesReliabilityGuidance(quests);
  if (seriesReliability) messages.push(seriesReliability);
  const goalLinkage = goalLinkageGapGuidance(quests);
  if (goalLinkage) messages.push(goalLinkage);
  const recovery = recoveryAfterMissGuidance(quests);
  if (recovery) messages.push(recovery);
  const trajectoryPosition = trajectoryPositionGuidance(quests);
  if (trajectoryPosition) messages.push(trajectoryPosition);
  const priorityCompletion = priorityCompletionGuidance(quests);
  if (priorityCompletion) messages.push(priorityCompletion);
  return messages;
}
