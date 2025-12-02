import { TimeEntry } from '../../domain/timeEntry/timeEntry.types';

export type CreateLiveTimeEntryInput = {
  userId: string;
  taskTemplateId?: string | null;
  mainCategoryValueId?: string | null;
  titleOverride?: string | null;
  notes?: string | null;
  startedAt: Date;
  isUntracked?: boolean;
  localDate?: Date | null;
  year?: number | null;
  month?: number | null;
  weekOfYear?: number | null;
  dayOfWeek?: number | null;
};

export type CreateManualTimeEntryInput = {
  userId: string;
  taskTemplateId?: string | null;
  mainCategoryValueId?: string | null;
  titleOverride?: string | null;
  notes?: string | null;
  startedAt: Date;
  endedAt: Date;
  durationSeconds?: number | null;
  isUntracked?: boolean;
  localDate?: Date | null;
  year?: number | null;
  month?: number | null;
  weekOfYear?: number | null;
  dayOfWeek?: number | null;
};

export type UpdateTimeEntryInput = {
  taskTemplateId?: string | null;
  titleOverride?: string | null;
  notes?: string | null;
  startedAt?: Date;
  endedAt?: Date | null;
  durationSeconds?: number | null;
  mainCategoryValueId?: string | null;
  isUntracked?: boolean;
  localDate?: Date | null;
  year?: number | null;
  month?: number | null;
  weekOfYear?: number | null;
  dayOfWeek?: number | null;
  isRunning?: boolean;
  deletedAt?: Date | null;
};

/**
 * Time entry repository port.
 */
export interface TimeEntryRepository {
  createLiveEntry(input: CreateLiveTimeEntryInput): Promise<TimeEntry>;
  createManualEntry(input: CreateManualTimeEntryInput): Promise<TimeEntry>;
  updateEntry(id: string, input: UpdateTimeEntryInput): Promise<TimeEntry>;
  findById(id: string): Promise<TimeEntry | null>;
  findRunningByUser(userId: string): Promise<TimeEntry | null>;
  stopEntry(entryId: string, endedAt: Date): Promise<TimeEntry>;
  softDelete(entryId: string): Promise<void>;
  findByDateRange(params: { userId: string; from: Date; to: Date }): Promise<TimeEntry[]>;
}
