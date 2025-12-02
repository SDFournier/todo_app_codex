import { TodayEntrySummary } from "@/infra/header/getHeaderData";

type BucketLabel = "productive" | "other" | "untracked" | "mixed" | "none";

const toDate = (value: string | Date) => (value instanceof Date ? value : new Date(value));

const overlapSeconds = (start: Date, end: Date, windowStart: Date, windowEnd: Date) => {
  const s = Math.max(start.getTime(), windowStart.getTime());
  const e = Math.min(end.getTime(), windowEnd.getTime());
  return Math.max(0, Math.floor((e - s) / 1000));
};

const classifyBucket = (productive: number, other: number, untracked: number): BucketLabel => {
  const tracked = productive + other + untracked;
  if (tracked <= 0) return "untracked";
  const entries: [BucketLabel, number][] = [
    ["productive", productive],
    ["other", other],
    ["untracked", untracked],
  ];
  const [topLabel, topValue] = entries.reduce((acc, cur) => (cur[1] > acc[1] ? cur : acc));
  if (topValue / tracked >= 0.6) {
    return topLabel;
  }
  return "mixed";
};

export const computeDayAggregate = (params: {
  entries: TodayEntrySummary[];
  now: Date;
  dayStart: Date;
}) => {
  const { entries, now, dayStart } = params;
  let productiveSeconds = 0;
  let otherSeconds = 0;
  let untrackedSeconds = 0;
  let entryCount = entries.length;

  for (const entry of entries) {
    const start = toDate(entry.startedAt);
    const end = entry.endedAt ? toDate(entry.endedAt) : now;
    const duration = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
    if (entry.isUntracked) {
      untrackedSeconds += duration;
    } else if (entry.isProductive) {
      productiveSeconds += duration;
    } else {
      otherSeconds += duration;
    }
  }

  // trackedSeconds excluye lo no trackeado explícito
  const trackedSeconds = productiveSeconds + otherSeconds;
  const dayElapsedSeconds = Math.max(0, Math.floor((now.getTime() - dayStart.getTime()) / 1000));

  return {
    productiveSeconds,
    otherSeconds,
    untrackedSeconds,
    trackedSeconds,
    dayElapsedSeconds,
    entryCount,
  };
};

export const computeProductivePercentForWindow = (
  entries: TodayEntrySummary[],
  now: Date,
  windowMinutes: number,
) => {
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
  const stats = computeWindowStats(entries, windowStart, now);
  const pct = stats.trackedSeconds > 0 ? Math.round((stats.productiveSeconds / stats.trackedSeconds) * 100) : 0;
  return { pct, ...stats };
};

export type TimelineBucket = {
  start: Date;
  end: Date;
  label: BucketLabel;
  trackedSeconds: number;
};

export const buildDayTimelineBuckets = (params: {
  entries: TodayEntrySummary[];
  dayStart: Date;
  now: Date;
  bucketMinutes?: number;
}): TimelineBucket[] => {
  const { entries, dayStart, now, bucketMinutes = 60 } = params;
  const buckets: TimelineBucket[] = [];
  let cursor = new Date(dayStart);

  while (cursor < now) {
    const next = new Date(Math.min(cursor.getTime() + bucketMinutes * 60 * 1000, now.getTime()));
    let productiveSeconds = 0;
    let otherSeconds = 0;
    let untrackedSeconds = 0;
    for (const entry of entries) {
      const start = toDate(entry.startedAt);
      const end = entry.endedAt ? toDate(entry.endedAt) : now;
      const overlap = overlapSeconds(start, end, cursor, next);
      if (overlap <= 0) continue;
      if (entry.isUntracked) {
        untrackedSeconds += overlap;
      } else if (entry.isProductive) {
        productiveSeconds += overlap;
      } else {
        otherSeconds += overlap;
      }
    }
    const trackedSeconds = productiveSeconds + otherSeconds + untrackedSeconds;
    const label = classifyBucket(productiveSeconds, otherSeconds, untrackedSeconds);
    buckets.push({ start: cursor, end: next, label, trackedSeconds });
    cursor = next;
  }

  return buckets;
};

