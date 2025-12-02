/**
 * Domain model for a category dimension (facet/axis).
 */
export type CategoryDimension = {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  color?: string | null;
  isSystem: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};
