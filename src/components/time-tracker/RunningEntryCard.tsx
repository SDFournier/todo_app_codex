import React, { useEffect, useState } from 'react';
import { TimeEntry } from '@/core/domain/timeEntry/timeEntry.types';
import { TaskTemplate } from '@/core/domain/taskTemplate/taskTemplate.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTimeShort, formatDurationShort } from '@/lib/time/format';

type Props = {
  entry: TimeEntry | null;
  pausedEntry?: TimeEntry | null;
  onStart: () => Promise<void>;
  onPause: (entry: TimeEntry) => Promise<void>;
  onStop: () => Promise<void>;
  onResume: (entry: TimeEntry) => Promise<void>;
  quickStarts?: TaskTemplate[];
  onQuickStart?: (templateId: string) => Promise<void>;
  className?: string;
};

export const RunningEntryCard: React.FC<Props> = ({
  entry,
  pausedEntry,
  onStart,
  onPause,
  onStop,
  onResume,
  quickStarts = [],
  onQuickStart,
  className,
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!entry || entry.endedAt) return;
    const start = entry.startedAt ? new Date(entry.startedAt).getTime() : Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [entry]);

  return (
    <Card
      title="Running"
      actions={
        entry ? (
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => onPause(entry)}>
              Pause
            </Button>
            <Button variant="danger" onClick={onStop}>
              Stop
            </Button>
          </div>
        ) : pausedEntry ? (
          <div className="flex items-center gap-2">
            <Button onClick={() => onResume(pausedEntry)}>Resume</Button>
            <Button variant="secondary" onClick={onStart}>
              Start a new timer
            </Button>
          </div>
        ) : (
          <Button onClick={onStart}>Start a new timer</Button>
        )
      }
      className={className}
    >
      {entry ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {entry.mainCategoryLabel && (
              <span
                className="rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]"
                style={entry.mainCategoryColor ? { backgroundColor: entry.mainCategoryColor, color: '#0f172a' } : undefined}
              >
                {entry.mainCategoryLabel}
              </span>
            )}
            <div className="text-sm text-gray-700">
              {entry.titleOverride || entry.templateName || 'Untitled entry'}
            </div>
          </div>
          <div className="text-lg font-semibold text-gray-900">{formatDurationShort(elapsed)}</div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <Badge>Running</Badge>
            <span>Started {formatDateTimeShort(entry.startedAt)}</span>
          </div>
        </div>
      ) : pausedEntry ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-700">Paused: {pausedEntry.titleOverride || pausedEntry.taskTemplateId || 'Untitled'}</div>
          <div className="text-sm text-gray-500">Resume to continue tracking or start a new timer.</div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <Badge color="gray">Paused</Badge>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-sm text-gray-500">
          <div>No running entry.</div>
          {quickStarts.length > 0 && onQuickStart && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <span>Start quickly with:</span>
              {quickStarts.slice(0, 6).map((tpl) => (
                <button
                  key={tpl.id}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-primary-soft)] px-2 py-1 text-[var(--color-text-main)] transition hover:border-[var(--color-primary)]"
                  onClick={() => onQuickStart(tpl.id)}
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
