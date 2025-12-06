import { prisma } from '@/infra/db/prismaClient';
import { createUseCases } from '@/infra/container';
import { mapCategoryValue, mapTaskTemplate } from '@/infra/repositories/prisma/mappers';
import { CategoryValue } from '@/core/domain/categoryValue/categoryValue.types';
import { TaskTemplate } from '@/core/domain/taskTemplate/taskTemplate.types';
import { TimeEntry } from '@/core/domain/timeEntry/timeEntry.types';
import {
  UNTRACKED_CATEGORY_COLOR,
  UNTRACKED_CATEGORY_LABEL,
  UNTRACKED_DISPLAY_TITLE,
  UNTRACKED_TEMPLATE_NAME,
} from '@/lib/untracked';

const UNTRACKED_DIMENSION_NAME = 'System';

export const getUntrackedDisplayTitle = () => UNTRACKED_DISPLAY_TITLE;

const ensureUntrackedCategory = async (userId: string): Promise<CategoryValue> => {
  const existing = await prisma.categoryValue.findFirst({
    where: { userId, isUntracked: true },
  });
  if (existing) {
    return mapCategoryValue(existing);
  }

  const dimension = await prisma.categoryDimension.upsert({
    where: { userId_name: { userId, name: UNTRACKED_DIMENSION_NAME } },
    update: {
      isSystem: true,
      sortOrder: -100,
      description: 'System categories',
    },
    create: {
      userId,
      name: UNTRACKED_DIMENSION_NAME,
      description: 'System categories',
      isSystem: true,
      sortOrder: -100,
    },
  });

  const created = await prisma.categoryValue.upsert({
    where: { dimensionId_label: { dimensionId: dimension.id, label: UNTRACKED_CATEGORY_LABEL } },
    update: {
      code: 'untracked',
      color: UNTRACKED_CATEGORY_COLOR,
      isProductive: false,
      isUntracked: true,
      sortOrder: -100,
      metaTags: ['untracked'],
    },
    create: {
      userId,
      dimensionId: dimension.id,
      label: UNTRACKED_CATEGORY_LABEL,
      code: 'untracked',
      color: UNTRACKED_CATEGORY_COLOR,
      isProductive: false,
      isUntracked: true,
      sortOrder: -100,
      metaTags: ['untracked'],
    },
  });

  return mapCategoryValue(created);
};

const ensureUntrackedTemplate = async (userId: string): Promise<TaskTemplate> => {
  const existing = await prisma.taskTemplate.findFirst({
    where: { userId, isUntracked: true },
    include: { taskTemplateCategory: { include: { categoryValue: true } }, mainCategoryValue: true },
  });
  if (existing) {
    return mapTaskTemplate(existing);
  }

  const category = await ensureUntrackedCategory(userId);
  const baseTemplate = await prisma.taskTemplate.upsert({
    where: { userId_name: { userId, name: UNTRACKED_TEMPLATE_NAME } },
    update: {
      description: 'Fallback tracking when no specific activity is selected.',
      isQuickStart: false,
      isArchived: false,
      isSystem: true,
      isUntracked: true,
      mainCategoryValueId: category.id,
    },
    create: {
      userId,
      name: UNTRACKED_TEMPLATE_NAME,
      description: 'Fallback tracking when no specific activity is selected.',
      isQuickStart: false,
      isArchived: false,
      isSystem: true,
      isUntracked: true,
      mainCategoryValueId: category.id,
    },
  });

  await prisma.taskTemplateCategory.upsert({
    where: { taskTemplateId_categoryValueId: { taskTemplateId: baseTemplate.id, categoryValueId: category.id } },
    update: {},
    create: { taskTemplateId: baseTemplate.id, categoryValueId: category.id },
  });

  const hydrated = await prisma.taskTemplate.findUniqueOrThrow({
    where: { id: baseTemplate.id },
    include: { taskTemplateCategory: { include: { categoryValue: true } }, mainCategoryValue: true },
  });

  return mapTaskTemplate(hydrated);
};

export const startUntrackedEntryForUser = async (userId: string): Promise<TimeEntry> => {
  const [category, template] = await Promise.all([
    ensureUntrackedCategory(userId),
    ensureUntrackedTemplate(userId),
  ]);

  const useCases = createUseCases();
  return useCases.startTimeEntry({
    userId,
    taskTemplateId: template.id,
    mainCategoryValueId: category.id,
    titleOverride: UNTRACKED_DISPLAY_TITLE,
    isUntracked: true,
    categoryValueIds: [category.id],
    stopRunningIfExists: false,
  });
};

/**
 * Ensures the user always has a running entry by starting an Untracked entry when none is running.
 */
export const ensureRunningEntry = async (userId: string): Promise<TimeEntry> => {
  const useCases = createUseCases();
  const existing = await useCases.repositories.timeEntryRepository.findRunningByUser(userId);
  if (existing) return existing;
  return startUntrackedEntryForUser(userId);
};
