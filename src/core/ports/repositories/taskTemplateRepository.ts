import { TaskTemplate } from '../../domain/taskTemplate/taskTemplate.types';

export type CreateTaskTemplateInput = {
  userId: string;
  name: string;
  description?: string | null;
  isQuickStart?: boolean;
  isArchived?: boolean;
  isSystem?: boolean;
  isUntracked?: boolean;
  defaultDurationEstimateMinutes?: number | null;
  colorHex?: string | null;
  mainCategoryValueId?: string | null;
};

export type UpdateTaskTemplateInput = {
  name?: string;
  description?: string | null;
  isQuickStart?: boolean;
  isArchived?: boolean;
  isSystem?: boolean;
  isUntracked?: boolean;
  defaultDurationEstimateMinutes?: number | null;
  colorHex?: string | null;
  mainCategoryValueId?: string | null;
};

/**
 * Task template repository port.
 */
export interface TaskTemplateRepository {
  create(input: CreateTaskTemplateInput): Promise<TaskTemplate>;
  update(id: string, input: UpdateTaskTemplateInput): Promise<TaskTemplate>;
  archive(id: string): Promise<void>;
  findById(id: string): Promise<TaskTemplate | null>;
  findByUser(userId: string): Promise<TaskTemplate[]>;
  findQuickStartByUser(userId: string): Promise<TaskTemplate[]>;
  isNameTakenForUser(userId: string, name: string): Promise<boolean>;
  setQuickStart(id: string, isQuickStart: boolean): Promise<void>;
}
