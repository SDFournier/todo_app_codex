import { CategoryDimension } from '../../domain/categoryDimension/categoryDimension.types';
import { CategoryValue } from '../../domain/categoryValue/categoryValue.types';

export type CreateCategoryDimensionInput = {
  userId: string;
  name: string;
  description?: string | null;
  color?: string | null;
  isSystem?: boolean;
  sortOrder?: number;
};

export type UpdateCategoryDimensionInput = {
  name?: string;
  description?: string | null;
  color?: string | null;
  sortOrder?: number;
};

export type CreateCategoryValueInput = {
  userId: string;
  dimensionId: string;
  parentId?: string | null;
  label: string;
  code?: string | null;
  color?: string | null;
  isProductive?: boolean;
  isUntracked?: boolean;
  sortOrder?: number;
};

export type UpdateCategoryValueInput = {
  dimensionId?: string;
  parentId?: string | null;
  label?: string;
  code?: string | null;
  color?: string | null;
  isArchived?: boolean;
  isProductive?: boolean;
  isUntracked?: boolean;
  sortOrder?: number;
};

/**
 * Category repository port.
 */
export interface CategoryRepository {
  listDimensionsByUser(userId: string): Promise<CategoryDimension[]>;
  createDimension(input: CreateCategoryDimensionInput): Promise<CategoryDimension>;
  updateDimension(id: string, input: UpdateCategoryDimensionInput): Promise<CategoryDimension>;
  listValuesByUserAndDimension(userId: string, dimensionId: string): Promise<CategoryValue[]>;
  createCategoryValue(input: CreateCategoryValueInput): Promise<CategoryValue>;
  updateCategoryValue(id: string, input: UpdateCategoryValueInput): Promise<CategoryValue>;
  assignValuesToTaskTemplate(taskTemplateId: string, categoryValueIds: string[]): Promise<void>;
  assignValuesToTimeEntry(timeEntryId: string, categoryValueIds: string[]): Promise<void>;
  replaceValuesForTaskTemplate(taskTemplateId: string, categoryValueIds: string[]): Promise<void>;
  replaceValuesForTimeEntry(timeEntryId: string, categoryValueIds: string[]): Promise<void>;
}
