import { TimeEntry } from '@/core/domain/timeEntry/timeEntry.types';
import { TaskTemplate } from '@/core/domain/taskTemplate/taskTemplate.types';

export const UNTRACKED_CATEGORY_LABEL = 'Untracked';
export const UNTRACKED_TEMPLATE_NAME = 'Untracked time';
export const UNTRACKED_DISPLAY_TITLE = 'No specific activity';
export const UNTRACKED_CATEGORY_COLOR = '#e5e7eb';

export const isEntryUntracked = (
  entry?: Partial<TimeEntry> & { taskTemplate?: Partial<TaskTemplate> | null },
): boolean => Boolean(entry?.isUntracked || entry?.taskTemplate?.isUntracked);
