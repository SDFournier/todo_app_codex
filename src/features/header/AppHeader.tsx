"use client";

import React from 'react';
import { HeaderCurrentEntry } from './HeaderCurrentEntry';
import { HeaderDayProgress } from './HeaderDayProgress';
import type { HeaderData } from '@/infra/header/getHeaderData';
import { formatDurationHm } from '@/lib/time/format';
import { buildHourlyQualityBuckets, getPositiveStreaks } from '@/lib/analytics/dayInsights';
import { TopNav } from '@/features/navigation/TopNav';

type Props = {
  data: HeaderData;
};

export const AppHeader: React.FC<Props> = ({ data }) => {
  const dayElapsedLabel = formatDurationHm(data.dayElapsedSeconds);
  const now = new Date(data.nowIso);
  const streaks = getPositiveStreaks({
    entries: data.todayEntries,
    now,
    dayStart: new Date(data.dayStartIso),
  });
  const hourly = buildHourlyQualityBuckets({
    entries: data.todayEntries,
    dayStart: new Date(data.dayStartIso),
    now,
  });
  return (
    <header className="sticky top-0 z-30 bg-[var(--color-surface)]/95 backdrop-blur-sm shadow-[var(--shadow-soft)]">
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 py-1">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          <span>Current</span>
          <div className="flex flex-1 justify-end gap-4 md:flex-none md:gap-6">
            <span className="hidden md:inline">Hoy</span>
            <span className="text-[10px] md:text-[11px]">Tiempo transcurrido: {dayElapsedLabel}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[0.42fr_0.58fr]">
          <HeaderCurrentEntry entry={data.currentEntry} nowIso={data.nowIso} streaks={streaks} hourly={hourly} />
          <HeaderDayProgress
            dayStartIso={data.dayStartIso}
            nowIso={data.nowIso}
            entries={data.todayEntries}
            runningEntry={data.currentEntry ? { isUntracked: data.currentEntry.isUntracked, startedAt: data.currentEntry.startedAt } : null}
          />
        </div>
      </div>
    </header>
  );
};
