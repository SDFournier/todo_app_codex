import React, { useState } from 'react';
import { TaskTemplate } from '../../core/domain/taskTemplate/taskTemplate.types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TemplateForm } from './TemplateForm';

type Props = {
  templates: TaskTemplate[];
  onCreate: (values: {
    name: string;
    description?: string | null;
    isQuickStart?: boolean;
    defaultDurationEstimateMinutes?: number | null;
  }) => Promise<void>;
  onUpdate: (id: string, values: Partial<TaskTemplate>) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onAssignCategories: (id: string) => void;
};

export const TemplateList: React.FC<Props> = ({
  templates,
  onCreate,
  onUpdate,
  onArchive,
  onAssignCategories,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editing = editingId ? templates.find((t) => t.id === editingId) : null;

  return (
    <Card
      title="Task Templates"
      actions={
        <Button size="sm" onClick={() => { setShowForm((prev) => !prev); setEditingId(null); }}>
          {showForm ? 'Close' : 'Add'}
        </Button>
      }
    >
      {showForm && (
        <div className="mb-4 rounded-md border border-gray-200 p-3">
          <TemplateForm
            onSubmit={async (vals) => {
              await onCreate(vals);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
      {editing && (
        <div className="mb-4 rounded-md border border-gray-200 p-3">
          <TemplateForm
            initial={editing}
            onSubmit={async (vals) => {
              await onUpdate(editing.id, vals);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}
      <div className="space-y-2">
        {templates.length === 0 && <div className="text-sm text-gray-500">No templates yet.</div>}
        {templates.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded border border-gray-100 px-3 py-2">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium text-gray-900">{t.name}</div>
              {t.description && <div className="text-xs text-gray-600">{t.description}</div>}
              <div className="flex flex-wrap gap-2">
                {t.isQuickStart && <Badge color="blue">Quick start</Badge>}
                {t.isArchived && <Badge color="red">Archived</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setEditingId(t.id); setShowForm(false); }}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onAssignCategories(t.id)}>
                Categories
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onArchive(t.id)}>
                Archive
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
