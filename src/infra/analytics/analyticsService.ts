import { TimeEntry } from '@/core/domain/timeEntry/timeEntry.types';

export type AnalyticsResolution = 'hour' | 'day' | 'month';

export type AnalyticsFilters = {
  categoryValueIds?: string[];
  mainCategoryIds?: string[];
  dimensionIds?: string[];
  templateIds?: string[];
  productivity?: 'all' | 'productive' | 'non-productive' | 'untracked';
  includeUntracked?: boolean;
};

export type AnalyticsSummary = {
  totalSeconds: number;
  productiveSeconds: number;
  otherSeconds: number;
  untrackedSeconds: number;
  entryCount: number;
  compare?: {
    totalSeconds: number;
    productiveSeconds: number;
    otherSeconds: number;
    untrackedSeconds: number;
    entryCount: number;
  };
};

export type AnalyticsCategorySlice = {
  categoryId: string | null;
  label: string;
  color?: string | null;
  seconds: number;
  percent: number;
  deltaSeconds?: number;
};

export type AnalyticsTimelinePoint = {
  label: string;
  start: string;
  totalSeconds: number;
  productiveSeconds: number;
  compareTotalSeconds?: number;
  compareProductiveSeconds?: number;
};

export type AnalyticsTemplateStat = {
  templateId: string | null;
  name: string;
  seconds: number;
  entryCount: number;
  deltaSeconds?: number;
};

export type AnalyticsUntrackedInsight = {
  totalSeconds: number;
  percentOfTracked: number;
  warning: boolean;
  deltaSeconds?: number;
};

export type AnalyticsReport = {
  summary: AnalyticsSummary;
  categories: AnalyticsCategorySlice[];
  timeline: AnalyticsTimelinePoint[];
  templates: AnalyticsTemplateStat[];
  untracked: AnalyticsUntrackedInsight;
};

type PreparedEntry = {
  entry: TimeEntry;
  duration: number;
  classification: 'untracked' | 'productive' | 'other';
};

const secondsBetween = (start?: Date | null, end?: Date | null): number => {
  if (!start || !end) return 0;
  const delta = Math.floor((end.getTime() - start.getTime()) / 1000);
  return Math.max(0, delta);
};

const isUntrackedEntry = (entry: TimeEntry) =>
  Boolean(
    entry.isUntracked ||
      entry.mainCategoryIsUntracked ||
      entry.categories?.some((c) => c.isUntracked),
  );

const isProductiveEntry = (entry: TimeEntry) =>
  Boolean(
    entry.mainCategoryIsProductive ||
      entry.categories?.some((c) => c.isProductive),
  );

const matchesMainCategoryFilter = (entry: TimeEntry, filters?: AnalyticsFilters) => {
  if (!filters?.mainCategoryIds || filters.mainCategoryIds.length === 0) return true;
  return filters.mainCategoryIds.includes(entry.mainCategoryValueId ?? '');
};

const matchesCategoryFilter = (entry: TimeEntry, filters?: AnalyticsFilters) => {
  if (!filters?.categoryValueIds || filters.categoryValueIds.length === 0) return true;
  const ids = new Set<string>([
    ...(entry.categoryValueIds ?? []),
    ...(entry.mainCategoryValueId ? [entry.mainCategoryValueId] : []),
  ]);
  return filters.categoryValueIds.some((id) => ids.has(id));
};

const matchesDimensionFilter = (entry: TimeEntry, filters?: AnalyticsFilters) => {
  if (!filters?.dimensionIds || filters.dimensionIds.length === 0) return true;
  const dims = new Set<string>();
  if (entry.categories) {
    entry.categories.forEach((c) => {
      if (c.dimensionId) dims.add(c.dimensionId);
    });
  }
  if (entry.mainCategoryValueId && entry.categories) {
    const main = entry.categories.find((c) => c.id === entry.mainCategoryValueId);
    if (main?.dimensionId) dims.add(main.dimensionId);
  }
  return filters.dimensionIds.some((id) => dims.has(id));
};

const matchesTemplateFilter = (entry: TimeEntry, filters?: AnalyticsFilters) => {
  if (!filters?.templateIds || filters.templateIds.length === 0) return true;
  return filters.templateIds.includes(entry.taskTemplateId ?? '');
};

