import React from 'react';
import { TimeEntry } from '@/core/domain/timeEntry/timeEntry.types';
import { TaskTemplate } from '@/core/domain/taskTemplate/taskTemplate.types';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from './CategoryBadge';
import { TemplateColorDot } from './TemplateColorDot';
import { useElapsedTime } from '@/hooks/useElapsedTime';
import { formatDurationHm } from '@/lib/time/format';
import { getTemplateDisplayName } from '@/lib/display/templates';
import { UNTRACKED_CATEGORY_COLOR, UNTRACKED_DISPLAY_TITLE, isEntryUntracked } from '@/lib/untracked';

type Props = {
  entry: TimeEntry | null;
  pausedEntry?: TimeEntry | null;
  quickStarts?: TaskTemplate[];
  isLoading?: boolean;
  onPause: (entry: TimeEntry) => Promise<void>;
  onStop: () => Promise<void>;
  onResume: (entry: TimeEntry) => Promise<void>;
  onStartFromInput: () => void | Promise<void>;
  onChooseQuickStarts?: () => void;
};

const EntryTitle: React.FC<{ entry: TimeEntry; template?: TaskTemplate }> = ({ entry, template }) => {
  const title = entry.isUntracked ? UNTRACKED_DISPLAY_TITLE : getTemplateDisplayName({ ...entry, taskTemplate: template });
  return <span className="text-base font-semibold text-[var(--color-text-main)]">{title}</span>;
};

export const RunningStatusCard: React.FC<Props> = ({
  entry,
  pausedEntry,
  quickStarts = [],
  isLoading = false,
  onPause,
  onStop,
  onResume,
  onStartFromInput,
  onChooseQuickStarts,
}) => {
  const elapsedSeconds = useElapsedTime(entry?.startedAt);
  const isUntracked = !entry || isEntryUntracked(entry);

  if (isUntracked) {
    const primaryAction = () => void onStartFromInput();

    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary-soft)]/70 via-white to-white p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between gap-3">
          <CategoryBadge label="UNTRACKED TIME" isUntracked size="sm" className="tracking-wide" />
          <div className="text-2xl font-bold text-[var(--color-text-main)]">{formatDurationHm(elapsedSeconds)}</div>
        </div>
        <div className="mt-2 space-y-1 text-sm text-[var(--color-text-muted)]">
          <div>You don’t have a specific activity selected.</div>
          <div>All time is being tracked as “Untracked”.</div>
        </div>
        {pausedEntry && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
            <div className="flex flex-col">
              <span className="font-semibold text-[var(--color-text-main)]">
                Paused: {getTemplateDisplayName(pausedEntry)}
              </span>
              <span className="text-[11px]">Resume to continue or start something new.</span>
            </div>
            <Button size="sm" variant="secondary" disabled={isLoading} onClick={() => onResume(pausedEntry)}>
              Resume
            </Button>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button disabled={isLoading} onClick={primaryAction}>
            Start a new activity
          </Button>
          <Button
            variant="secondary"
            disabled={isLoading || quickStarts.length === 0}
            onClick={() => onChooseQuickStarts?.()}
          >
            Choose from quick tasks
          </Button>
        </div>
      </div>
    );
  }

  const mainColor = entry.mainCategoryColor ?? UNTRACKED_CATEGORY_COLOR;
  const startedLabel = entry.startedAt
    ? new Date(entry.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {entry.mainCategoryLabel && (
              <CategoryBadge label={entry.mainCategoryLabel} color={mainColor} size="sm" />
            )}
            <TemplateColorDot color={entry.mainCategoryColor} />
            <EntryTitle entry={entry} />
          </div>
          <div className="text-[12px] text-[var(--color-text-muted)]">
            Running • Started {startedLabel}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="text-3xl font-bold leading-none text-[var(--color-text-main)]">
            {formatDurationHm(elapsedSeconds)}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="secondary" disabled={isLoading} onClick={() => onPause(entry)}>
              Pause
            </Button>
            <Button variant="danger" disabled={isLoading} onClick={onStop}>
              Stop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
