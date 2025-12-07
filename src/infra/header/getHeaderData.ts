import { prisma } from '@/infra/db/prismaClient';
import { format, startOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { ensureRunningEntry, getUntrackedDisplayTitle } from '@/infra/untracked/untrackedService';

export type DayProgressSummary = {
  date: string;
  totalTrackedSeconds: number;
  productiveTrackedSeconds: number;
  otherTrackedSeconds: number;
  untrackedSeconds: number;
  productiveGoalSeconds: number;
  entryCount: number;
};

export type TodayEntrySummary = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  isUntracked: boolean;
  isProductive: boolean;
  mainCategoryLabel?: string | null;
  mainCategoryColor?: string | null;
};

export type HeaderData = {
  currentEntry: {
    id: string;
    title: string;
    startedAt: string;
    isUntracked: boolean;
    mainCategoryLabel?: string;
    mainCategoryColor?: string;
    isProductive: boolean;
  } | null;
  nowIso: string;
  dayProgress: DayProgressSummary;
  dayStartIso: string;
  dayElapsedSeconds: number;
  todayEntries: TodayEntrySummary[];
};

const DEFAULT_PRODUCTIVE_GOAL_SECONDS = 6 * 3600;

const computeDurationSeconds = (startedAt: Date, endedAt: Date | null, now: Date) => {
  const end = endedAt ?? now;
  return Math.max(0, Math.floor((end.getTime() - startedAt.getTime()) / 1000));
};

const isEntryProductive = (params: {
  mainCategoryIsProductive?: boolean;
  categoriesIsProductive: boolean[];
}) => {
  if (params.mainCategoryIsProductive) return true;
  return params.categoriesIsProductive.some(Boolean);
};

export const getHeaderDataForUser = async (userId: string): Promise<HeaderData> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
  const timezone = user?.timezone || process.env.APP_TIMEZONE || 'UTC';

  const nowUtc = new Date();
  const now = toZonedTime(nowUtc, timezone);

  const ensuredRunning = await ensureRunningEntry(userId);

  // Current running entry with categories
  const running = await prisma.timeEntry.findUnique({
    where: { id: ensuredRunning.id },
    include: {
      mainCategoryValue: true,
      timeEntryCategory: { include: { categoryValue: true } },
      taskTemplate: { select: { name: true, isUntracked: true } },
    },
  });

  const currentEntry =
    running != null
      ? (() => {
          const isUntracked = running.isUntracked || running.taskTemplate?.isUntracked === true;
          const isProductive = !isUntracked
            && isEntryProductive({
              mainCategoryIsProductive: running.mainCategoryValue?.isProductive,
              categoriesIsProductive: running.timeEntryCategory.map((c) => c.categoryValue?.isProductive ?? false),
            });

          return {
            id: running.id,
            title:
              running.titleOverride ||
              (isUntracked ? getUntrackedDisplayTitle() : running.taskTemplate?.name) ||
              running.taskTemplateId ||
              'Untitled',
            startedAt: running.startedAt.toISOString(),
            mainCategoryLabel: running.mainCategoryValue?.label ?? undefined,
            mainCategoryColor: running.mainCategoryValue?.color ?? undefined,
            isUntracked,
            isProductive,
          };
        })()
      : null;

  // Today window in the user's timezone
  const startOfDayZoned = startOfDay(now);
  const endOfDayZoned = new Date(startOfDayZoned);
  endOfDayZoned.setHours(23, 59, 59, 999);
  const startOfDayUtc = fromZonedTime(startOfDayZoned, timezone);
  const endOfDayUtc = fromZonedTime(endOfDayZoned, timezone);

  const todayEntries = await prisma.timeEntry.findMany({
    where: {
      userId,
      deletedAt: null,
      startedAt: { gte: startOfDayUtc, lte: endOfDayUtc },
    },
    include: {
      mainCategoryValue: true,
      timeEntryCategory: { include: { categoryValue: true } },
      taskTemplate: { select: { isUntracked: true } },
    },
  });

  let totalTrackedSeconds = 0;
  let productiveTrackedSeconds = 0;
  let untrackedSeconds = 0;
  let otherTrackedSeconds = 0;
  const todayEntrySummaries: TodayEntrySummary[] = [];

  for (const entry of todayEntries) {
    const isUntracked = entry.isUntracked || entry.taskTemplate?.isUntracked === true;
    const productive = isEntryProductive({
      mainCategoryIsProductive: entry.mainCategoryValue?.isProductive,
      categoriesIsProductive: entry.timeEntryCategory.map((c) => c.categoryValue?.isProductive ?? false),
    });
    const duration = computeDurationSeconds(entry.startedAt, entry.endedAt, now);
    totalTrackedSeconds += duration;
    if (isUntracked) {
      untrackedSeconds += duration;
    } else if (productive) {
      productiveTrackedSeconds += duration;
    } else {
      otherTrackedSeconds += duration;
    }
    todayEntrySummaries.push({
      id: entry.id,
      startedAt: entry.startedAt.toISOString(),
      endedAt: entry.endedAt ? entry.endedAt.toISOString() : null,
      durationSeconds: duration,
      isUntracked,
      isProductive: productive,
      mainCategoryLabel: entry.mainCategoryValue?.label ?? null,
      mainCategoryColor: entry.mainCategoryValue?.color ?? null,
    });
  }

  const dayElapsedSeconds = Math.max(0, Math.floor((now.getTime() - startOfDayZoned.getTime()) / 1000));

  const dayProgress: DayProgressSummary = {
    date: format(startOfDayZoned, 'yyyy-MM-dd'),
    totalTrackedSeconds,
    productiveTrackedSeconds,
    otherTrackedSeconds,
    untrackedSeconds,
    productiveGoalSeconds: DEFAULT_PRODUCTIVE_GOAL_SECONDS,
    entryCount: todayEntries.length,
  };

  return {
    currentEntry,
    nowIso: now.toISOString(),
    dayProgress,
    dayStartIso: startOfDayUtc.toISOString(),
    dayElapsedSeconds,
    todayEntries: todayEntrySummaries,
  };
};
