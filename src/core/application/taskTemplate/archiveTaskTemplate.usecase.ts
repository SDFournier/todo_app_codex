import { TaskTemplateRepository } from '../../ports/repositories/taskTemplateRepository';

export type ArchiveTaskTemplateInput = {
  id: string;
};

export type ArchiveTaskTemplateDeps = {
  taskTemplateRepository: TaskTemplateRepository;
};

/**
 * Archives a task template.
 */
export async function archiveTaskTemplate(
  input: ArchiveTaskTemplateInput,
  deps: ArchiveTaskTemplateDeps,
): Promise<void> {
  await deps.taskTemplateRepository.archive(input.id);
}
