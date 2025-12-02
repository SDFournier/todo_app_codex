import React from 'react';
import { TaskTemplate } from '@/core/domain/taskTemplate/taskTemplate.types';
import { TemplateColorDot } from './TemplateColorDot';
import { getTemplateColor } from '@/lib/display/templates';

type Props = {
  templates: TaskTemplate[];
  onStart: (templateId: string) => void | Promise<void>;
  dense?: boolean;
};

export const QuickStartChipsRow: React.FC<Props> = ({ templates, onStart, dense = false }) => {
  if (templates.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {templates.map((tpl) => {
        const color = getTemplateColor(tpl, tpl.mainCategoryValue ?? null);
        return (
          <button
            key={tpl.id}
            className={`inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 font-medium text-[var(--color-text-main)] transition hover:border-[var(--color-primary)] ${
              dense ? 'py-1 text-xs' : 'py-2 text-sm'
            }`}
            style={{ boxShadow: `inset 0 0 0 1px ${color}20`, backgroundColor: '#fff' }}
            onClick={() => {
              void onStart(tpl.id);
            }}
          >
            <TemplateColorDot color={color} />
            <span>{tpl.name}</span>
          </button>
        );
      })}
    </div>
  );
};
