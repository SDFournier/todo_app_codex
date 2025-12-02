import { Card } from '@/components/ui/card';
import { AnalyticsSummary } from '@/infra/analytics/analyticsService';
import { formatDurationHm } from '@/lib/time/format';

type Props = {
  summary: AnalyticsSummary;
  periodLabel: string;
  comparisonLabel?: string;
};

const Delta: React.FC<{ value?: number; betterWhenHigher?: boolean }> = ({ value, betterWhenHigher = true }) => {
  if (value === undefined) return null;
  const sign = value === 0 ? '' : value > 0 ? '+' : '−';
  const abs = Math.abs(value);
  const isBetter = betterWhenHigher ? value > 0 : value < 0;
  const color = isBetter ? 'text-[var(--color-success)]' : 'text-red-600';
  return <span className={`text-xs ${color}`}>{`${sign}${formatDurationHm(abs)}`}</span>;
};

export const AnalyticsSummaryCard: React.FC<Props> = ({ summary, periodLabel, comparisonLabel }) => {
  const deltaTotal = summary.compare ? summary.totalSeconds - summary.compare.totalSeconds : undefined;
  const deltaProductive = summary.compare ? summary.productiveSeconds - summary.compare.productiveSeconds : undefined;
  const deltaOther = summary.compare ? summary.otherSeconds - summary.compare.otherSeconds : undefined;
  const deltaUntracked = summary.compare ? summary.untrackedSeconds - summary.compare.untrackedSeconds : undefined;

  return (
    <Card title="Summary">
      <div className="space-y-2 text-sm text-[var(--color-text-main)]">
        <div className="flex items-center justify-between text-[13px] text-[var(--color-text-muted)]">
          <span>{periodLabel}</span>
          {comparisonLabel && <span className="text-[var(--color-text-muted)]">vs {comparisonLabel}</span>}
        </div>
        <div className="flex items-center justify-between rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
          <span className="font-semibold">Total tracked</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[var(--color-text-main)]">{formatDurationHm(summary.totalSeconds)}</span>
            <Delta value={deltaTotal} betterWhenHigher />
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[var(--color-text-muted)]">Productive</span>
              <Delta value={deltaProductive} betterWhenHigher />
            </div>
            <div className="text-lg font-semibold text-[var(--color-success)]">
              {formatDurationHm(summary.productiveSeconds)}
            </div>
          </div>
          <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[var(--color-text-muted)]">Other</span>
              <Delta value={deltaOther} betterWhenHigher={false} />
            </div>
            <div className="text-lg font-semibold text-[var(--color-text-main)]">
              {formatDurationHm(summary.otherSeconds)}
            </div>
          </div>
          <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[var(--color-text-muted)]">Untracked</span>
              <Delta value={deltaUntracked} betterWhenHigher={false} />
            </div>
            <div className="text-lg font-semibold text-[var(--color-text-main)]">
              {formatDurationHm(summary.untrackedSeconds)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
