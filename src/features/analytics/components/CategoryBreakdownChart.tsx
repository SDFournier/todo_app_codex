import { Card } from '@/components/ui/card';
import { AnalyticsCategorySlice } from '@/infra/analytics/analyticsService';
import { formatDurationHm } from '@/lib/time/format';

type Props = {
  categories: AnalyticsCategorySlice[];
  onSelectCategory?: (id: string | null) => void;
  activeCategoryIds?: string[];
  showComparison: boolean;
};

const Delta = ({ value }: { value?: number }) => {
  if (value === undefined) return null;
  if (value === 0) return <span className="text-[11px] text-[var(--color-text-muted)]">0</span>;
  const sign = value > 0 ? '+' : '−';
  const color = value > 0 ? 'text-[var(--color-success)]' : 'text-red-600';
  return <span className={`text-[11px] ${color}`}>{`${sign}${formatDurationHm(Math.abs(value))}`}</span>;
};

export const CategoryBreakdownChart: React.FC<Props> = ({
  categories,
  onSelectCategory,
  activeCategoryIds = [],
  showComparison,
}) => {
  const top = categories.slice(0, 8);
  const totalSeconds = categories.reduce((acc, c) => acc + c.seconds, 0) || 1;

  return (
    <Card title="Time by main category">
      {top.length === 0 ? (
        <div className="text-sm text-[var(--color-text-muted)]">No categories yet.</div>
      ) : (
        <div className="space-y-2">
          {top.map((cat) => {
            const width = Math.max(6, (cat.seconds / totalSeconds) * 100);
            const active = activeCategoryIds.includes(cat.categoryId ?? '');
            return (
              <button
                key={cat.categoryId ?? cat.label}
                onClick={() => onSelectCategory?.(cat.categoryId ?? null)}
                className={`w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left transition hover:border-[var(--color-primary)] ${active ? 'ring-1 ring-[var(--color-primary)]' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[var(--color-text-main)]">{cat.label}</span>
                    <span className="text-[12px] text-[var(--color-text-muted)]">
                      {formatDurationHm(cat.seconds)} • {cat.percent}% of tracked
                    </span>
                  </div>
                  {showComparison && <Delta value={cat.deltaSeconds} />}
                </div>
                <div className="mt-2 h-2 rounded-full bg-[var(--color-border)]">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${width}%`,
                      backgroundColor: cat.color ?? 'var(--color-primary)',
                    }}
                  />
                </div>
              </button>
            );
          })}
          {categories.length > top.length && (
            <div className="text-[12px] text-[var(--color-text-muted)]">
              +{categories.length - top.length} more categories
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
