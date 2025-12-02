import {
  TaskTemplateArchivedError,
  CannotStartTimerError,
  TaskTemplateNotFoundError,
} from '../../domain/errors/domainErrors';
import { TaskTemplate } from '../../domain/taskTemplate/taskTemplate.types';
import { TimeEntry } from '../../domain/timeEntry/timeEntry.types';
import { CategoryRepository } from '../../ports/repositories/categoryRepository';
import { TaskTemplateRepository } from '../../ports/repositories/taskTemplateRepository';
import { CreateLiveTimeEntryInput, TimeEntryRepository } from '../../ports/repositories/timeEntryRepository';

export type StartTimeEntryInput = {
  userId: string;
  taskTemplateId?: string | null;
  mainCategoryValueId?: string | null;
  titleOverride?: string | null;
  notes?: string | null;
  categoryValueIds?: string[];
  startedAt?: Date;
  isUntracked?: boolean;
  // Optional analytics conveniences if caller already computed
  localDate?: Date | null;
  year?: number | null;
  month?: number | null;
  weekOfYear?: number | null;
  dayOfWeek?: number | null;
  /**
   * If true, will stop any existing running entry before starting a new one (default: true).
   */
  stopRunningIfExists?: boolean;
};

export type StartTimeEntryDeps = {
  timeEntryRepository: TimeEntryRepository;
  taskTemplateRepository: TaskTemplateRepository;
  categoryRepository: CategoryRepository;
  now?: () => Date;
};

const ensureTemplateUsable = async (
  taskTemplateId: string | null | undefined,
  userId: string,
  deps: StartTimeEntryDeps,
): Promise<TaskTemplate | null> => {
  if (!taskTemplateId) return null;
  const template = await deps.taskTemplateRepository.findById(taskTemplateId);
  if (!template) {
    throw new TaskTemplateNotFoundError();
  }
  if (template.isArchived) {
    throw new TaskTemplateArchivedError();
  }
  if (template.userId !== userId) {
    throw new TaskTemplateNotFoundError();
  }
  return template;
};

/**
 * Starts a new (live) time entry, optionally stopping any existing running entry for the user.
 */
export async function startTimeEntry(input: StartTimeEntryInput, deps: StartTimeEntryDeps): Promise<TimeEntry> {
  const {
    timeEntryRepository,
    categoryRepository,
    now = () => new Date(),
  } = deps;

  const template = await ensureTemplateUsable(input.taskTemplateId, input.userId, deps);

  const mainCategoryValueId = input.mainCategoryValueId ?? template?.mainCategoryValueId ?? null;
  const categoryValueIds = input.categoryValueIds ?? template?.categoryValueIds ?? [];
  const normalizedCategoryIds = Array.from(
    new Set([...(categoryValueIds ?? []), ...(mainCategoryValueId ? [mainCategoryValueId] : [])]),
  );

  const running = await timeEntryRepository.findRunningByUser(input.userId);
  if (running && input.stopRunningIfExists !== false) {
    const endTime = input.startedAt ?? now();
    await timeEntryRepository.stopEntry(running.id, endTime);
  } else if (running && input.stopRunningIfExists === false) {
    throw new CannotStartTimerError();
  }

  const createInput: CreateLiveTimeEntryInput = {
    userId: input.userId,
    taskTemplateId: input.taskTemplateId ?? null,
    mainCategoryValueId,
    titleOverride: input.titleOverride ?? null,
    notes: input.notes ?? null,
    startedAt: input.startedAt ?? now(),
    isUntracked: input.isUntracked ?? template?.isUntracked ?? false,
    localDate: input.localDate ?? null,
    year: input.year ?? null,
    month: input.month ?? null,
    weekOfYear: input.weekOfYear ?? null,
    dayOfWeek: input.dayOfWeek ?? null,
  };

  const entry = await timeEntryRepository.createLiveEntry(createInput);

  if (normalizedCategoryIds.length > 0) {
    await categoryRepository.assignValuesToTimeEntry(entry.id, normalizedCategoryIds);
  }

  return entry;
}
