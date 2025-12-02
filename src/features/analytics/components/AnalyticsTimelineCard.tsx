import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalyticsTimelinePoint } from '@/infra/analytics/analyticsService';
import { formatDurationHm } from '@/lib/time/format';

type Props = {
  timeline: AnalyticsTimelinePoint[];
};

export const AnalyticsTimelineCard: React.FC<Props> = ({ timeline }) => {
  const [mode, setMode] = useState<'total' | 'productive'>('total');
  const hasComparison = useMemo(
    () => timeline.some((p) => (p.compareTotalSeconds ?? 0) > 0),
    [timeline],
  );

  return (
    <Card
      title="Timeline"
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={mode === 'total' ? 'primary' : 'secondary'}
            onClick={() => setMode('total')}
          >
            Total time
          </Button>
          <Button
            size="sm"
            variant={mode === 'productive' ? 'primary' : 'secondary'}
            onClick={() => setMode('productive')}
          >
            Productive only
          </Button>
        </div>
      }
    >
      {timeline.length === 0 ? (
        <div className="text-sm text-[var(--color-text-muted)]">No data for this range.</div>
      ) : (
        <div className="overflow-hidden rounded-md border border-[var(--color-border)]">
          <div className="grid grid-cols-3 bg-[var(--color-surface)] px-3 py-2 text-[12px] font-semibold text-[var(--color-text-muted)]">
            <span>Bucket</span>
            <span className="text-right">Current</span>
            <span className="text-right">{hasComparison ? 'Comparison' : 'Productive'}</span>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {timeline.map((point) => {
              const current = mode === 'total' ? point.totalSeconds : point.productiveSeconds;
              const compare = hasComparison
                ? mode === 'total'
                  ? point.compareTotalSeconds ?? 0
                  : point.compareProductiveSeconds ?? 0
                : mode === 'total'
                  ? point.productiveSeconds
                  : undefined;
              const delta = hasComparison ? current - (compare ?? 0) : undefined;
              return (
                <div
                  key={point.label}
                  className="grid grid-cols-3 items-center px-3 py-2 text-sm text-[var(--color-text-main)]"
                >
                  <span className="truncate text-[13px] text-[var(--color-text-muted)]">{point.label}</span>
                  <span className="text-right font-semibold">{formatDurationHm(current)}</span>
                  <span className="text-right text-[13px] text-[var(--color-text-muted)]">
                    {compare !== undefined ? (
                      <>
                        {formatDurationHm(compare)}
                        {delta !== undefined && delta !== 0 && (
                          <span className={delta > 0 ? 'text-[var(--color-success)]' : 'text-red-600'}>
                            {' '}
                            {delta > 0 ? '+' : '−'}
                            {formatDurationHm(Math.abs(delta))}
                          </span>
                        )}
                      </>
                    ) : (
                      formatDurationHm(point.productiveSeconds)
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
