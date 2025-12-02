import { TaskTemplate } from '@/core/domain/taskTemplate/taskTemplate.types';
import { CategoryValue } from '@/core/domain/categoryValue/categoryValue.types';
import { TimeEntry } from '@/core/domain/timeEntry/timeEntry.types';

export const FALLBACK_CATEGORY_COLOR = '#9BA1A6';
export const FALLBACK_TEMPLATE_COLOR = '#8B5CF6';

type DisplaySource =
  | (Partial<TimeEntry> & { taskTemplate?: Partial<TaskTemplate> | null })
  | Partial<TaskTemplate>;

export function getTemplateDisplayName(source: DisplaySource): string {
  if ('titleOverride' in source && source.titleOverride) return source.titleOverride;
  // For running entries we may receive templateName without taskTemplate
  if ('templateName' in source && source.templateName) return source.templateName as string;
  if ('taskTemplate' in source && source.taskTemplate?.name) return source.taskTemplate.name;
  if ('name' in source && source.name) return source.name;
  return 'Untitled entry';
}

export function getCategoryColor(category?: CategoryValue | null, fallback = FALLBACK_CATEGORY_COLOR): string {
  return category?.color ?? fallback;
}

export function getTemplateColor(
  template?: TaskTemplate | null,
  mainCategory?: CategoryValue | null,
  fallback = FALLBACK_TEMPLATE_COLOR,
): string {
  if (template?.colorHex) return template.colorHex;
  if (mainCategory?.color) return mainCategory.color;
  return fallback;
}
