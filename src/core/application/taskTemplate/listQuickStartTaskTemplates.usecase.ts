import { TaskTemplate } from '../../domain/taskTemplate/taskTemplate.types';
import { TaskTemplateRepository } from '../../ports/repositories/taskTemplateRepository';

export type ListQuickStartTaskTemplatesInput = {
  userId: string;
};

export type ListQuickStartTaskTemplatesDeps = {
  taskTemplateRepository: TaskTemplateRepository;
};

/**
 * Lists quick-start task templates for a user.
 */
export async function listQuickStartTaskTemplates(
  input: ListQuickStartTaskTemplatesInput,
  deps: ListQuickStartTaskTemplatesDeps,
): Promise<TaskTemplate[]> {
  return deps.taskTemplateRepository.findQuickStartByUser(input.userId);
}