const matchesProductivityFilter = (classification: PreparedEntry['classification'], filters?: AnalyticsFilters) => {
  const mode = filters?.productivity ?? 'all';
  if (mode === 'all') return true;
  if (mode === 'productive') return classification === 'productive';
  if (mode === 'non-productive') return classification === 'other';
  if (mode === 'untracked') return classification === 'untracked';
  return true;
};

const prepareEntries = (entries: TimeEntry[], filters?: AnalyticsFilters): PreparedEntry[] => {
  const prepared: PreparedEntry[] = [];
  for (const entry of entries) {
    if (entry.isRunning) continue; // exclude running from historical analytics
    const duration = entry.durationSeconds ?? secondsBetween(entry.startedAt, entry.endedAt);
    if (!duration || duration <= 0) continue;
    if (!matchesMainCategoryFilter(entry, filters)) continue;
    if (!matchesCategoryFilter(entry, filters)) continue;
    if (!matchesDimensionFilter(entry, filters)) continue;
    if (!matchesTemplateFilter(entry, filters)) continue;

    const untracked = isUntrackedEntry(entry);
    if (filters?.includeUntracked === false && untracked) continue;
    const productive = !untracked && isProductiveEntry(entry);
    const classification: PreparedEntry['classification'] = untracked ? 'untracked' : productive ? 'productive' : 'other';
    if (!matchesProductivityFilter(classification, filters)) continue;

    prepared.push({ entry, duration, classification });
  }
  return prepared;
};

const summarize = (list: PreparedEntry[]): AnalyticsSummary => {
  let totalSeconds = 0;
  let productiveSeconds = 0;
  let otherSeconds = 0;
  let untrackedSeconds = 0;

  for (const item of list) {
    totalSeconds += item.duration;
    if (item.classification === 'productive') productiveSeconds += item.duration;
    else if (item.classification === 'other') otherSeconds += item.duration;
    else untrackedSeconds += item.duration;
  }

  return {
    totalSeconds,
    productiveSeconds,
    otherSeconds,
    untrackedSeconds,
    entryCount: list.length,
  };
};

const groupByCategory = (list: PreparedEntry[], totalTrackedSeconds: number): AnalyticsCategorySlice[] => {
  const buckets = new Map<
    string | null,
    { label: string; color?: string | null; seconds: number }
  >();

  for (const item of list) {
    const { entry, duration } = item;
    const key = entry.mainCategoryValueId ?? null;
    const bucket = buckets.get(key) ?? {
      label: entry.mainCategoryLabel ?? 'Uncategorized',
      color: entry.mainCategoryColor ?? undefined,
      seconds: 0,
    };
    bucket.seconds += duration;
    bucket.color = bucket.color ?? entry.mainCategoryColor ?? undefined;
    buckets.set(key, bucket);
  }

  const slices = Array.from(buckets.entries()).map(([categoryId, data]) => ({
    categoryId,
    label: data.label,
    color: data.color,
    seconds: data.seconds,
    percent: totalTrackedSeconds > 0 ? Math.round((data.seconds / totalTrackedSeconds) * 1000) / 10 : 0,
  }));

  return slices.sort((a, b) => b.seconds - a.seconds);
};

