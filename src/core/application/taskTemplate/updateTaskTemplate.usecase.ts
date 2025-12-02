import { TaskTemplate } from '../../domain/taskTemplate/taskTemplate.types';
import {
  TaskTemplateRepository,
  UpdateTaskTemplateInput,
} from '../../ports/repositories/taskTemplateRepository';

export type UpdateTaskTemplateInputDto = {
  id: string;
  updates: UpdateTaskTemplateInput;
};

export type UpdateTaskTemplateDeps = {
  taskTemplateRepository: TaskTemplateRepository;
};

/**
 * Updates a task template and returns the updated template.
 */
export async function updateTaskTemplate(
  input: UpdateTaskTemplateInputDto,
  deps: UpdateTaskTemplateDeps,
): Promise<TaskTemplate> {
  const template = await deps.taskTemplateRepository.update(input.id, input.updates);
  return template;
}
