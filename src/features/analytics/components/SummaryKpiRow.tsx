import { Card } from '@/components/ui/card';
import { AnalyticsSummary } from '@/infra/analytics/analyticsService';
import { formatDurationHm } from '@/lib/time/format';

type Props = {
  summary: AnalyticsSummary;
  showComparison: boolean;
};

const Delta = ({ value }: { value?: number }) => {
  if (value === undefined) return null;
  if (value === 0) return <span className="text-xs text-[var(--color-text-muted)]">0</span>;
  const sign = value > 0 ? '+' : '−';
  const color = value > 0 ? 'text-[var(--color-success)]' : 'text-red-600';
  return <span className={`text-xs ${color}`}>{`${sign}${formatDurationHm(Math.abs(value))}`}</span>;
};

const KpiCard: React.FC<{
  title: string;
  value: number;
  percent?: number;
  delta?: number;
  showComparison: boolean;
  accentClass?: string;
}> = ({ title, value, percent, delta, showComparison, accentClass }) => (
  <Card className="flex-1 min-w-[160px]">
    <div className="space-y-1">
      <div className="text-xs font-semibold text-[var(--color-text-muted)]">{title}</div>
      <div className={`text-2xl font-bold ${accentClass ?? 'text-[var(--color-text-main)]'}`}>
        {formatDurationHm(value)}
      </div>
      {percent !== undefined && (
        <div className="text-[12px] text-[var(--color-text-muted)]">{percent.toFixed(1)}% of tracked</div>
      )}
      {showComparison && (
        <div className="text-[12px] text-[var(--color-text-muted)]">
          vs previous: <Delta value={delta} />
        </div>
      )}
    </div>
  </Card>
);

export const SummaryKpiRow: React.FC<Props> = ({ summary, showComparison }) => {
  const total = summary.totalSeconds;
  const base = total > 0 ? 100 / total : 0;
  const compare = summary.compare;
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Total tracked"
        value={summary.totalSeconds}
        delta={compare ? summary.totalSeconds - compare.totalSeconds : undefined}
        showComparison={showComparison}
        accentClass="text-[var(--color-text-main)]"
      />
      <KpiCard
        title="Productive"
        value={summary.productiveSeconds}
        percent={summary.productiveSeconds * base}
        delta={compare ? summary.productiveSeconds - compare.productiveSeconds : undefined}
        showComparison={showComparison}
        accentClass="text-[var(--color-success)]"
      />
      <KpiCard
        title="Other"
        value={summary.otherSeconds}
        percent={summary.otherSeconds * base}
        delta={compare ? summary.otherSeconds - compare.otherSeconds : undefined}
        showComparison={showComparison}
      />
      <KpiCard
        title="Untracked"
        value={summary.untrackedSeconds}
        percent={summary.untrackedSeconds * base}
        delta={compare ? summary.untrackedSeconds - compare.untrackedSeconds : undefined}
        showComparison={showComparison}
        accentClass="text-[var(--color-text-main)]"
      />
    </div>
  );
};
