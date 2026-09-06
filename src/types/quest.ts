// Founder Decision (Quest priority chunk): priority is NOT difficulty,
// duration, urgency, XP, or age — it represents how important completing
// this Quest is to the user's intended improvement. Explicit and stable;
// never computed, decayed, or AI-assigned.
//
// Founder Decision (multi-active Quest chunk): multiple Quests may now be
// Essential simultaneously — the earlier one-Essential-at-a-time note here
// described an emergent side effect of the old single-active-Quest
// constraint, not a real rule, and no longer applies now that constraint
// is gone. Priority governs ordering only (see PRIORITY_RANK in
// lib/priority.ts): which active Quest is the Dashboard's primary focus,
// and display order elsewhere. It does not gate how many Quests may share
// a priority value.
export type QuestPriority = 'Essential' | 'Important' | 'Optional';

export interface Quest {
  id: string;
  title: string;
  priority: QuestPriority;
  timeFrame: string;
  scheduledFor?: string;
  // Founder Decision (RPG removal chunk): statCategory (an RPG attribute-
  // category tag, keyof the now-archived PlayerStats) removed — zero live
  // consumers found; same vestigial-field class as xpReward/creditReward.
  // Explicit, user-set linkage to the account's single primary goal. Never
  // inferred from title/content — set only when the user checks the box
  // at commit time. Absent/false means "not goal-aligned," not "unknown."
  linkedToGoal?: boolean;
  // Snapshot of the goal's text at the moment this Quest was linked to
  // it — not a live lookup of the account's current primary_goal. If the
  // user later changes their goal, this Quest (and its History entry)
  // still correctly shows what it was actually committed in support of.
  // Present only when linkedToGoal is true.
  goalName?: string;
  completed: boolean;
  failed: boolean;
  createdAt: string;
  // Founder Decision (Trajectory completeness chunk): the server-
  // authoritative instant this Quest was actually resolved (completed or
  // swept to failed) — distinct from createdAt, which only marks when it
  // was committed to. Absent on any still-active Quest, and absent on
  // Quests resolved before this field existed (no retroactive DB write —
  // see deriveResolvedAt in lib/trajectory.ts for the read-time fallback
  // to createdAt for that historical case). Never client-clock-derived;
  // always sourced from getServerLocalDate(...).instant.
  resolvedAt?: string;

  // Recurrence — Founder Decision (Quest recurrence chunk): cadence is
  // Daily + custom day-of-week selection; a resolved occurrence's series
  // auto-continues to the next eligible day. Both fields are absent on a
  // one-shot Quest (the default, and the only kind that existed before
  // this decision) — every existing stored Quest record is a valid,
  // unaffected one-shot Quest under this model.
  //
  // seriesId is stable across every occurrence of the same recurring
  // commitment; each occurrence is its own Quest object (own id,
  // createdAt, completed/failed) — a later occurrence is never a mutation
  // of an earlier one. recurrenceDays is 0=Sun..6=Sat, denormalized onto
  // every occurrence in the series rather than stored in a separate
  // series record, since there is no separate persistence model for
  // series — only the single game_state.quests array.
  seriesId?: string;
  recurrenceDays?: number[];
}
