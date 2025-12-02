import {
  TaskTemplateArchivedError,
  TaskTemplateNotFoundError,
  TimeRangeInvalidError,
} from '../../domain/errors/domainErrors';
import { TimeEntry } from '../../domain/timeEntry/timeEntry.types';
import { CategoryRepository } from '../../ports/repositories/categoryRepository';
import { TaskTemplateRepository } from '../../ports/repositories/taskTemplateRepository';
import {
  CreateManualTimeEntryInput,
  TimeEntryRepository,
} from '../../ports/repositories/timeEntryRepository';

export type CreateManualTimeEntryInputDto = {
  userId: string;
  taskTemplateId?: string | null;
  mainCategoryValueId?: string | null;
  titleOverride?: string | null;
  notes?: string | null;
  startedAt: Date;
  endedAt: Date;
  durationSeconds?: number | null;
  isUntracked?: boolean;
  categoryValueIds?: string[];
  localDate?: Date | null;
  year?: number | null;
  month?: number | null;
  weekOfYear?: number | null;
  dayOfWeek?: number | null;
};

export type CreateManualTimeEntryDeps = {
  timeEntryRepository: TimeEntryRepository;
  taskTemplateRepository: TaskTemplateRepository;
  categoryRepository: CategoryRepository;
};

const ensureTemplateUsable = async (
  taskTemplateId: string | null | undefined,
  userId: string,
  deps: CreateManualTimeEntryDeps,
): Promise<import('../../domain/taskTemplate/taskTemplate.types').TaskTemplate | null> => {
  if (!taskTemplateId) return null;
  const template = await deps.taskTemplateRepository.findById(taskTemplateId);
  if (!template || template.userId !== userId) {
    throw new TaskTemplateNotFoundError();
  }
  if (template.isArchived) {
    throw new TaskTemplateArchivedError();
  }
  return template;
};

/**
 * Creates a manual (non-live) time entry for past intervals.
 */
export async function createManualTimeEntry(
  input: CreateManualTimeEntryInputDto,
  deps: CreateManualTimeEntryDeps,
): Promise<TimeEntry> {
  if (input.endedAt <= input.startedAt) {
    throw new TimeRangeInvalidError('Ended time must be after started time.');
  }

  const template = await ensureTemplateUsable(input.taskTemplateId, input.userId, deps);
  const mainCategoryValueId = input.mainCategoryValueId ?? template?.mainCategoryValueId ?? null;
  const normalizedCategoryIds = Array.from(
    new Set([...(input.categoryValueIds ?? []), ...(mainCategoryValueId ? [mainCategoryValueId] : [])]),
  );

  const computedDuration =
    input.durationSeconds ?? Math.floor((input.endedAt.getTime() - input.startedAt.getTime()) / 1000);

  const createInput: CreateManualTimeEntryInput = {
    userId: input.userId,
    taskTemplateId: input.taskTemplateId ?? null,
    mainCategoryValueId,
    titleOverride: input.titleOverride ?? null,
    notes: input.notes ?? null,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    durationSeconds: computedDuration,
    isUntracked: input.isUntracked ?? template?.isUntracked ?? false,
    localDate: input.localDate ?? null,
    year: input.year ?? null,
    month: input.month ?? null,
    weekOfYear: input.weekOfYear ?? null,
    dayOfWeek: input.dayOfWeek ?? null,
  };

  const entry = await deps.timeEntryRepository.createManualEntry(createInput);

  if (normalizedCategoryIds.length > 0) {
    await deps.categoryRepository.assignValuesToTimeEntry(entry.id, normalizedCategoryIds);
  }

  return entry;
}
