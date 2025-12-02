import { TaskTemplateRepository } from '@/core/ports/repositories/taskTemplateRepository';
import { TaskTemplateNotFoundError } from '@/core/domain/errors/domainErrors';

export type SetQuickStartInput = {
  userId: string;
  templateId: string;
  isQuickStart: boolean;
};

export type SetQuickStartDeps = {
  taskTemplateRepository: TaskTemplateRepository;
};

export async function setQuickStartTemplate(
  input: SetQuickStartInput,
  deps: SetQuickStartDeps,
): Promise<void> {
  const tpl = await deps.taskTemplateRepository.findById(input.templateId);
  if (!tpl || tpl.userId !== input.userId) {
    throw new TaskTemplateNotFoundError();
  }
  if (tpl.isSystem || tpl.isUntracked) {
    throw new TaskTemplateNotFoundError();
  }
  await deps.taskTemplateRepository.setQuickStart(input.templateId, input.isQuickStart);
}
