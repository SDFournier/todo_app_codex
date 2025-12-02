import React, { useMemo } from 'react';
import { CategoryBadge } from './CategoryBadge';
import { useElapsedTime } from '@/hooks/useElapsedTime';
import { formatDurationHm } from '@/lib/time/format';
import { UNTRACKED_CATEGORY_COLOR, UNTRACKED_DISPLAY_TITLE } from '@/lib/untracked';
import { format } from 'date-fns';
import { PositiveStreak, HourQualityBucket } from '@/lib/analytics/dayInsights';

export type CurrentSummaryEntry = {
  id: string;
  title: string;
  startedAt: string;
  isUntracked: boolean;
  mainCategoryLabel?: string;
  mainCategoryColor?: string;
  isProductive?: boolean;
} | null;

type Props = {
  entry: CurrentSummaryEntry;
  nowIso?: string;
  streaks?: PositiveStreak[];
  hourly?: HourQualityBucket[];
};

export const CurrentHeaderSummary: React.FC<Props> = ({ entry, nowIso, streaks = [], hourly = [] }) => {
  const elapsedSeconds = useElapsedTime(entry?.startedAt);
  const nowLabel = useMemo(() => (nowIso ? format(new Date(nowIso), "EEE, MMM d \u00b7 HH:mm:ss") : null), [nowIso]);

  if (!entry) {
    return (
      <div className="flex flex-col gap-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Current</div>
        <div className="text-sm text-[var(--color-text-muted)]">Untracked</div>
      </div>
    );
  }

  const pillLabel = entry.isUntracked ? 'Untracked' : entry.mainCategoryLabel;
  const pillColor = entry.isUntracked ? UNTRACKED_CATEGORY_COLOR : entry.mainCategoryColor;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            {pillLabel && <CategoryBadge label={pillLabel} color={pillColor ?? undefined} isUntracked={entry.isUntracked} size="sm" />}
            <span className="max-w-[240px] truncate text-[15px] font-semibold text-[var(--color-text-main)] sm:max-w-[300px] md:max-w-full">
              {entry.isUntracked ? UNTRACKED_DISPLAY_TITLE : entry.title || 'Untitled entry'}
            </span>
            <span className="text-[13px] font-semibold text-[var(--color-text-muted)]">{formatDurationHm(elapsedSeconds)}</span>
          </div>
          <div className="text-[12px] text-[var(--color-text-muted)]">
            {entry.isUntracked ? 'Tracking untracked time' : 'Tracking focused activity'}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {streaks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {streaks.map((s) => (
              <div
                key={s.key}
                className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[12px] shadow-sm"
                title={`${s.label}: ${s.value}`}
              >
                <span className="text-[var(--color-text-muted)]">{s.label}</span>
                <span className="font-semibold text-[var(--color-success)]">{s.value}</span>
              </div>
            ))}
          </div>
        )}
        {hourly.length > 0 && (
          <div className="hidden space-y-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-3 py-2 shadow-sm md:block">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Racha por hora</div>
            <div className="mx-auto flex w-1/3 min-w-[120px] max-w-[160px] items-center gap-[4px] px-1">
              {hourly.map((bucket, idx) => {
                const isCurrent = idx === hourly.length - 1;
                const hasTracked = bucket.trackedSeconds > 0;
                const color = hasTracked ? "bg-[var(--color-border)]" : "bg-[var(--color-error)]/70";
                return (
                  <div
                    key={`${bucket.start.toISOString()}-${idx}`}
                    className={`h-3 min-w-[8px] flex-1 rounded-sm ${color} ${isCurrent ? "ring-[1.5px] ring-[var(--color-text-main)]" : ""}`}
                    title={`Hora ${bucket.start.toLocaleTimeString([], { hour: "2-digit" })}-${bucket.end.toLocaleTimeString([], {
                      hour: "2-digit",
                    })}: ${hasTracked ? "con actividad" : "sin actividad"}`}
                  />
                );
              })}
            </div>
          </div>
        )}
        {nowLabel && <div className="text-[12px] text-[var(--color-text-muted)]">{nowLabel}</div>}
      </div>
    </div>
  );
};
