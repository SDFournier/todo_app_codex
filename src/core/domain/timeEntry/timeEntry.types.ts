import { CategoryValue } from '../categoryValue/categoryValue.types';

/**
 * Domain model for a concrete time entry (session).
 * Supports live and manual entries; overlaps allowed in v1.
 */
export type TimeEntry = {
  id: string;
  userId: string;
  taskTemplateId?: string | null;
  templateName?: string | null;
  mainCategoryValueId?: string | null;
  mainCategoryLabel?: string | null;
  mainCategoryColor?: string | null;
  mainCategoryIsProductive?: boolean | null;
  mainCategoryIsUntracked?: boolean | null;
  titleOverride?: string | null;
  notes?: string | null;
  startedAt: Date;
  endedAt?: Date | null;
  durationSeconds?: number | null;
  isRunning: boolean;
  isUntracked: boolean;
  categories?: CategoryValue[];
  categoryValueIds?: string[];
  deletedAt?: Date | null;
  // Convenience fields for analytics (optional in domain)
  localDate?: Date | null;
  year?: number | null;
  month?: number | null;
  weekOfYear?: number | null;
  dayOfWeek?: number | null;
  createdAt: Date;
  updatedAt: Date;
};
