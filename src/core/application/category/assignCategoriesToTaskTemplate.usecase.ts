import { CategoryRepository } from '../../ports/repositories/categoryRepository';
import { TaskTemplateRepository } from '../../ports/repositories/taskTemplateRepository';
import { TaskTemplateArchivedError } from '../../domain/errors/domainErrors';

export type AssignCategoriesToTaskTemplateInput = {
  taskTemplateId: string;
  userId: string;
  categoryValueIds: string[];
};

export type AssignCategoriesToTaskTemplateDeps = {
  categoryRepository: CategoryRepository;
  taskTemplateRepository: TaskTemplateRepository;
};

const ensureTemplateUsable = async (
  taskTemplateId: string,
  deps: AssignCategoriesToTaskTemplateDeps,
): Promise<void> => {
  const template = await deps.taskTemplateRepository.findById(taskTemplateId);
  if (!template || template.isArchived) {
    throw new TaskTemplateArchivedError();
  }
};

const ensureSingleValuePerDimension = async (
  userId: string,
  categoryValueIds: string[],
  categoryRepository: CategoryRepository,
) => {
  const dimensions = await categoryRepository.listDimensionsByUser(userId);
  const dimensionByValue: Record<string, string> = {};
  for (const dimension of dimensions) {
    const values = await categoryRepository.listValuesByUserAndDimension(userId, dimension.id);
    values.forEach((v) => {
      dimensionByValue[v.id] = v.dimensionId;
    });
  }
  const seen: Record<string, string> = {};
  for (const id of categoryValueIds) {
    const dim = dimensionByValue[id];
    if (!dim) continue;
    if (seen[dim]) {
      throw new Error('Only one category value per dimension is allowed for a task template.');
    }
    seen[dim] = id;
  }
};

/**
 * Assigns category values to a task template (enforces one per dimension).
 */
export async function assignCategoriesToTaskTemplate(
  input: AssignCategoriesToTaskTemplateInput,
  deps: AssignCategoriesToTaskTemplateDeps,
): Promise<void> {
  await ensureTemplateUsable(input.taskTemplateId, deps);
  await ensureSingleValuePerDimension(input.userId, input.categoryValueIds, deps.categoryRepository);
  await deps.categoryRepository.replaceValuesForTaskTemplate(input.taskTemplateId, input.categoryValueIds);
}
