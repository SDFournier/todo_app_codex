import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  categoryOptionsByDimension: { dimensionId: string; dimensionName: string; values: { id: string; label: string }[] }[];
  onSubmit: (categoryValueIds: string[]) => Promise<void>;
};

export const AssignCategoriesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  categoryOptionsByDimension,
  onSubmit,
}) => {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await onSubmit(Object.values(selected));
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to assign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Categories">
      <div className="space-y-3">
        {categoryOptionsByDimension.map((dim) => (
          <div key={dim.dimensionId}>
            <label className="block text-xs font-semibold text-gray-700">{dim.dimensionName}</label>
            <select
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selected[dim.dimensionId] ?? ''}
              onChange={(e) => setSelected({ ...selected, [dim.dimensionId]: e.target.value })}
            >
              <option value="">None</option>
              {dim.values.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
