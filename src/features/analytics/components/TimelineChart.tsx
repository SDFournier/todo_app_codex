import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalyticsTimelinePoint } from '@/infra/analytics/analyticsService';
import { formatDurationHm } from '@/lib/time/format';

type Props = {
  timeline: AnalyticsTimelinePoint[];
};

type Series = { key: 'total' | 'productive'; label: string; color: string; getter: (p: AnalyticsTimelinePoint) => number };

export const TimelineChart: React.FC<Props> = ({ timeline }) => {
  const [mode, setMode] = useState<'total' | 'productive'>('total');

  const series: Series[] = useMemo(
    () => [
      { key: 'total', label: 'Total', color: 'var(--color-primary)', getter: (p) => p.totalSeconds },
      { key: 'productive', label: 'Productive', color: 'var(--color-success)', getter: (p) => p.productiveSeconds },
    ],
    [],
  );

  const currentSeries = series.filter((s) => (mode === 'productive' ? s.key === 'productive' : true));
  const maxValue = Math.max(
    ...timeline.flatMap((p) => currentSeries.map((s) => s.getter(p))),
    1,
  );

  const width = Math.max(280, timeline.length * 32);
  const height = 180;
  const xStep = width / Math.max(timeline.length - 1, 1);

  const toPoint = (idx: number, val: number) => {
    const x = idx * xStep;
    const y = height - (val / maxValue) * (height - 30);
    return `${x},${y}`;
  };

  return (
    <Card
      title="Timeline"
      actions={
        <div className="flex items-center gap-2">
          <Button size="sm" variant={mode === 'total' ? 'primary' : 'secondary'} onClick={() => setMode('total')}>
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
        <div className="overflow-x-auto">
          <svg width={width} height={height} className="bg-[var(--color-surface)]">
            <g transform="translate(40,10)">
              {currentSeries.map((s) => (
                <polyline
                  key={s.key}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  points={timeline.map((p, idx) => toPoint(idx, s.getter(p))).join(' ')}
                  opacity={s.key === 'total' ? 0.9 : 0.7}
                />
              ))}
              {timeline.map((p, idx) => {
                const x = idx * xStep;
                return (
                  <g key={p.label}>
                    <text x={x} y={height - 5} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)">
                      {p.label}
                    </text>
                    <line x1={x} x2={x} y1={height - 35} y2={height - 40} stroke="var(--color-border)" />
                  </g>
                );
              })}
            </g>
          </svg>
          <div className="flex flex-wrap gap-3 px-2 text-[12px] text-[var(--color-text-muted)]">
            {currentSeries.map((s) => (
              <span key={s.key} className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
          <div className="mt-2 grid gap-1 text-[12px] text-[var(--color-text-muted)]">
            {timeline.map((p) => (
              <div key={`legend-${p.label}`} className="flex items-center justify-between">
                <span className="truncate">{p.label}</span>
                <span className="flex items-center gap-2">
                  <span>Total: {formatDurationHm(p.totalSeconds)}</span>
                  <span className="text-[var(--color-success)]">Prod: {formatDurationHm(p.productiveSeconds)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
