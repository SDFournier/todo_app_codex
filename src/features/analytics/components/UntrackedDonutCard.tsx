import { Card } from '@/components/ui/card';
import { AnalyticsUntrackedInsight } from '@/infra/analytics/analyticsService';
import { formatDurationHm } from '@/lib/time/format';

type Props = {
  untracked: AnalyticsUntrackedInsight;
  totalTracked: number;
  showComparison: boolean;
};

const Delta = ({ value }: { value?: number }) => {
  if (value === undefined) return null;
  if (value === 0) return <span className="text-[11px] text-[var(--color-text-muted)]">0</span>;
  const sign = value > 0 ? '+' : '−';
  const color = value > 0 ? 'text-red-600' : 'text-[var(--color-success)]';
  return <span className={`text-[11px] ${color}`}>{`${sign}${formatDurationHm(Math.abs(value))}`}</span>;
};

export const UntrackedDonutCard: React.FC<Props> = ({ untracked, totalTracked, showComparison }) => {
  const trackedSeconds = Math.max(0, totalTracked - untracked.totalSeconds);
  const total = trackedSeconds + untracked.totalSeconds || 1;
  const trackedPercent = Math.round((trackedSeconds / total) * 1000) / 10;

  const donutStyle = {
    background: `conic-gradient(var(--color-success) 0deg ${trackedPercent * 3.6}deg, rgba(99,102,241,0.6) ${trackedPercent * 3.6}deg 360deg)`,
  };

  return (
    <Card title="Untracked insights">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
        <div className="flex items-center justify-center">
          <div className="relative h-32 w-32 rounded-full" style={donutStyle}>
            <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-surface)] text-center text-sm font-semibold text-[var(--color-text-main)]">
              {trackedPercent}% tracked
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2 text-sm text-[var(--color-text-main)]">
          <div className="flex items-center justify-between rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
            <span className="text-[13px] text-[var(--color-text-muted)]">Untracked time</span>
            <span className="flex items-center gap-2 font-semibold">
              {formatDurationHm(untracked.totalSeconds)}
              {showComparison && <Delta value={untracked.deltaSeconds} />}
            </span>
          </div>
          <div className="flex items-center justify-between rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
            <span className="text-[13px] text-[var(--color-text-muted)]">Share of tracked</span>
            <span className="font-semibold">{untracked.percentOfTracked}%</span>
          </div>
          {untracked.warning && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-[13px] text-yellow-800">
              High untracked time – consider adding more specific entries.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
