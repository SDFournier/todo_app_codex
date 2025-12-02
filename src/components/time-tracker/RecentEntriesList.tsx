import React, { useState } from 'react';
import { TimeEntry } from '@/core/domain/timeEntry/timeEntry.types';
import { CategoryValue } from '@/core/domain/categoryValue/categoryValue.types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateRange, formatDurationHm } from '@/lib/time/format';
import { CategoryBadge } from '@/features/timeEntries/components/CategoryBadge';
import { TemplateColorDot } from '@/features/timeEntries/components/TemplateColorDot';
import { UNTRACKED_DISPLAY_TITLE } from '@/lib/untracked';

type EnrichedCategory = CategoryValue & { dimensionName?: string };

type UpdatePayload = {
  titleOverride?: string | null;
  mainCategoryValueId?: string | null;
  categoryValueIds?: string[];
};

type Props = {
  entries: TimeEntry[];
  onUpdate: (entryId: string, updates: UpdatePayload) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
  onPromoteQuickStart?: (entry: TimeEntry) => Promise<void>;
};

export const RecentEntriesList: React.FC<Props> = ({ entries, onUpdate, onDelete, onPromoteQuickStart }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftMainCategoryId, setDraftMainCategoryId] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<EnrichedCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const ensureCategoryOptions = async (): Promise<EnrichedCategory[]> => {
    if (categoryOptions.length) return categoryOptions;
    setLoadingCategories(true);
    setCategoryError(null);
    try {
      const dimRes = await fetch('/api/category-dimensions', { cache: 'no-store' });
      if (!dimRes.ok) {
        throw new Error('Failed to load category dimensions');
      }
      const dims: { id: string; name: string }[] = await dimRes.json();
      const collected: EnrichedCategory[] = [];
      for (const dim of dims) {
        const valsRes = await fetch(`/api/category-values?dimensionId=${dim.id}`, { cache: 'no-store' });
        if (!valsRes.ok) {
          throw new Error('Failed to load category values');
        }
        const values: CategoryValue[] = await valsRes.json();
        values.forEach((v) => collected.push({ ...v, dimensionName: dim.name }));
      }
      setCategoryOptions(collected);
      return collected;
    } catch (err: any) {
      setCategoryError(err?.message ?? 'Failed to load categories');
      return [];
    } finally {
      setLoadingCategories(false);
    }
  };

  const startEditing = (entry: TimeEntry) => {
    setRowError(null);
    setCategoryError(null);
    setDraftTitle(entry.titleOverride ?? entry.templateName ?? '');
    setDraftMainCategoryId(entry.mainCategoryValueId ?? null);
    const seed = new Set<string>([...(entry.categoryValueIds ?? []), ...(entry.mainCategoryValueId ? [entry.mainCategoryValueId] : [])]);
    setSelectedCategoryIds(seed);
    setEditingId(entry.id);
    void ensureCategoryOptions();
  };

  const resetEditing = () => {
    setEditingId(null);
    setSavingId(null);
    setRowError(null);
    setCategoryError(null);
    setSelectedCategoryIds(new Set());
  };

  const handleMainCategoryChange = (valueId: string) => {
    const nextId = valueId || null;
    setDraftMainCategoryId(nextId);
    if (valueId) {
      setSelectedCategoryIds((prev) => new Set([...prev, valueId]));
    }
  };

  const buildPayload = (): UpdatePayload => {
    const trimmedTitle = draftTitle.trim();
    const categoryIds = new Set<string>(selectedCategoryIds);
    if (draftMainCategoryId) categoryIds.add(draftMainCategoryId);
    return {
      titleOverride: trimmedTitle ? trimmedTitle : null,
      mainCategoryValueId: draftMainCategoryId ?? null,
      categoryValueIds: Array.from(categoryIds),
    };
  };

  const handleSave = async (entry: TimeEntry) => {
    setRowError(null);
    setSavingId(entry.id);
    try {
      await onUpdate(entry.id, buildPayload());
      resetEditing();
    } catch (err: any) {
      setRowError(err?.message ?? 'Failed to save changes');
    } finally {
      setSavingId(null);
    }
  };

  const renderCategories = (entry: TimeEntry) => {
    if (!entry.categories || entry.categories.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 text-[11px] text-[var(--color-text-muted)]">
        {entry.categories.map((cat) => (
          <span
            key={cat.id}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-[2px]"
          >
            {cat.label}
          </span>
        ))}
      </div>
    );
  };

  const renderEditor = (entry: TimeEntry) => {
    const isSaving = savingId === entry.id;
    const sortedCategories = [...categoryOptions].sort((a, b) => {
      const dimCompare = (a.dimensionName ?? '').localeCompare(b.dimensionName ?? '');
      if (dimCompare !== 0) return dimCompare;
      return a.label.localeCompare(b.label);
    });
    return (
      <div className="mt-2 space-y-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--color-text-muted)]">Name</label>
          <Input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="Add a short title"
            disabled={isSaving}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Main category</label>
            <select
              className="w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
              value={draftMainCategoryId ?? ''}
              onChange={(e) => handleMainCategoryChange(e.target.value)}
              disabled={loadingCategories || isSaving}
            >
              <option value="">None</option>
              {sortedCategories.map((val) => (
                <option key={val.id} value={val.id}>
                  {val.label}
                  {val.dimensionName ? ` (${val.dimensionName})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Categories</label>
            {loadingCategories && <div className="text-xs text-[var(--color-text-muted)]">Loading categories…</div>}
            {!loadingCategories && categoryOptions.length === 0 && (
              <div className="text-xs text-[var(--color-text-muted)]">No categories found.</div>
            )}
            {!loadingCategories && categoryOptions.length > 0 && (
              <div className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto rounded border border-[var(--color-border)] bg-white px-3 py-2 text-sm">
                {sortedCategories.map((cat) => {
                  const checked = selectedCategoryIds.has(cat.id);
                  return (
                    <label key={cat.id} className="flex items-center gap-2 text-[13px] text-[var(--color-text-main)]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[var(--color-border)]"
                        checked={checked}
                        disabled={isSaving}
                        onChange={(e) => {
                          setSelectedCategoryIds((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(cat.id);
                            else next.delete(cat.id);
                            return next;
                          });
                        }}
                      />
                      <span className="flex-1 truncate">
                        {cat.label}
                        {cat.dimensionName ? ` (${cat.dimensionName})` : ''}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {categoryError && <div className="text-xs text-red-600">{categoryError}</div>}
        {rowError && <div className="text-xs text-red-600">{rowError}</div>}
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={resetEditing} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => void handleSave(entry)} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card title="Recent Entries">
      <div className="space-y-3">
        {entries.length === 0 && <div className="text-sm text-gray-500">No recent entries.</div>}
        {entries.map((e, idx) => {
          const isEditing = editingId === e.id;
          const disableActions = Boolean(editingId && editingId !== e.id);
          return (
            <div
              key={e.id}
              className={`flex flex-col gap-2 border-t border-[var(--color-border)] pt-3 ${idx === 0 ? 'border-0 pt-0' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {e.mainCategoryLabel && (
                    <CategoryBadge
                      label={e.mainCategoryLabel}
                      color={e.mainCategoryColor ?? undefined}
                      isUntracked={e.isUntracked}
                      size="sm"
                    />
                  )}
                  <TemplateColorDot color={e.mainCategoryColor} />
                  <div className="text-sm font-semibold text-gray-900">
                    {e.isUntracked ? UNTRACKED_DISPLAY_TITLE : e.titleOverride || e.templateName || 'Untitled'}
                  </div>
                </div>
                {e.durationSeconds != null && (
                  <span className="text-sm font-semibold text-[var(--color-success)]">
                    {formatDurationHm(e.durationSeconds)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{formatDateRange(e.startedAt, e.endedAt)}</span>
                    {e.isRunning && <Badge color="blue">Running</Badge>}
                    {e.isUntracked && <Badge color="gray">Untracked</Badge>}
                  </div>
                  {renderCategories(e)}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => startEditing(e)} disabled={disableActions}>
                    {isEditing ? 'Editing' : 'Edit'}
                  </Button>
                  {onPromoteQuickStart && e.taskTemplateId && (
                    <Button variant="ghost" size="sm" onClick={() => onPromoteQuickStart(e)} disabled={disableActions}>
                      Promote
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => onDelete(e.id)} disabled={disableActions}>
                    Delete
                  </Button>
                </div>
              </div>
              {isEditing && renderEditor(e)}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
