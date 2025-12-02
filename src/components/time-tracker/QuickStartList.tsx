import React from 'react';
import Link from 'next/link';
import { TaskTemplate } from '@/core/domain/taskTemplate/taskTemplate.types';
import { Card } from '@/components/ui/card';
import { QuickStartChipsRow } from '@/features/timeEntries/components/QuickStartChipsRow';

type Props = {
  templates: TaskTemplate[];
  onStartTemplate: (templateId: string) => Promise<void>;
};

export const QuickStartList: React.FC<Props> = ({ templates, onStartTemplate }) => {
  return (
    <Card
      title="Quick Start"
      actions={
        <Link href="/settings" className="text-[12px] font-semibold text-[var(--color-primary)]">
          Manage in Settings
        </Link>
      }
    >
      <div className="space-y-2">
        {templates.length === 0 && <div className="text-sm text-gray-500">No quick-start templates.</div>}
        {templates.length > 0 && (
          <QuickStartChipsRow templates={templates.slice(0, 12)} onStart={(id) => onStartTemplate(id)} />
        )}
        {templates.length > 12 && (
          <div className="text-xs text-gray-500">+ {templates.length - 12} more</div>
        )}
      </div>
    </Card>
  );
};
