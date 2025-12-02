import { Card } from '@/components/ui/card';
import { AnalyticsUntrackedInsight } from '@/infra/analytics/analyticsService';
import { formatDurationHm } from '@/lib/time/format';

type Props = {
  untracked: AnalyticsUntrackedInsight;
};

export const AnalyticsUntrackedCard: React.FC<Props> = ({ untracked }) => {
  return (
    <Card title="Untracked insights">
      <div className="space-y-2 text-sm text-[var(--color-text-main)]">
        <div className="flex items-center justify-between rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
          <span className="text-[13px] text-[var(--color-text-muted)]">Untracked time</span>
          <span className="text-lg font-semibold">{formatDurationHm(untracked.totalSeconds)}</span>
        </div>
        <div className="flex items-center justify-between rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
          <span className="text-[13px] text-[var(--color-text-muted)]">Share of tracked</span>
          <span className="text-lg font-semibold">{untracked.percentOfTracked}%</span>
        </div>
        {untracked.warning && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-[13px] text-yellow-800">
            High untracked time – consider adding more specific entries.
          </div>
        )}
      </div>
    </Card>
  );
};
