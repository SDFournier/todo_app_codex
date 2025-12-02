import React, { useState } from 'react';
import { z } from 'zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { CategoryDimension } from '../../core/domain/categoryDimension/categoryDimension.types';

const schema = z.object({
  name: z.string().min(1).max(191),
  description: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

type Props = {
  initial?: Partial<CategoryDimension>;
  onSubmit: (values: z.infer<typeof schema>) => Promise<void>;
  onCancel?: () => void;
};

export const DimensionForm: React.FC<Props> = ({ initial, onSubmit, onCancel }) => {
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    sortOrder: initial?.sortOrder ?? 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(parsed.data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div>
        <label className="block text-xs font-semibold text-gray-700">Name</label>
        <Input
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700">Description</label>
        <Input
          value={values.description ?? ''}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700">Sort order</label>
        <Input
          type="number"
          value={values.sortOrder}
          onChange={(e) => setValues({ ...values, sortOrder: Number(e.target.value) })}
        />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
