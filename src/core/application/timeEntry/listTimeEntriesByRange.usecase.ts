import { TimeEntry } from '../../domain/timeEntry/timeEntry.types';
import { TimeEntryRepository } from '../../ports/repositories/timeEntryRepository';

export type ListTimeEntriesByRangeInput = {
  userId: string;
  from: Date;
  to: Date;
};

export type ListTimeEntriesByRangeDeps = {
  timeEntryRepository: TimeEntryRepository;
};

/**
 * Lists time entries for a user within a date/time range.
 */
export async function listTimeEntriesByRange(
  input: ListTimeEntriesByRangeInput,
  deps: ListTimeEntriesByRangeDeps,
): Promise<TimeEntry[]> {
  return deps.timeEntryRepository.findByDateRange({
    userId: input.userId,
    from: input.from,
    to: input.to,
  });
}
