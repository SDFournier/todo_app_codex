import { CategoryRepository } from '../../ports/repositories/categoryRepository';
import { TimeEntryRepository } from '../../ports/repositories/timeEntryRepository';
import { TimeRangeInvalidError } from '../../domain/errors/domainErrors';

export type AssignCategoriesToTimeEntryInput = {
  timeEntryId: string;
  userId: string;
  categoryValueIds: string[];
};

export type AssignCategoriesToTimeEntryDeps = {
  categoryRepository: CategoryRepository;
  timeEntryRepository: TimeEntryRepository;
};

/**
 * Assigns category values to a time entry.
 */
export async function assignCategoriesToTimeEntry(
  input: AssignCategoriesToTimeEntryInput,
  deps: AssignCategoriesToTimeEntryDeps,
): Promise<void> {
  const entry = await deps.timeEntryRepository.findById(input.timeEntryId);
  if (!entry) {
    throw new TimeRangeInvalidError('Time entry not found.');
  }

  await deps.categoryRepository.replaceValuesForTimeEntry(input.timeEntryId, input.categoryValueIds);
}
