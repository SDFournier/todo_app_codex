import { CategoryValue } from '../../domain/categoryValue/categoryValue.types';
import {
  CategoryRepository,
  CreateCategoryValueInput,
} from '../../ports/repositories/categoryRepository';

export type CreateCategoryValueInputDto = CreateCategoryValueInput;

export type CreateCategoryValueDeps = {
  categoryRepository: CategoryRepository;
};

/**
 * Creates a new category value within a dimension.
 */
export async function createCategoryValue(
  input: CreateCategoryValueInputDto,
  deps: CreateCategoryValueDeps,
): Promise<CategoryValue> {
  return deps.categoryRepository.createCategoryValue(input);
}
