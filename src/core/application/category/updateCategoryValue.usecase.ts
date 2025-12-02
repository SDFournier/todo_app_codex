import { CategoryValue } from '../../domain/categoryValue/categoryValue.types';
import {
  CategoryRepository,
  UpdateCategoryValueInput,
} from '../../ports/repositories/categoryRepository';

export type UpdateCategoryValueInputDto = {
  id: string;
  updates: UpdateCategoryValueInput;
};

export type UpdateCategoryValueDeps = {
  categoryRepository: CategoryRepository;
};

/**
 * Updates a category value (archive, rename, reparent, etc.).
 */
export async function updateCategoryValue(
  input: UpdateCategoryValueInputDto,
  deps: UpdateCategoryValueDeps,
): Promise<CategoryValue> {
  return deps.categoryRepository.updateCategoryValue(input.id, input.updates);
}
