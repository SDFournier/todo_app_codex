import { prisma } from '@/infra/db/prismaClient';
import { CategoryRepository } from '@/core/ports/repositories/categoryRepository';
import {
  CreateCategoryDimensionInput,
  CreateCategoryValueInput,
  UpdateCategoryDimensionInput,
  UpdateCategoryValueInput,
} from '@/core/ports/repositories/categoryRepository';
import { CategoryDimension } from '@/core/domain/categoryDimension/categoryDimension.types';
import { CategoryValue } from '@/core/domain/categoryValue/categoryValue.types';
import { mapCategoryDimension, mapCategoryValue } from './mappers';

export class PrismaCategoryRepository implements CategoryRepository {
  async listDimensionsByUser(userId: string): Promise<CategoryDimension[]> {
    const dims = await prisma.categoryDimension.findMany({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return dims.map(mapCategoryDimension);
  }

  async createDimension(input: CreateCategoryDimensionInput): Promise<CategoryDimension> {
    const { color: _color, ...rest } = input;
    const dim = await prisma.categoryDimension.create({
      data: {
        ...rest,
        description: rest.description ?? null,
        isSystem: rest.isSystem ?? false,
        sortOrder: rest.sortOrder ?? 0,
      },
    });
    return mapCategoryDimension(dim);
  }

  async updateDimension(id: string, input: UpdateCategoryDimensionInput): Promise<CategoryDimension> {
    const { color: _color, ...rest } = input;
    const dim = await prisma.categoryDimension.update({
      where: { id },
      data: {
        ...rest,
      },
    });
    return mapCategoryDimension(dim);
  }

  async listValuesByUserAndDimension(userId: string, dimensionId: string): Promise<CategoryValue[]> {
    const vals = await prisma.categoryValue.findMany({
      where: { userId, dimensionId },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    });
    return vals.map(mapCategoryValue);
  }

  async createCategoryValue(input: CreateCategoryValueInput): Promise<CategoryValue> {
    const val = await prisma.categoryValue.create({
      data: {
        ...input,
        parentId: input.parentId ?? null,
        code: input.code ?? null,
        color: input.color ?? null,
        isProductive: input.isProductive ?? false,
        isUntracked: input.isUntracked ?? false,
        sortOrder: input.sortOrder ?? 0,
        isArchived: false,
      },
    });
    return mapCategoryValue(val);
  }

  async updateCategoryValue(id: string, input: UpdateCategoryValueInput): Promise<CategoryValue> {
    const val = await prisma.categoryValue.update({
      where: { id },
      data: {
        ...input,
        dimensionId: input.dimensionId ?? undefined,
        isProductive: input.isProductive ?? undefined,
        isUntracked: input.isUntracked ?? undefined,
      },
    });
    return mapCategoryValue(val);
  }

  async assignValuesToTaskTemplate(taskTemplateId: string, categoryValueIds: string[]): Promise<void> {
    if (!categoryValueIds.length) return;
    await prisma.taskTemplateCategory.createMany({
      data: categoryValueIds.map((categoryValueId) => ({
        taskTemplateId,
        categoryValueId,
      })),
      skipDuplicates: true,
    });
  }

  async replaceValuesForTaskTemplate(taskTemplateId: string, categoryValueIds: string[]): Promise<void> {
    const ops: any[] = [prisma.taskTemplateCategory.deleteMany({ where: { taskTemplateId } })];
    if (categoryValueIds.length) {
      ops.push(
        prisma.taskTemplateCategory.createMany({
          data: categoryValueIds.map((categoryValueId) => ({ taskTemplateId, categoryValueId })),
          skipDuplicates: true,
        }),
      );
    }
    await prisma.$transaction(ops);
  }

  async assignValuesToTimeEntry(timeEntryId: string, categoryValueIds: string[]): Promise<void> {
    if (!categoryValueIds.length) return;
    await prisma.timeEntryCategory.createMany({
      data: categoryValueIds.map((categoryValueId) => ({
        timeEntryId,
        categoryValueId,
      })),
      skipDuplicates: true,
    });
  }

  async replaceValuesForTimeEntry(timeEntryId: string, categoryValueIds: string[]): Promise<void> {
    const ops: any[] = [prisma.timeEntryCategory.deleteMany({ where: { timeEntryId } })];
    if (categoryValueIds.length) {
      ops.push(
        prisma.timeEntryCategory.createMany({
          data: categoryValueIds.map((categoryValueId) => ({ timeEntryId, categoryValueId })),
          skipDuplicates: true,
        }),
      );
    }
    await prisma.$transaction(ops);
  }
}
