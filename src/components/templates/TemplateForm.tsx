import React, { useState } from 'react';
import { z } from 'zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { TaskTemplate } from '../../core/domain/taskTemplate/taskTemplate.types';

const schema = z.object({
  name: z.string().min(1).max(191),
  description: z.string().nullable().optional(),
  isQuickStart: z.boolean().optional(),
  defaultDurationEstimateMinutes: z.coerce.number().int().positive().nullable().optional(),
});

type Props = {
  initial?: Partial<TaskTemplate>;
  onSubmit: (values: z.infer<typeof schema>) => Promise<void>;
  onCancel?: () => void;
};

export const TemplateForm: React.FC<Props> = ({ initial, onSubmit, onCancel }) => {
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    isQuickStart: initial?.isQuickStart ?? false,
    defaultDurationEstimateMinutes: initial?.defaultDurationEstimateMinutes ?? null,
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
        <Input value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} required />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700">Description</label>
        <Input
          value={values.description ?? ''}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700">Default duration (minutes)</label>
        <Input
          type="number"
          value={values.defaultDurationEstimateMinutes ?? ''}
          onChange={(e) =>
            setValues({
              ...values,
              defaultDurationEstimateMinutes: e.target.value ? Number(e.target.value) : null,
            })
          }
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="isQuickStart"
          type="checkbox"
          checked={values.isQuickStart}
          onChange={(e) => setValues({ ...values, isQuickStart: e.target.checked })}
        />
        <label htmlFor="isQuickStart" className="text-xs text-gray-700">
          Quick start
        </label>
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
