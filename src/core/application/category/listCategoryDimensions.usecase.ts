import { CategoryDimension } from '../../domain/categoryDimension/categoryDimension.types';
import { CategoryRepository } from '../../ports/repositories/categoryRepository';

export type ListCategoryDimensionsInput = {
  userId: string;
};

export type ListCategoryDimensionsDeps = {
  categoryRepository: CategoryRepository;
};

/**
 * Lists category dimensions for a user.
 */
export async function listCategoryDimensions(
  input: ListCategoryDimensionsInput,
  deps: ListCategoryDimensionsDeps,
): Promise<CategoryDimension[]> {
  return deps.categoryRepository.listDimensionsByUser(input.userId);
}
