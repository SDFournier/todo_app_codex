import React, { useState } from 'react';
import { CategoryValue } from '../../core/domain/categoryValue/categoryValue.types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ValueForm } from './ValueForm';

type Props = {
  values: CategoryValue[];
  onCreate: (values: {
    parentId?: string | null;
    label: string;
    code?: string | null;
    color?: string | null;
    sortOrder?: number;
  }) => Promise<void>;
  onUpdate: (id: string, values: Partial<CategoryValue>) => Promise<void>;
};

export const ValuesList: React.FC<Props> = ({ values, onCreate, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const parentOptions = values.map((v) => ({ id: v.id, label: v.label }));
  const editing = editingId ? values.find((v) => v.id === editingId) : null;

  return (
    <Card
      title="Values"
      actions={
        <Button size="sm" onClick={() => { setShowForm((prev) => !prev); setEditingId(null); }}>
          {showForm ? 'Close' : 'Add'}
        </Button>
      }
    >
      {showForm && (
        <div className="mb-4 rounded-md border border-gray-200 p-3">
          <ValueForm
            parentOptions={parentOptions}
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
          <ValueForm
            initial={editing}
            parentOptions={parentOptions.filter((p) => p.id !== editing.id)}
            onSubmit={async (vals) => {
              await onUpdate(editing.id, vals);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      <div className="space-y-2">
        {values.length === 0 && <div className="text-sm text-gray-500">No values yet.</div>}
        {values.map((v) => (
          <div key={v.id} className="flex items-center justify-between rounded border border-gray-100 px-3 py-2">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium text-gray-900">{v.label}</div>
              <div className="text-xs text-gray-600">
                {v.code && <span className="mr-2">Code: {v.code}</span>}
                {v.color && <span className="mr-2">Color: {v.color}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {v.isArchived && <Badge color="red">Archived</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setEditingId(v.id); setShowForm(false); }}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdate(v.id, { isArchived: !v.isArchived })}
              >
                {v.isArchived ? 'Unarchive' : 'Archive'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
