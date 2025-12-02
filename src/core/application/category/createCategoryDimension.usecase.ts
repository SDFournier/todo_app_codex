import { CategoryDimension } from '../../domain/categoryDimension/categoryDimension.types';
import {
  CategoryRepository,
  CreateCategoryDimensionInput,
} from '../../ports/repositories/categoryRepository';

export type CreateCategoryDimensionInputDto = CreateCategoryDimensionInput;

export type CreateCategoryDimensionDeps = {
  categoryRepository: CategoryRepository;
};

/**
 * Creates a new category dimension.
 */
export async function createCategoryDimension(
  input: CreateCategoryDimensionInputDto,
  deps: CreateCategoryDimensionDeps,
): Promise<CategoryDimension> {
  return deps.categoryRepository.createDimension(input);
}
