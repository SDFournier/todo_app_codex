import { TimeEntryNotFoundError } from '../../domain/errors/domainErrors';
import { TimeEntryRepository } from '../../ports/repositories/timeEntryRepository';

export type DeleteTimeEntryInput = {
  userId: string;
  entryId: string;
};

export type DeleteTimeEntryDeps = {
  timeEntryRepository: TimeEntryRepository;
};

/**
 * Soft-deletes a time entry.
 */
export async function deleteTimeEntry(
  input: DeleteTimeEntryInput,
  deps: DeleteTimeEntryDeps,
): Promise<void> {
  if (!input.entryId) {
    throw new TimeEntryNotFoundError();
  }
  const entry = await deps.timeEntryRepository.findById(input.entryId);
  if (!entry || entry.userId !== input.userId || entry.deletedAt) {
    throw new TimeEntryNotFoundError();
  }
  await deps.timeEntryRepository.softDelete(input.entryId);
}