export const computeTopProductiveCategory = (entries: TodayEntrySummary[]) => {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    if (entry.isUntracked || !entry.isProductive) continue;
    if (!entry.mainCategoryLabel) continue;
    const current = totals.get(entry.mainCategoryLabel) ?? 0;
    totals.set(entry.mainCategoryLabel, current + entry.durationSeconds);
  }
  let top: { label: string; seconds: number } | null = null;
  for (const [label, seconds] of totals.entries()) {
    if (!top || seconds > top.seconds) {
      top = { label, seconds };
    }
  }
  return top;
};

export const computeUntrackedMeta = (entries: TodayEntrySummary[], now: Date) => {
  let intervals = 0;
  let lastEndedAt: Date | null = null;
  let runningUntrackedSeconds = 0;

  for (const entry of entries) {
    if (!entry.isUntracked) continue;
    intervals += 1;
    const end = entry.endedAt ? toDate(entry.endedAt) : now;
    if (!entry.endedAt) {
      runningUntrackedSeconds = Math.max(0, Math.floor((now.getTime() - toDate(entry.startedAt).getTime()) / 1000));
    }
    if (!lastEndedAt || end > lastEndedAt) {
      lastEndedAt = end;
    }
  }

  return { intervals, lastEndedAt, runningUntrackedSeconds };
};

export const computeWindowStats = (entries: TodayEntrySummary[], windowStart: Date, windowEnd: Date) => {
  let productiveSeconds = 0;
  let otherSeconds = 0;
  let untrackedSeconds = 0;
  for (const entry of entries) {
    const start = toDate(entry.startedAt);
    const end = entry.endedAt ? toDate(entry.endedAt) : windowEnd;
    const overlap = overlapSeconds(start, end, windowStart, windowEnd);
    if (overlap <= 0) continue;
    if (entry.isUntracked) {
      untrackedSeconds += overlap;
    } else if (entry.isProductive) {
      productiveSeconds += overlap;
    } else {
      otherSeconds += overlap;
    }
  }
  return {
    productiveSeconds,
    otherSeconds,
    untrackedSeconds,
    trackedSeconds: productiveSeconds + otherSeconds + untrackedSeconds,
  };
};

export const findBestHourWindow = (entries: TodayEntrySummary[], dayStart: Date, now: Date) => {
  const stepMinutes = 15;
  let cursor = new Date(dayStart);
  let best: { start: Date; end: Date; pct: number; trackedSeconds: number } | null = null;
  while (cursor < now) {
    const end = new Date(Math.min(cursor.getTime() + 60 * 60 * 1000, now.getTime()));
    const stats = computeWindowStats(entries, cursor, end);
    if (stats.trackedSeconds >= 30 * 60) {
      const pct = stats.trackedSeconds > 0 ? Math.round((stats.productiveSeconds / stats.trackedSeconds) * 100) : 0;
      if (!best || pct > best.pct) {
        best = { start: cursor, end, pct, trackedSeconds: stats.trackedSeconds };
      }
    }
    cursor = new Date(cursor.getTime() + stepMinutes * 60 * 1000);
  }
  return best;
};

export type PositiveStreak = {
  key: string;
  label: string;
  value: string;
  pct: number;
};

