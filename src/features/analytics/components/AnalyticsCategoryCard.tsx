import { Card } from '@/components/ui/card';
import { AnalyticsCategorySlice } from '@/infra/analytics/analyticsService';
import { formatDurationHm } from '@/lib/time/format';

type Props = {
  categories: AnalyticsCategorySlice[];
  emptyLabel?: string;
};

const Delta: React.FC<{ value?: number }> = ({ value }) => {
  if (value === undefined) return null;
  if (value === 0) return <span className="text-[11px] text-[var(--color-text-muted)]">0</span>;
  const better = value < 0 ? 'text-red-600' : 'text-[var(--color-success)]';
  const sign = value > 0 ? '+' : '−';
  const abs = Math.abs(value);
  return <span className={`text-[11px] ${better}`}>{`${sign}${formatDurationHm(abs)}`}</span>;
};

export const AnalyticsCategoryCard: React.FC<Props> = ({ categories, emptyLabel = 'No categories yet' }) => {
  return (
    <Card title="Time by main category">
      {categories.length === 0 ? (
        <div className="text-sm text-[var(--color-text-muted)]">{emptyLabel}</div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.categoryId ?? cat.label}
              className="flex items-center justify-between rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[var(--color-text-main)]">{cat.label}</span>
                <span className="text-[12px] text-[var(--color-text-muted)]">{cat.percent}% of tracked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--color-text-main)]">
                  {formatDurationHm(cat.seconds)}
                </span>
                <Delta value={cat.deltaSeconds} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
