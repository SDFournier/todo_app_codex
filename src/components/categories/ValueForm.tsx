import React, { useState } from 'react';
import { z } from 'zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { CategoryValue } from '../../core/domain/categoryValue/categoryValue.types';

const schema = z.object({
  parentId: z.string().uuid().nullable().optional(),
  label: z.string().min(1).max(191),
  code: z.string().max(50).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

type Props = {
  initial?: Partial<CategoryValue>;
  onSubmit: (values: z.infer<typeof schema>) => Promise<void>;
  onCancel?: () => void;
  parentOptions?: { id: string; label: string }[];
};

export const ValueForm: React.FC<Props> = ({ initial, onSubmit, onCancel, parentOptions = [] }) => {
  const [values, setValues] = useState({
    parentId: initial?.parentId ?? null,
    label: initial?.label ?? '',
    code: initial?.code ?? '',
    color: initial?.color ?? '',
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
        <label className="block text-xs font-semibold text-gray-700">Label</label>
        <Input value={values.label} onChange={(e) => setValues({ ...values, label: e.target.value })} required />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700">Parent</label>
        <select
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={values.parentId ?? ''}
          onChange={(e) => setValues({ ...values, parentId: e.target.value || null })}
        >
          <option value="">None</option>
          {parentOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-700">Code</label>
          <Input value={values.code ?? ''} onChange={(e) => setValues({ ...values, code: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700">Color</label>
          <Input value={values.color ?? ''} onChange={(e) => setValues({ ...values, color: e.target.value })} />
        </div>
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
