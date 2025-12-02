import { TimeEntryRepository } from '../../ports/repositories/timeEntryRepository';

export type DailySummary = {
  date: string; // ISO date
  totalSeconds: number;
  entryCount: number;
};

export type GetDailySummaryInput = {
  userId: string;
  date: Date;
};

export type GetDailySummaryDeps = {
  timeEntryRepository: TimeEntryRepository;
};

/**
 * Simple daily summary based on time entries that started on the given date.
 * (Counts by startedAt; ignores cross-midnight refinement per v1 simplification.)
 */
export async function getDailySummary(
  input: GetDailySummaryInput,
  deps: GetDailySummaryDeps,
): Promise<DailySummary> {
  const start = new Date(Date.UTC(input.date.getUTCFullYear(), input.date.getUTCMonth(), input.date.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const entries = await deps.timeEntryRepository.findByDateRange({
    userId: input.userId,
    from: start,
    to: end,
  });

  const totalSeconds = entries.reduce((acc, e) => acc + (e.durationSeconds ?? 0), 0);
  return {
    date: start.toISOString().slice(0, 10),
    totalSeconds,
    entryCount: entries.length,
  };
}
