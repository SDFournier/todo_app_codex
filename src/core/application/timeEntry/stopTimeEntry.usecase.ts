import { NoRunningTimeEntryError, TimeEntryNotFoundError } from '../../domain/errors/domainErrors';
import { TimeEntry } from '../../domain/timeEntry/timeEntry.types';
import { TimeEntryRepository } from '../../ports/repositories/timeEntryRepository';

export type StopTimeEntryInput = {
  userId: string;
  timeEntryId?: string;
  endedAt?: Date;
};

export type StopTimeEntryDeps = {
  timeEntryRepository: TimeEntryRepository;
  now?: () => Date;
};

/**
 * Stops the current running time entry for a user.
 */
export async function stopTimeEntry(
  input: StopTimeEntryInput,
  deps: StopTimeEntryDeps,
): Promise<TimeEntry> {
  const { now = () => new Date() } = deps;

  let entry: TimeEntry | null = null;
  if (input.timeEntryId) {
    entry = await deps.timeEntryRepository.findById(input.timeEntryId);
    if (!entry || entry.userId !== input.userId || entry.deletedAt) {
      throw new TimeEntryNotFoundError();
    }
  } else {
    entry = await deps.timeEntryRepository.findRunningByUser(input.userId);
    if (!entry) {
      throw new NoRunningTimeEntryError();
    }
  }

  if (entry.endedAt) {
    return entry; // idempotent
  }

  const endedAt = input.endedAt ?? now();
  return deps.timeEntryRepository.stopEntry(entry.id, endedAt);
}