export const getPositiveStreaks = (params: {
  entries: TodayEntrySummary[];
  now: Date;
  dayStart: Date;
}): PositiveStreak[] => {
  const { entries, now, dayStart } = params;
  const streaks: PositiveStreak[] = [];
  const windowCandidates = [
    { key: "last30", minutes: 30, label: "Últ 30m" },
    { key: "last60", minutes: 60, label: "Últ 1h" },
    { key: "last120", minutes: 120, label: "Últ 2h" },
    { key: "last240", minutes: 240, label: "Últ 4h" },
  ];
  for (const candidate of windowCandidates) {
    const stats = computeProductivePercentForWindow(entries, now, candidate.minutes);
    if (stats.trackedSeconds >= 15 * 60 && stats.pct >= 70) {
      streaks.push({
        key: candidate.key,
        label: candidate.label,
        value: `${stats.pct}% productivo`,
        pct: stats.pct,
      });
    }
  }

  // No untracked streak
  const lastUntrackedEnded = (() => {
    let last: Date | null = null;
    for (const entry of entries) {
      if (!entry.isUntracked) continue;
      if (!entry.endedAt) continue;
      const ended = toDate(entry.endedAt);
      if (!last || ended > last) last = ended;
    }
    return last;
  })();

  if (!entries.some((e) => e.isUntracked && !e.endedAt)) {
    const windowStart = lastUntrackedEnded ?? dayStart;
    const stats = computeWindowStats(entries, windowStart, now);
    const windowDurationSeconds = Math.max(0, Math.floor((now.getTime() - windowStart.getTime()) / 1000));
    if (windowDurationSeconds >= 30 * 60 && stats.trackedSeconds >= 30 * 60) {
      const pct = stats.trackedSeconds > 0 ? Math.round((stats.productiveSeconds / stats.trackedSeconds) * 100) : 0;
      if (pct >= 70) {
        streaks.push({
          key: "no-untracked",
          label: "Sin untracked",
          value: `${Math.floor(windowDurationSeconds / 3600)}h ${Math.floor((windowDurationSeconds % 3600) / 60)}m`,
          pct,
        });
      }
    }
  }

  const bestHour = findBestHourWindow(entries, dayStart, now);
  if (bestHour && bestHour.trackedSeconds >= 30 * 60 && bestHour.pct >= 70) {
    const startLabel = bestHour.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const endLabel = bestHour.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    streaks.push({
      key: "best-hour",
      label: "Mejor 1h",
      value: `${bestHour.pct}% (${startLabel}–${endLabel})`,
      pct: bestHour.pct,
    });
  }

  const priorityOrder = ["last30", "last60", "last120", "last240", "no-untracked", "best-hour"];
  const sorted = streaks.sort((a, b) => priorityOrder.indexOf(a.key) - priorityOrder.indexOf(b.key));
  return sorted.slice(0, 3);
};

export type TimelineSegment = {
  type: "productive" | "other" | "untracked";
  durationSeconds: number;
};

export const buildTimelineSegments = (params: {
  entries: TodayEntrySummary[];
  dayStart: Date;
  now: Date;
}): TimelineSegment[] => {
  const { entries, dayStart, now } = params;
  const sorted = [...entries].sort((a, b) => toDate(a.startedAt).getTime() - toDate(b.startedAt).getTime());
  const segments: TimelineSegment[] = [];
  let cursor = dayStart;

  const pushSegment = (type: TimelineSegment["type"], durationSeconds: number) => {
    if (durationSeconds <= 0) return;
    segments.push({ type, durationSeconds });
  };

  for (const entry of sorted) {
    const start = toDate(entry.startedAt);
    const end = entry.endedAt ? toDate(entry.endedAt) : now;
    if (end <= dayStart) continue;
    const clampedStart = start < dayStart ? dayStart : start;
    const clampedEnd = end > now ? now : end;
    if (clampedEnd <= clampedStart) continue;

    if (clampedStart > cursor) {
      pushSegment("untracked", Math.floor((clampedStart.getTime() - cursor.getTime()) / 1000));
    }

    const dur = Math.floor((clampedEnd.getTime() - clampedStart.getTime()) / 1000);
    const type: TimelineSegment["type"] = entry.isUntracked ? "untracked" : entry.isProductive ? "productive" : "other";
    pushSegment(type, dur);
    cursor = clampedEnd;
  }

  if (cursor < now) {
    pushSegment("untracked", Math.floor((now.getTime() - cursor.getTime()) / 1000));
  }

  return segments;
};

export type HourQualityBucket = {
  start: Date;
  end: Date;
  trackedSeconds: number;
  productivePercent: number;
};

export const buildHourlyQualityBuckets = (params: {
  entries: TodayEntrySummary[];
  dayStart: Date;
  now: Date;
}): HourQualityBucket[] => {
  const { entries, dayStart, now } = params;
  const buckets: HourQualityBucket[] = [];
  let cursor = dayStart;
  while (cursor < now) {
    const next = new Date(Math.min(cursor.getTime() + 60 * 60 * 1000, now.getTime()));
    const stats = computeWindowStats(entries, cursor, next);
    const pct = stats.trackedSeconds > 0 ? Math.round((stats.productiveSeconds / stats.trackedSeconds) * 100) : 0;
    buckets.push({
      start: cursor,
      end: next,
      trackedSeconds: stats.trackedSeconds,
      productivePercent: pct,
    });
    cursor = next;
  }
  return buckets;
};
