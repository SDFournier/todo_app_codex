import { TaskTemplate } from '../../domain/taskTemplate/taskTemplate.types';
import { CreateTaskTemplateInput, TaskTemplateRepository } from '../../ports/repositories/taskTemplateRepository';

export type CreateTaskTemplateInputDto = CreateTaskTemplateInput;

export type CreateTaskTemplateDeps = {
  taskTemplateRepository: TaskTemplateRepository;
};

/**
 * Creates a new task template, enforcing per-user name uniqueness.
 */
export async function createTaskTemplate(
  input: CreateTaskTemplateInputDto,
  deps: CreateTaskTemplateDeps,
): Promise<TaskTemplate> {
  const taken = await deps.taskTemplateRepository.isNameTakenForUser(input.userId, input.name);
  if (taken) {
    throw new Error('Task template name already exists for this user.');
  }
  return deps.taskTemplateRepository.create(input);
}
