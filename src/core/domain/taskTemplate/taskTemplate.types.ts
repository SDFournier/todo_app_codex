/**
 * Domain model for a reusable task template (“what I usually do”).
 */
export type TaskTemplate = {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  isQuickStart: boolean;
  isArchived: boolean;
  isSystem: boolean;
  isUntracked: boolean;
  defaultDurationEstimateMinutes?: number | null;
  colorHex?: string | null;
  mainCategoryValueId?: string | null;
  mainCategoryValue?: import('../categoryValue/categoryValue.types').CategoryValue | null;
  categoryValueIds?: string[];
  categories?: import('../categoryValue/categoryValue.types').CategoryValue[];
  createdAt: Date;
  updatedAt: Date;
};
