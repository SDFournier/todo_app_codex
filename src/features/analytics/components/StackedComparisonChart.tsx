import { Card } from '@/components/ui/card';
import { AnalyticsSummary } from '@/infra/analytics/analyticsService';
import { formatDurationHm } from '@/lib/time/format';

type Props = {
  summary: AnalyticsSummary;
  showComparison: boolean;
};

const segmentColor = {
  productive: 'bg-[var(--color-success)]',
  other: 'bg-gray-400',
  untracked: 'bg-[var(--color-primary)]/70',
};

const toSegments = (summary: AnalyticsSummary) => {
  const total = summary.totalSeconds || 1;
  return [
    { key: 'productive', label: 'Productive', value: summary.productiveSeconds, width: (summary.productiveSeconds / total) * 100 },
    { key: 'other', label: 'Other', value: summary.otherSeconds, width: (summary.otherSeconds / total) * 100 },
    { key: 'untracked', label: 'Untracked', value: summary.untrackedSeconds, width: (summary.untrackedSeconds / total) * 100 },
  ];
};

export const StackedComparisonChart: React.FC<Props> = ({ summary, showComparison }) => {
  const current = toSegments(summary);
  const compare = summary.compare ? toSegments(summary.compare) : null;

  return (
    <Card title="Tracked split">
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[var(--color-text-muted)]">Current period</div>
          <div className="flex h-8 overflow-hidden rounded-md border border-[var(--color-border)]">
            {current.map((seg) => (
              <div
                key={seg.key}
                className={`${segmentColor[seg.key as keyof typeof segmentColor]} text-[11px] text-white flex items-center justify-center`}
                style={{ width: `${seg.width}%` }}
                title={`${seg.label}: ${formatDurationHm(seg.value)}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
            {current.map((seg) => (
              <span key={seg.key} className="flex items-center gap-1">
                <span className={`inline-block h-3 w-3 rounded-sm ${segmentColor[seg.key as keyof typeof segmentColor]}`} />
                {seg.label} ({formatDurationHm(seg.value)})
              </span>
            ))}
          </div>
        </div>
        {showComparison && compare && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[var(--color-text-muted)]">Comparison period</div>
            <div className="flex h-8 overflow-hidden rounded-md border border-[var(--color-border)]">
              {compare.map((seg) => (
                <div
                  key={seg.key}
                  className={`${segmentColor[seg.key as keyof typeof segmentColor]} text-[11px] text-white flex items-center justify-center opacity-80`}
                  style={{ width: `${seg.width}%` }}
                  title={`${seg.label}: ${formatDurationHm(seg.value)}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
