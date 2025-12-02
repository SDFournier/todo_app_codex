import { prisma } from '@/infra/db/prismaClient';
import { CreateTaskTemplateInput, TaskTemplateRepository } from '@/core/ports/repositories/taskTemplateRepository';
import { TaskTemplate } from '@/core/domain/taskTemplate/taskTemplate.types';
import { mapTaskTemplate } from './mappers';

export class PrismaTaskTemplateRepository implements TaskTemplateRepository {
  async create(input: CreateTaskTemplateInput): Promise<TaskTemplate> {
    const entity = await prisma.taskTemplate.create({
      data: {
        userId: input.userId,
        name: input.name,
        description: input.description ?? null,
        isQuickStart: input.isQuickStart ?? false,
        isArchived: input.isArchived ?? false,
        isSystem: input.isSystem ?? false,
        isUntracked: input.isUntracked ?? false,
        defaultDurationEstimateMinutes: input.defaultDurationEstimateMinutes ?? null,
        colorHex: input.colorHex ?? null,
        mainCategoryValueId: input.mainCategoryValueId ?? null,
        taskTemplateCategory: input.categoryValueIds && input.categoryValueIds.length > 0
          ? {
              createMany: {
                data: input.categoryValueIds.map((categoryValueId) => ({ categoryValueId })),
                skipDuplicates: true,
              },
            }
          : undefined,
      },
      include: {
        taskTemplateCategory: { include: { categoryValue: true } },
        mainCategoryValue: true,
      },
    });
    return mapTaskTemplate(entity);
  }

  async update(id: string, input: Partial<CreateTaskTemplateInput>): Promise<TaskTemplate> {
    const { mainCategoryValueId, categoryValueIds, ...rest } = input;
    const entity = await prisma.taskTemplate.update({
      where: { id },
      data: {
        ...rest,
        colorHex: input.colorHex === undefined ? undefined : input.colorHex ?? null,
        isSystem: input.isSystem ?? undefined,
        isUntracked: input.isUntracked ?? undefined,
        mainCategoryValue:
          mainCategoryValueId === undefined
            ? undefined
            : mainCategoryValueId
              ? { connect: { id: mainCategoryValueId } }
              : { disconnect: true },
        ...(categoryValueIds
          ? {
              taskTemplateCategory: {
                deleteMany: { taskTemplateId: id },
                createMany: {
                  data: categoryValueIds.map((categoryValueId) => ({ categoryValueId })),
                  skipDuplicates: true,
                },
              },
            }
          : {}),
      },
      include: {
        taskTemplateCategory: { include: { categoryValue: true } },
        mainCategoryValue: true,
      },
    });
    return mapTaskTemplate(entity);
  }

  async archive(id: string): Promise<void> {
    await prisma.taskTemplate.update({ where: { id }, data: { isArchived: true } });
  }

  async findById(id: string): Promise<TaskTemplate | null> {
    const entity = await prisma.taskTemplate.findUnique({
      where: { id },
      include: {
        taskTemplateCategory: { include: { categoryValue: true } },
        mainCategoryValue: true,
      },
    });
    return entity ? mapTaskTemplate(entity) : null;
  }

  async findByUser(userId: string): Promise<TaskTemplate[]> {
    const entities = await prisma.taskTemplate.findMany({
      where: { userId, isSystem: false },
      orderBy: { name: 'asc' },
      include: {
        taskTemplateCategory: { include: { categoryValue: true } },
        mainCategoryValue: true,
      },
    });
    return entities.map(mapTaskTemplate);
  }

  async findQuickStartByUser(userId: string): Promise<TaskTemplate[]> {
    const entities = await prisma.taskTemplate.findMany({
      where: { userId, isQuickStart: true, isArchived: false, isSystem: false, isUntracked: false },
      orderBy: { name: 'asc' },
      include: {
        taskTemplateCategory: { include: { categoryValue: true } },
        mainCategoryValue: true,
      },
    });
    return entities.map(mapTaskTemplate);
  }

  async isNameTakenForUser(userId: string, name: string): Promise<boolean> {
    const count = await prisma.taskTemplate.count({ where: { userId, name } });
    return count > 0;
  }

  async setQuickStart(id: string, isQuickStart: boolean): Promise<void> {
    await prisma.taskTemplate.update({ where: { id }, data: { isQuickStart } });
  }
}
