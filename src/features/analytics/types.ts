import { AnalyticsReport } from '@/infra/analytics/analyticsService';

export type AnalyticsResponse = {
  report: AnalyticsReport;
};

export type PeriodPreset = 'today' | 'week' | 'month' | 'year' | 'custom';

export type ComparisonMode = 'none' | 'previous' | 'last-year' | 'custom';
