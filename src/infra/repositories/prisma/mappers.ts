import type {
  User as PrismaUser,
  TaskTemplate as PrismaTaskTemplate,
  TimeEntry as PrismaTimeEntry,
  CategoryDimension as PrismaCategoryDimension,
  CategoryValue as PrismaCategoryValue,
} from '@prisma/client';
import { TimeEntry } from '@/core/domain/timeEntry/timeEntry.types';
import { TaskTemplate } from '@/core/domain/taskTemplate/taskTemplate.types';
import { User } from '@/core/domain/user/user.types';
import { CategoryDimension } from '@/core/domain/categoryDimension/categoryDimension.types';
import { CategoryValue } from '@/core/domain/categoryValue/categoryValue.types';

export const mapUser = (u: PrismaUser): User => ({
  id: u.id,
  email: u.email,
  displayName: u.displayName,
  timezone: u.timezone,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

export const mapTaskTemplate = (
  t: PrismaTaskTemplate & {
    taskTemplateCategory?: { categoryValue: PrismaCategoryValue; categoryValueId: string }[];
    mainCategoryValue?: PrismaCategoryValue | null;
  },
): TaskTemplate => ({
  id: t.id,
  userId: t.userId,
  name: t.name,
  description: t.description,
  isQuickStart: t.isQuickStart,
  isArchived: t.isArchived,
  isSystem: (t as PrismaTaskTemplate).isSystem ?? false,
  isUntracked: (t as PrismaTaskTemplate).isUntracked ?? false,
  defaultDurationEstimateMinutes: t.defaultDurationEstimateMinutes,
  colorHex: (t as PrismaTaskTemplate).colorHex ?? null,
  mainCategoryValueId: t.mainCategoryValueId ?? null,
  mainCategoryValue: t.mainCategoryValue ? mapCategoryValue(t.mainCategoryValue) : null,
  categoryValueIds: t.taskTemplateCategory?.map((c) => c.categoryValueId) ?? [],
  categories: t.taskTemplateCategory?.map((c) => mapCategoryValue(c.categoryValue)) ?? [],
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
});

export const mapTimeEntry = (e: PrismaTimeEntry): TimeEntry => ({
  id: e.id,
  userId: e.userId,
  taskTemplateId: e.taskTemplateId ?? null,
  mainCategoryValueId: e.mainCategoryValueId ?? null,
  titleOverride: e.titleOverride ?? null,
  notes: e.notes ?? null,
  startedAt: e.startedAt,
  endedAt: e.endedAt ?? null,
  durationSeconds: e.durationSeconds ?? null,
  isRunning: e.isRunning,
  isUntracked: (e as PrismaTimeEntry).isUntracked ?? false,
  deletedAt: e.deletedAt ?? null,
  localDate: e.localDate ?? undefined,
  year: e.year ?? null,
  month: e.month ?? null,
  weekOfYear: e.weekOfYear ?? null,
  dayOfWeek: e.dayOfWeek ?? null,
  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
});

export const mapCategoryDimension = (
  d: PrismaCategoryDimension,
): CategoryDimension => ({
  id: d.id,
  userId: d.userId,
  name: d.name,
  description: d.description,
  color: (d as PrismaCategoryDimension & { color?: string | null }).color ?? null,
  isSystem: d.isSystem,
  sortOrder: d.sortOrder,
  createdAt: d.createdAt,
  updatedAt: d.updatedAt,
});

export const mapCategoryValue = (v: PrismaCategoryValue): CategoryValue => ({
  id: v.id,
  userId: v.userId,
  dimensionId: v.dimensionId,
  parentId: v.parentId,
  label: v.label,
  code: v.code,
  color: v.color,
  isProductive: v.isProductive,
  isUntracked: (v as PrismaCategoryValue).isUntracked ?? false,
  metaTags: v.metaTags as unknown,
  isArchived: v.isArchived,
  sortOrder: v.sortOrder,
  createdAt: v.createdAt,
  updatedAt: v.updatedAt,
});
