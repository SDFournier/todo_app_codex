import { Card } from '@/components/ui/card';
import { AnalyticsTemplateStat } from '@/infra/analytics/analyticsService';
import { formatDurationHm } from '@/lib/time/format';

type Props = {
  templates: AnalyticsTemplateStat[];
};

const Delta: React.FC<{ value?: number }> = ({ value }) => {
  if (value === undefined) return null;
  if (value === 0) return <span className="text-[11px] text-[var(--color-text-muted)]">0</span>;
  const sign = value > 0 ? '+' : '−';
  const color = value > 0 ? 'text-[var(--color-success)]' : 'text-red-600';
  return <span className={`text-[11px] ${color}`}>{`${sign}${formatDurationHm(Math.abs(value))}`}</span>;
};

export const AnalyticsTemplatesCard: React.FC<Props> = ({ templates }) => {
  return (
    <Card title="Top templates">
      {templates.length === 0 ? (
        <div className="text-sm text-[var(--color-text-muted)]">No templates for this period.</div>
      ) : (
        <div className="divide-y divide-[var(--color-border)] rounded-md border border-[var(--color-border)]">
          <div className="grid grid-cols-3 bg-[var(--color-surface)] px-3 py-2 text-[12px] font-semibold text-[var(--color-text-muted)]">
            <span>Template</span>
            <span className="text-right">Time</span>
            <span className="text-right">Entries</span>
          </div>
          {templates.map((tpl) => (
            <div key={tpl.templateId ?? tpl.name} className="grid grid-cols-3 px-3 py-2 text-sm">
              <span className="truncate text-[var(--color-text-main)]">{tpl.name}</span>
              <span className="flex items-center justify-end gap-2 font-semibold text-[var(--color-text-main)]">
                {formatDurationHm(tpl.seconds)}
                <Delta value={tpl.deltaSeconds} />
              </span>
              <span className="text-right text-[var(--color-text-main)]">{tpl.entryCount}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
