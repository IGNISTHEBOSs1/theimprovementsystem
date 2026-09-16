import type { Quest } from "@/types/quest";
import { deriveResolvedAt } from "@/lib/trajectory";
import { toServerLocalDate } from "@/lib/serverTime";

// Founder-style decision, stated plainly: this file follows the same
// no-fabrication rule as insights.ts/guidance.ts elsewhere in this app —
// a proposal only renders when it's backed by real resolved history at
// or above the same MIN_SAMPLE discipline used everywhere else. There is
// no AI call here and nothing is invented: this is arithmetic over the
// user's own recurring-Quest completion history, same as every other
// "Mentor" surface in the app.
const MIN_SERIES_SAMPLE = 4; // resolved occurrences needed before a series' pattern counts
const MIN_DAY_SAMPLE = 2; // resolved occurrences on a specific weekday before that day's rate counts

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface RebalanceProposal {
  seriesId: string;
  questTitle: string;
  fromDay: number;
  toDay: number;
  fromDayLabel: string;
  toDayLabel: string;
  fromDayRate: number; // 0-1, this series' completion rate on fromDay
  toDayRate: number; // 0-1, this series' completion rate on toDay (or global rate if series has no history there yet)
  fromDaySample: number;
  currentDays: number[];
}

interface WeekdayStat {
  completed: number;
  total: number;
}

function weekdayOf(quest: Quest, timezone: string): number {
  return toServerLocalDate(new Date(deriveResolvedAt(quest)), timezone).weekday;
}

/**
 * Proposes moving ONE recurring series' worst-performing scheduled
 * weekday to its (or the account's) best-performing weekday — the same
 * "reduce or restructure one recurring commitment" adjustment insights.ts
 * already surfaces as text, made concrete and actionable. Returns null
 * when there isn't enough resolved history to say anything real, exactly
 * like every other Mentor insight in this app does below MIN_SAMPLE.
 */
export function computeRebalanceProposal(quests: Quest[], timezone: string): RebalanceProposal | null {
  const resolved = quests.filter((q) => (q.completed || q.failed) && q.seriesId && q.recurrenceDays?.length);

  // Global per-weekday completion rate, across ALL recurring series —
  // used as the fallback "how well does this account generally do on
  // day X" when the specific series doesn't have its own history there
  // yet (e.g. proposing a day it's never been scheduled on before).
  const globalByDay = new Map<number, WeekdayStat>();
  for (const q of resolved) {
    const day = weekdayOf(q, timezone);
    const stat = globalByDay.get(day) ?? { completed: 0, total: 0 };
    stat.total += 1;
    if (q.completed) stat.completed += 1;
    globalByDay.set(day, stat);
  }

  const bySeries = new Map<string, Quest[]>();
  for (const q of resolved) {
    const arr = bySeries.get(q.seriesId!) ?? [];
    arr.push(q);
    bySeries.set(q.seriesId!, arr);
  }

  let best: { proposal: RebalanceProposal; frictionScore: number } | null = null;

  for (const [seriesId, occurrences] of bySeries) {
    if (occurrences.length < MIN_SERIES_SAMPLE) continue;
    const recurrenceDays = occurrences[occurrences.length - 1].recurrenceDays ?? [];
    if (recurrenceDays.length < 2) continue; // a single-day series has nothing to redistribute onto

    const byDay = new Map<number, WeekdayStat>();
    for (const q of occurrences) {
      const day = weekdayOf(q, timezone);
      const stat = byDay.get(day) ?? { completed: 0, total: 0 };
      stat.total += 1;
      if (q.completed) stat.completed += 1;
      byDay.set(day, stat);
    }

    // Worst scheduled day for THIS series, with enough samples to trust.
    let worstDay: number | null = null;
    let worstRate = Infinity;
    let worstSample = 0;
    for (const day of recurrenceDays) {
      const stat = byDay.get(day);
      if (!stat || stat.total < MIN_DAY_SAMPLE) continue;
      const rate = stat.completed / stat.total;
      if (rate < worstRate) {
        worstRate = rate;
        worstDay = day;
        worstSample = stat.total;
      }
    }
    if (worstDay === null || worstRate >= 0.5) continue; // only propose when a day is genuinely failing, not just below-average

    // Best candidate day NOT already in this series' schedule: prefer
    // the series' own history there if it has any, else the account's
    // global rate for that day.
    let bestCandidateDay: number | null = null;
    let bestCandidateRate = -Infinity;
    for (let day = 0; day < 7; day++) {
      if (recurrenceDays.includes(day)) continue;
      const seriesStat = byDay.get(day);
      const rate = seriesStat && seriesStat.total >= MIN_DAY_SAMPLE
        ? seriesStat.completed / seriesStat.total
        : (globalByDay.get(day)?.total ?? 0) >= MIN_DAY_SAMPLE
          ? globalByDay.get(day)!.completed / globalByDay.get(day)!.total
          : 0.5; // truly unknown day: neutral prior, not a fabricated high number
      if (rate > bestCandidateRate) {
        bestCandidateRate = rate;
        bestCandidateDay = day;
      }
    }
    if (bestCandidateDay === null || bestCandidateRate <= worstRate) continue;

    const frictionScore = (worstRate === 0 ? 1 : 1 - worstRate) * Math.min(worstSample / 6, 1);
    const proposal: RebalanceProposal = {
      seriesId,
      questTitle: occurrences[occurrences.length - 1].title,
      fromDay: worstDay,
      toDay: bestCandidateDay,
      fromDayLabel: WEEKDAY_LABELS[worstDay],
      toDayLabel: WEEKDAY_LABELS[bestCandidateDay],
      fromDayRate: worstRate,
      toDayRate: bestCandidateRate,
      fromDaySample: worstSample,
      currentDays: recurrenceDays,
    };

    if (!best || frictionScore > best.frictionScore) {
      best = { proposal, frictionScore };
    }
  }

  return best?.proposal ?? null;
}
