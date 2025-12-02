import { TaskTemplate } from '../../domain/taskTemplate/taskTemplate.types';
import { TaskTemplateRepository } from '../../ports/repositories/taskTemplateRepository';

export type ListTaskTemplatesInput = {
  userId: string;
};

export type ListTaskTemplatesDeps = {
  taskTemplateRepository: TaskTemplateRepository;
};

/**
 * Lists task templates for a user (optionally filter archived via future flags).
 */
export async function listTaskTemplates(
  input: ListTaskTemplatesInput,
  deps: ListTaskTemplatesDeps,
): Promise<TaskTemplate[]> {
  return deps.taskTemplateRepository.findByUser(input.userId);
}
