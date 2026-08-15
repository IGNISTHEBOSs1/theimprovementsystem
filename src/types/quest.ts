import type { PlayerStats } from '@/lib/attributes';

export type QuestDifficulty = 'Easy' | 'Normal' | 'Hard' | 'Urgent';

export interface Quest {
  id: string;
  title: string;
  difficulty: QuestDifficulty;
  xpReward: number;
  creditReward: number;
  timeFrame: string;
  scheduledFor?: string;
  statCategory?: keyof PlayerStats;
  // Explicit, user-set linkage to the account's single primary goal. Never
  // inferred from title/content — set only when the user checks the box
  // at commit time. Absent/false means "not goal-aligned," not "unknown."
  linkedToGoal?: boolean;
  completed: boolean;
  failed: boolean;
  createdAt: string;

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
