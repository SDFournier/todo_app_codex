import React, { useState } from 'react';
import { CategoryDimension } from '../../core/domain/categoryDimension/categoryDimension.types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { DimensionForm } from './DimensionForm';

type Props = {
  dimensions: CategoryDimension[];
  onCreate: (values: { name: string; description?: string | null; sortOrder?: number }) => Promise<void>;
};

export const DimensionsList: React.FC<Props> = ({ dimensions, onCreate }) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <Card
      title="Category Dimensions"
      actions={
        <Button size="sm" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Close' : 'Add'}
        </Button>
      }
    >
      {showForm && (
        <div className="mb-4 rounded-md border border-gray-200 p-3">
          <DimensionForm
            onSubmit={async (values) => {
              await onCreate(values);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
      <div className="space-y-2">
        {dimensions.length === 0 && <div className="text-sm text-gray-500">No dimensions yet.</div>}
        {dimensions.map((d) => (
          <div key={d.id} className="rounded border border-gray-100 px-3 py-2">
            <div className="text-sm font-medium text-gray-900">{d.name}</div>
            {d.description && <div className="text-xs text-gray-600">{d.description}</div>}
          </div>
        ))}
      </div>
    </Card>
  );
};
