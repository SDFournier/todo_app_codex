import { CategoryValue } from '../../domain/categoryValue/categoryValue.types';
import { CategoryRepository } from '../../ports/repositories/categoryRepository';

export type ListCategoryValuesInput = {
  userId: string;
  dimensionId: string;
};

export type ListCategoryValuesDeps = {
  categoryRepository: CategoryRepository;
};

/**
 * Lists category values for a dimension and user.
 */
export async function listCategoryValues(
  input: ListCategoryValuesInput,
  deps: ListCategoryValuesDeps,
): Promise<CategoryValue[]> {
  return deps.categoryRepository.listValuesByUserAndDimension(input.userId, input.dimensionId);
}
