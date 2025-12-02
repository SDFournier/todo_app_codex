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

  let dimension = await prisma.categoryDimension.findFirst({
    where: { userId, name: UNTRACKED_DIMENSION_NAME },
  });
  if (!dimension) {
    dimension = await prisma.categoryDimension.create({
      data: {
        userId,
        name: UNTRACKED_DIMENSION_NAME,
        description: 'System categories',
        isSystem: true,
        sortOrder: -100,
      },
    });
  }

  const created = await prisma.categoryValue.create({
    data: {
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
  const created = await prisma.taskTemplate.create({
    data: {
      userId,
      name: UNTRACKED_TEMPLATE_NAME,
      description: 'Fallback tracking when no specific activity is selected.',
      isQuickStart: false,
      isArchived: false,
      isSystem: true,
      isUntracked: true,
      mainCategoryValueId: category.id,
      taskTemplateCategory: { create: { categoryValueId: category.id } },
    },
    include: { taskTemplateCategory: { include: { categoryValue: true } }, mainCategoryValue: true },
  });

  return mapTaskTemplate(created);
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
