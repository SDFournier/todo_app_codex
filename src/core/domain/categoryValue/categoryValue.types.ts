/**
 * Domain model for a category value within a dimension.
 */
export type CategoryValue = {
  id: string;
  userId: string;
  dimensionId: string;
  parentId?: string | null;
  label: string;
  code?: string | null;
  color?: string | null;
  isProductive: boolean;
  isUntracked: boolean;
  metaTags?: unknown;
  isArchived: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};
