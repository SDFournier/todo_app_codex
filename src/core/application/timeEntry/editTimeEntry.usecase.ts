import {
  TaskTemplateArchivedError,
  TaskTemplateNotFoundError,
  TimeEntryNotFoundError,
  TimeRangeInvalidError,
} from '../../domain/errors/domainErrors';
import { TimeEntry } from '../../domain/timeEntry/timeEntry.types';
import { CategoryRepository } from '../../ports/repositories/categoryRepository';
import { TaskTemplateRepository } from '../../ports/repositories/taskTemplateRepository';
import {
  TimeEntryRepository,
  UpdateTimeEntryInput,
} from '../../ports/repositories/timeEntryRepository';

export type EditTimeEntryInput = {
  entryId: string;
  updates: UpdateTimeEntryInput;
  categoryValueIds?: string[];
};

export type EditTimeEntryDeps = {
  timeEntryRepository: TimeEntryRepository;
  taskTemplateRepository: TaskTemplateRepository;
  categoryRepository: CategoryRepository;
};

const ensureTemplateUsable = async (
  taskTemplateId: string | null | undefined,
  userId: string,
  deps: EditTimeEntryDeps,
): Promise<void> => {
  if (!taskTemplateId) return;
  const template = await deps.taskTemplateRepository.findById(taskTemplateId);
  if (!template || template.userId !== userId) {
    throw new TaskTemplateNotFoundError();
  }
  if (template.isArchived) {
    throw new TaskTemplateArchivedError();
  }
};

/**
 * Edits an existing time entry, optionally reassigning categories.
 */
export async function editTimeEntry(input: EditTimeEntryInput, deps: EditTimeEntryDeps): Promise<TimeEntry> {
  const existing = await deps.timeEntryRepository.findById(input.entryId);
  if (!existing || existing.deletedAt) {
    throw new TimeEntryNotFoundError();
  }
  const userId = existing.userId;

  const candidate: UpdateTimeEntryInput = { ...input.updates };
  const nextStarted = candidate.startedAt ?? existing.startedAt;
  const nextEnded = candidate.endedAt ?? existing.endedAt ?? undefined;
  const mainCategoryValueId = candidate.mainCategoryValueId ?? existing.mainCategoryValueId ?? null;
  const normalizedCategoryIds = input.categoryValueIds
    ? Array.from(new Set([...input.categoryValueIds, ...(mainCategoryValueId ? [mainCategoryValueId] : [])]))
    : undefined;
  if (nextStarted && nextEnded && nextEnded <= nextStarted) {
    throw new TimeRangeInvalidError('Ended time must be after started time.');
  }

  if (candidate.taskTemplateId !== undefined) {
    await ensureTemplateUsable(candidate.taskTemplateId ?? null, userId, deps);
  }

  const updated = await deps.timeEntryRepository.updateEntry(input.entryId, candidate);

  if (normalizedCategoryIds) {
    await deps.categoryRepository.replaceValuesForTimeEntry(updated.id, normalizedCategoryIds);
  }

  return updated;
}
