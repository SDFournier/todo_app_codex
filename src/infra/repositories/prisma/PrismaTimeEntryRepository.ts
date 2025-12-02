import { prisma } from '@/infra/db/prismaClient';
import {
  TimeEntryRepository,
  CreateLiveTimeEntryInput,
  CreateManualTimeEntryInput,
  UpdateTimeEntryInput,
} from '@/core/ports/repositories/timeEntryRepository';
import { TimeEntry } from '@/core/domain/timeEntry/timeEntry.types';
import { mapCategoryValue, mapTimeEntry } from './mappers';

export class PrismaTimeEntryRepository implements TimeEntryRepository {
  async createLiveEntry(input: CreateLiveTimeEntryInput): Promise<TimeEntry> {
    const entity = await prisma.timeEntry.create({
      data: {
        ...input,
        taskTemplateId: input.taskTemplateId ?? null,
        mainCategoryValueId: input.mainCategoryValueId ?? null,
        titleOverride: input.titleOverride ?? null,
        notes: input.notes ?? null,
        isUntracked: input.isUntracked ?? false,
        localDate: input.localDate ?? null,
        year: input.year ?? null,
        month: input.month ?? null,
        weekOfYear: input.weekOfYear ?? null,
        dayOfWeek: input.dayOfWeek ?? null,
        endedAt: null,
        durationSeconds: null,
        isRunning: true,
        deletedAt: null,
      },
    });
    return mapTimeEntry(entity);
  }

  async createManualEntry(input: CreateManualTimeEntryInput): Promise<TimeEntry> {
    const entity = await prisma.timeEntry.create({
      data: {
        ...input,
        taskTemplateId: input.taskTemplateId ?? null,
        mainCategoryValueId: input.mainCategoryValueId ?? null,
        titleOverride: input.titleOverride ?? null,
        notes: input.notes ?? null,
        isUntracked: input.isUntracked ?? false,
        localDate: input.localDate ?? null,
        year: input.year ?? null,
        month: input.month ?? null,
        weekOfYear: input.weekOfYear ?? null,
        dayOfWeek: input.dayOfWeek ?? null,
        durationSeconds: input.durationSeconds ?? null,
        isRunning: false,
        deletedAt: null,
      },
    });
    return mapTimeEntry(entity);
  }

  async updateEntry(id: string, input: UpdateTimeEntryInput): Promise<TimeEntry> {
    const existing = await prisma.timeEntry.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new Error('Time entry not found');
    }

    const next = await prisma.timeEntry.update({
      where: { id },
      data: input,
    });

    if (next.startedAt && next.endedAt && input.durationSeconds === undefined) {
      const durationSeconds = Math.floor((next.endedAt.getTime() - next.startedAt.getTime()) / 1000);
      const recalculated = await prisma.timeEntry.update({
        where: { id },
        data: { durationSeconds },
      });
      return mapTimeEntry(recalculated);
    }

    return mapTimeEntry(next);
  }

  async findById(id: string): Promise<TimeEntry | null> {
    if (!id) return null;
    const entity = await prisma.timeEntry.findUnique({ where: { id } });
    return entity ? mapTimeEntry(entity) : null;
  }

  async findRunningByUser(userId: string): Promise<TimeEntry | null> {
    const entity = await prisma.timeEntry.findFirst({
      where: { userId, isRunning: true, deletedAt: null },
      orderBy: { startedAt: 'desc' },
      include: {
        taskTemplate: { select: { name: true, isUntracked: true } },
        mainCategoryValue: { select: { label: true, color: true, isProductive: true, isUntracked: true } },
      },
    });
    if (!entity) return null;
    const mapped = mapTimeEntry(entity);
    mapped.isUntracked = mapped.isUntracked || entity.taskTemplate?.isUntracked === true;
    mapped.templateName = entity.taskTemplate?.name ?? null;
    mapped.mainCategoryLabel = entity.mainCategoryValue?.label ?? null;
    mapped.mainCategoryColor = entity.mainCategoryValue?.color ?? null;
    mapped.mainCategoryIsProductive = entity.mainCategoryValue?.isProductive ?? null;
    mapped.mainCategoryIsUntracked = (entity.mainCategoryValue as any)?.isUntracked ?? null;
    return mapped;
  }

  async stopEntry(entryId: string, endedAt: Date): Promise<TimeEntry> {
    const entity = await prisma.timeEntry.findFirst({
      where: { id: entryId, deletedAt: null },
    });
    if (!entity) {
      throw new Error('Time entry not found');
    }
    const durationSeconds = Math.floor((endedAt.getTime() - entity.startedAt.getTime()) / 1000);
    const saved = await prisma.timeEntry.update({
      where: { id: entryId },
      data: {
        endedAt,
        durationSeconds,
        isRunning: false,
      },
    });
    return mapTimeEntry(saved);
  }

  async softDelete(entryId: string): Promise<void> {
    await prisma.timeEntry.update({
      where: { id: entryId },
      data: { deletedAt: new Date(), isRunning: false },
    });
  }

  async findByDateRange(params: { userId: string; from: Date; to: Date }): Promise<TimeEntry[]> {
    const entities = await prisma.timeEntry.findMany({
      where: {
        userId: params.userId,
        deletedAt: null,
        startedAt: {
          gte: params.from,
          lte: params.to,
        },
      },
      orderBy: { startedAt: 'asc' },
      include: {
        taskTemplate: { select: { name: true, isUntracked: true } },
        mainCategoryValue: { select: { label: true, color: true, isProductive: true, isUntracked: true } },
        timeEntryCategory: {
          include: { categoryValue: true },
        },
      },
    });
    return entities.map((entity) => {
      const mapped = mapTimeEntry(entity);
      mapped.templateName = entity.taskTemplate?.name ?? null;
      mapped.mainCategoryLabel = entity.mainCategoryValue?.label ?? null;
      mapped.mainCategoryColor = entity.mainCategoryValue?.color ?? null;
      mapped.mainCategoryIsProductive = entity.mainCategoryValue?.isProductive ?? null;
      mapped.mainCategoryIsUntracked = (entity.mainCategoryValue as any)?.isUntracked ?? null;
      mapped.isUntracked = mapped.isUntracked || entity.taskTemplate?.isUntracked === true;
      mapped.categoryValueIds = entity.timeEntryCategory?.map((c) => c.categoryValueId) ?? [];
      mapped.categories =
        entity.timeEntryCategory
          ?.map((c) => c.categoryValue)
          .filter((c): c is NonNullable<typeof c> => Boolean(c))
          .map(mapCategoryValue) ?? [];
      return mapped;
    });
  }
}
