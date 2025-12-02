import { startTimeEntry } from '../core/application/timeEntry/startTimeEntry.usecase';
import { stopTimeEntry } from '../core/application/timeEntry/stopTimeEntry.usecase';
import { createManualTimeEntry } from '../core/application/timeEntry/createManualTimeEntry.usecase';
import { editTimeEntry } from '../core/application/timeEntry/editTimeEntry.usecase';
import { deleteTimeEntry } from '../core/application/timeEntry/deleteTimeEntry.usecase';
import { listTimeEntriesByRange } from '../core/application/timeEntry/listTimeEntriesByRange.usecase';
import { createTaskTemplate } from '../core/application/taskTemplate/createTaskTemplate.usecase';
import { updateTaskTemplate } from '../core/application/taskTemplate/updateTaskTemplate.usecase';
import { archiveTaskTemplate } from '../core/application/taskTemplate/archiveTaskTemplate.usecase';
import { listTaskTemplates } from '../core/application/taskTemplate/listTaskTemplates.usecase';
import { listQuickStartTaskTemplates } from '../core/application/taskTemplate/listQuickStartTaskTemplates.usecase';
import { listCategoryDimensions } from '../core/application/category/listCategoryDimensions.usecase';
import { createCategoryDimension } from '../core/application/category/createCategoryDimension.usecase';
import { updateCategoryDimension } from '../core/application/category/updateCategoryDimension.usecase';
import { listCategoryValues } from '../core/application/category/listCategoryValues.usecase';
import { createCategoryValue } from '../core/application/category/createCategoryValue.usecase';
import { updateCategoryValue } from '../core/application/category/updateCategoryValue.usecase';
import { assignCategoriesToTaskTemplate } from '../core/application/category/assignCategoriesToTaskTemplate.usecase';
import { assignCategoriesToTimeEntry } from '../core/application/category/assignCategoriesToTimeEntry.usecase';
import { getDailySummary } from '../core/application/analytics/getDailySummary.usecase';
import { getRangeSummary } from '../core/application/analytics/getRangeSummary.usecase';
import { setQuickStartTemplate } from '../core/application/taskTemplate/setQuickStart.usecase';

import { PrismaUserRepository } from './repositories/prisma/PrismaUserRepository';
import { PrismaTaskTemplateRepository } from './repositories/prisma/PrismaTaskTemplateRepository';
import { PrismaTimeEntryRepository } from './repositories/prisma/PrismaTimeEntryRepository';
import { PrismaCategoryRepository } from './repositories/prisma/PrismaCategoryRepository';
import { prisma } from './db/prismaClient';

const devUserSeed =
  process.env.NODE_ENV !== 'production' && process.env.DEV_USER_ID
    ? prisma.user.upsert({
        where: { id: process.env.DEV_USER_ID },
        update: {},
        create: {
          id: process.env.DEV_USER_ID,
          email: process.env.DEV_USER_EMAIL ?? `dev+${process.env.DEV_USER_ID}@example.com`,
          displayName: process.env.DEV_USER_NAME ?? 'Dev User',
          timezone: process.env.DEV_USER_TZ ?? 'UTC',
        },
      }).catch((err) => {
        console.error('Failed to seed dev user', err);
        return null;
      })
    : null;

/**
 * Simple composition root to wire repositories into use-cases.
 * Intended for server actions / API routes to import and call.
 */
export function createUseCases() {
  // Fire-and-forget seed of the dev user when enabled.
  void devUserSeed;

  const userRepository = new PrismaUserRepository();
  const taskTemplateRepository = new PrismaTaskTemplateRepository();
  const timeEntryRepository = new PrismaTimeEntryRepository();
  const categoryRepository = new PrismaCategoryRepository();

  const now = () => new Date();

  return {
    startTimeEntry: (input: Parameters<typeof startTimeEntry>[0]) =>
      startTimeEntry(input, { timeEntryRepository, taskTemplateRepository, categoryRepository, now }),
    stopTimeEntry: (input: Parameters<typeof stopTimeEntry>[0]) =>
      stopTimeEntry(input, { timeEntryRepository, now }),
    createManualTimeEntry: (input: Parameters<typeof createManualTimeEntry>[0]) =>
      createManualTimeEntry(input, { timeEntryRepository, taskTemplateRepository, categoryRepository }),
    editTimeEntry: (input: Parameters<typeof editTimeEntry>[0]) =>
      editTimeEntry(input, { timeEntryRepository, taskTemplateRepository, categoryRepository }),
    deleteTimeEntry: (input: Parameters<typeof deleteTimeEntry>[0]) =>
      deleteTimeEntry(input, { timeEntryRepository }),
    listTimeEntriesByRange: (input: Parameters<typeof listTimeEntriesByRange>[0]) =>
      listTimeEntriesByRange(input, { timeEntryRepository }),

    createTaskTemplate: (input: Parameters<typeof createTaskTemplate>[0]) =>
      createTaskTemplate(input, { taskTemplateRepository }),
    updateTaskTemplate: (input: Parameters<typeof updateTaskTemplate>[0]) =>
      updateTaskTemplate(input, { taskTemplateRepository }),
    archiveTaskTemplate: (input: Parameters<typeof archiveTaskTemplate>[0]) =>
      archiveTaskTemplate(input, { taskTemplateRepository }),
    listTaskTemplates: (input: Parameters<typeof listTaskTemplates>[0]) =>
      listTaskTemplates(input, { taskTemplateRepository }),
    listQuickStartTaskTemplates: (input: Parameters<typeof listQuickStartTaskTemplates>[0]) =>
      listQuickStartTaskTemplates(input, { taskTemplateRepository }),
    setQuickStartTemplate: (input: Parameters<typeof setQuickStartTemplate>[0]) =>
      setQuickStartTemplate(input, { taskTemplateRepository }),

    listCategoryDimensions: (input: Parameters<typeof listCategoryDimensions>[0]) =>
      listCategoryDimensions(input, { categoryRepository }),
    createCategoryDimension: (input: Parameters<typeof createCategoryDimension>[0]) =>
      createCategoryDimension(input, { categoryRepository }),
    updateCategoryDimension: (input: Parameters<typeof updateCategoryDimension>[0]) =>
      updateCategoryDimension(input, { categoryRepository }),
    listCategoryValues: (input: Parameters<typeof listCategoryValues>[0]) =>
      listCategoryValues(input, { categoryRepository }),
    createCategoryValue: (input: Parameters<typeof createCategoryValue>[0]) =>
      createCategoryValue(input, { categoryRepository }),
    updateCategoryValue: (input: Parameters<typeof updateCategoryValue>[0]) =>
      updateCategoryValue(input, { categoryRepository }),
    assignCategoriesToTaskTemplate: (input: Parameters<typeof assignCategoriesToTaskTemplate>[0]) =>
      assignCategoriesToTaskTemplate(input, { categoryRepository, taskTemplateRepository }),
    assignCategoriesToTimeEntry: (input: Parameters<typeof assignCategoriesToTimeEntry>[0]) =>
      assignCategoriesToTimeEntry(input, { categoryRepository, timeEntryRepository }),

    getDailySummary: (input: Parameters<typeof getDailySummary>[0]) =>
      getDailySummary(input, { timeEntryRepository }),
    getRangeSummary: (input: Parameters<typeof getRangeSummary>[0]) =>
      getRangeSummary(input, { timeEntryRepository }),

    // Repos exposed for testing or advanced composition
    repositories: {
      userRepository,
      taskTemplateRepository,
      timeEntryRepository,
      categoryRepository,
    },
  };
}
