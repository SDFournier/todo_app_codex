import { TimeEntryRepository } from '../../ports/repositories/timeEntryRepository';

export type RangeSummary = {
  totalSeconds: number;
  entryCount: number;
};

export type GetRangeSummaryInput = {
  userId: string;
  from: Date;
  to: Date;
};

export type GetRangeSummaryDeps = {
  timeEntryRepository: TimeEntryRepository;
};

/**
 * Basic range summary across all entries in the window.
 */
export async function getRangeSummary(
  input: GetRangeSummaryInput,
  deps: GetRangeSummaryDeps,
): Promise<RangeSummary> {
  const entries = await deps.timeEntryRepository.findByDateRange({
    userId: input.userId,
    from: input.from,
    to: input.to,
  });

  const totalSeconds = entries.reduce((acc, e) => acc + (e.durationSeconds ?? 0), 0);
  return {
    totalSeconds,
    entryCount: entries.length,
  };
}