const formatBucketLabel = (date: Date, resolution: AnalyticsResolution) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (resolution === 'hour') {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:00`;
  }
  if (resolution === 'month') {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const buildTimeline = (
  primary: PreparedEntry[],
  compare: PreparedEntry[] | undefined,
  range: { from: Date; to: Date },
  resolution: AnalyticsResolution,
): AnalyticsTimelinePoint[] => {
  const buckets: { key: string; start: Date }[] = [];
  const cursor = new Date(range.from);
  cursor.setMinutes(0, 0, 0);

  const advance = (d: Date) => {
    if (resolution === 'hour') d.setHours(d.getHours() + 1);
    else if (resolution === 'month') d.setMonth(d.getMonth() + 1, 1);
    else d.setDate(d.getDate() + 1);
  };

  while (cursor <= range.to) {
    buckets.push({ key: formatBucketLabel(cursor, resolution), start: new Date(cursor) });
    advance(cursor);
  }

  const agg = (list: PreparedEntry[]) => {
    const map = new Map<string, { total: number; productive: number }>();
    for (const item of list) {
      const started = new Date(item.entry.startedAt);
      if (started < range.from || started > range.to) continue;
      const key = formatBucketLabel(started, resolution);
      const existing = map.get(key) ?? { total: 0, productive: 0 };
      existing.total += item.duration;
      if (item.classification === 'productive') existing.productive += item.duration;
      map.set(key, existing);
    }
    return map;
  };

  const primaryMap = agg(primary);
  const compareMap = compare ? agg(compare) : undefined;

  return buckets.map((bucket) => ({
    label: bucket.key,
    start: bucket.start.toISOString(),
    totalSeconds: primaryMap.get(bucket.key)?.total ?? 0,
    productiveSeconds: primaryMap.get(bucket.key)?.productive ?? 0,
    compareTotalSeconds: compareMap?.get(bucket.key)?.total ?? 0,
    compareProductiveSeconds: compareMap?.get(bucket.key)?.productive ?? 0,
  }));
};

const groupTemplates = (primary: PreparedEntry[], compare?: PreparedEntry[]): AnalyticsTemplateStat[] => {
  const build = (list: PreparedEntry[]) => {
    const map = new Map<
      string | null,
      { name: string; seconds: number; count: number }
    >();
    for (const item of list) {
      const key = item.entry.taskTemplateId ?? null;
      const bucket = map.get(key) ?? {
        name: item.entry.templateName || 'Untitled entry',
        seconds: 0,
        count: 0,
      };
      bucket.seconds += item.duration;
      bucket.count += 1;
      map.set(key, bucket);
    }
    return map;
  };

  const current = build(primary);
  const compareMap = compare ? build(compare) : undefined;

  const rows: AnalyticsTemplateStat[] = [];
  for (const [id, data] of current.entries()) {
    rows.push({
      templateId: id,
      name: data.name,
      seconds: data.seconds,
      entryCount: data.count,
      deltaSeconds: compareMap ? data.seconds - (compareMap.get(id)?.seconds ?? 0) : undefined,
    });
  }

  return rows.sort((a, b) => b.seconds - a.seconds);
};

const buildUntrackedInsight = (
  summary: AnalyticsSummary,
  compare?: AnalyticsSummary,
): AnalyticsUntrackedInsight => {
  const totalTracked = summary.totalSeconds;
  const percent = totalTracked > 0 ? (summary.untrackedSeconds / totalTracked) * 100 : 0;
  return {
    totalSeconds: summary.untrackedSeconds,
    percentOfTracked: Math.round(percent * 10) / 10,
    warning: percent > 30,
    deltaSeconds: compare ? summary.untrackedSeconds - compare.untrackedSeconds : undefined,
  };
};

export const buildAnalyticsReport = (
  primaryEntries: TimeEntry[],
  options: {
    compareEntries?: TimeEntry[];
    filters?: AnalyticsFilters;
    range: { from: Date; to: Date };
    compareRange?: { from: Date; to: Date };
    resolution: AnalyticsResolution;
  },
): AnalyticsReport => {
  const primary = prepareEntries(primaryEntries, options.filters);
  const compare = options.compareEntries ? prepareEntries(options.compareEntries, options.filters) : undefined;

  const summary = summarize(primary);
  const compareSummary = compare ? summarize(compare) : undefined;
  const combinedSummary: AnalyticsSummary = compareSummary
    ? { ...summary, compare: compareSummary }
    : summary;

  const categories = groupByCategory(primary, summary.totalSeconds).map((slice) => ({
    ...slice,
    deltaSeconds: compare
      ? slice.seconds -
        (groupByCategory(compare, compareSummary?.totalSeconds ?? 0).find((c) => c.categoryId === slice.categoryId)
          ?.seconds ?? 0)
      : undefined,
  }));

  const timeline = buildTimeline(primary, compare, options.range, options.resolution);
  const templates = groupTemplates(primary, compare);
  const untracked = buildUntrackedInsight(summary, compareSummary);

  return {
    summary: combinedSummary,
    categories,
    timeline,
    templates,
    untracked,
  };
};
