import { CategoryDimension } from '../../domain/categoryDimension/categoryDimension.types';
import { CategoryRepository, UpdateCategoryDimensionInput } from '../../ports/repositories/categoryRepository';

export type UpdateCategoryDimensionInputDto = {
  id: string;
  updates: UpdateCategoryDimensionInput;
};

export type UpdateCategoryDimensionDeps = {
  categoryRepository: CategoryRepository;
};

/**
 * Updates a category dimension (name, description, color, sort).
 */
export async function updateCategoryDimension(
  input: UpdateCategoryDimensionInputDto,
  deps: UpdateCategoryDimensionDeps,
): Promise<CategoryDimension> {
  return deps.categoryRepository.updateDimension(input.id, input.updates);
}
