import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { uuidArray } from '@/infra/http/validationSchemas';
import { createUseCases } from '@/infra/container';
import { buildAnalyticsReport, type AnalyticsResolution } from '@/infra/analytics/analyticsService';

const filtersSchema = z.object({
  categoryValueIds: uuidArray.optional(),
  mainCategoryIds: uuidArray.optional(),
  dimensionIds: uuidArray.optional(),
  templateIds: uuidArray.optional(),
  includeUntracked: z.boolean().optional(),
  productivity: z.enum(['all', 'productive', 'non-productive', 'untracked']).optional(),
});

const rangeSchema = z.object({
  from: z.string(),
  to: z.string(),
  resolution: z.enum(['hour', 'day', 'month']).optional(),
});

const bodySchema = z.object({
  range: rangeSchema,
  compareRange: rangeSchema.optional(),
  filters: filtersSchema.optional(),
});

const pickResolution = (range: { from: Date; to: Date }, requested?: AnalyticsResolution): AnalyticsResolution => {
  if (requested) return requested;
  const diffMs = range.to.getTime() - range.from.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);
  if (days <= 2) return 'hour';
  if (days <= 120) return 'day';
  return 'month';
};

const parseRange = (raw: { from: string; to: string; resolution?: AnalyticsResolution }) => {
  const from = new Date(raw.from);
  const to = new Date(raw.to);
  const resolution = pickResolution({ from, to }, raw.resolution);
  return { from, to, resolution };
};

export const POST = withErrorHandling(async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const rawText = await req.text();
  const json = rawText ? JSON.parse(rawText) : {};
  const parsed = bodySchema.parse(json);

  const range = parseRange(parsed.range);
  const compareRange = parsed.compareRange ? parseRange(parsed.compareRange) : undefined;

  const useCases = createUseCases();
  const [primaryEntries, compareEntries] = await Promise.all([
    useCases.listTimeEntriesByRange({ userId, from: range.from, to: range.to }),
    compareRange
      ? useCases.listTimeEntriesByRange({ userId, from: compareRange.from, to: compareRange.to })
      : Promise.resolve(undefined),
  ]);

  const report = buildAnalyticsReport(primaryEntries, {
    compareEntries: compareEntries ?? undefined,
    filters: parsed.filters,
    range,
    compareRange,
    resolution: range.resolution,
  });

  return NextResponse.json({ report }, { status: 200 });
});
