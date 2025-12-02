"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorPickerField } from "@/components/ui/ColorPickerField";
import { isValidHexColor, normalizeHexColor } from "@/lib/color";

type Dimension = { id: string; name: string; description?: string | null; color?: string | null };
type CategoryValue = {
  id: string;
  dimensionId: string;
  label: string;
  code?: string | null;
  color?: string | null;
  isProductive?: boolean;
  isUntracked?: boolean;
  isArchived?: boolean;
};

type StatusBanner = { tone: "success" | "error"; message: string };

const ColorDot: React.FC<{ color?: string | null; size?: "sm" | "md" }> = ({ color, size = "md" }) => {
  const sizeClass = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const showSlash = !color;
  return (
    <span
      className={`relative inline-flex ${sizeClass} items-center justify-center rounded-full border border-[var(--color-border)] bg-white`}
      style={color ? { backgroundColor: color } : undefined}
    >
      {showSlash && <span className="absolute h-[1px] w-4 rotate-45 bg-[var(--color-border)]" />}
    </span>
  );
};

export const CategoriesSettingsSection: React.FC = () => {
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  const [values, setValues] = useState<CategoryValue[]>([]);
  const [valueForm, setValueForm] = useState<{ label: string; code: string; color: string | null; isProductive: boolean }>({
    label: "",
    code: "",
    color: null,
    isProductive: false,
  });
  const [dimensionForm, setDimensionForm] = useState<{ name: string; description: string; color: string | null }>({
    name: "",
    description: "",
    color: null,
  });
  const [editingDimensionId, setEditingDimensionId] = useState<string | null>(null);
  const [dimensionEditForm, setDimensionEditForm] = useState<{ name: string; description: string; color: string | null }>({
    name: "",
    description: "",
    color: null,
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryEditForm, setCategoryEditForm] = useState<{
    label: string;
    code: string;
    color: string | null;
    dimensionId: string | null;
    isProductive: boolean;
  }>({
    label: "",
    code: "",
    color: null,
    dimensionId: null,
    isProductive: false,
  });
  const [banner, setBanner] = useState<StatusBanner | null>(null);
  const [valueLoading, setValueLoading] = useState(false);
  const [dimensionLoading, setDimensionLoading] = useState(false);

  const selectedDimensionName = useMemo(
    () => dimensions.find((d) => d.id === selectedDimension)?.name ?? "",
    [dimensions, selectedDimension],
  );
  const dimensionCountLabel = `${dimensions.length} ${dimensions.length === 1 ? "dimension" : "dimensions"}`;

  const newCategoryColorInvalid = Boolean(valueForm.color && !isValidHexColor(valueForm.color));
  const editCategoryColorInvalid = Boolean(categoryEditForm.color && !isValidHexColor(categoryEditForm.color));
  const newDimensionColorInvalid = Boolean(dimensionForm.color && !isValidHexColor(dimensionForm.color));
  const editDimensionColorInvalid = Boolean(dimensionEditForm.color && !isValidHexColor(dimensionEditForm.color));

  const loadDimensions = useCallback(async () => {
    try {
      const res = await fetch("/api/category-dimensions", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load dimensions");
      const data: Dimension[] = await res.json();
      setDimensions(data);
      if (data.length > 0) {
        setSelectedDimension((prev) => prev ?? data[0].id);
      } else {
        setSelectedDimension(null);
      }
    } catch (err: any) {
      setBanner({ tone: "error", message: err?.message ?? "Failed to load dimensions" });
    }
  }, []);

  const loadValues = useCallback(async () => {
    if (!selectedDimension) {
      setValues([]);
      return;
    }
    try {
      const res = await fetch(`/api/category-values?dimensionId=${selectedDimension}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load categories");
      const data: CategoryValue[] = await res.json();
      setValues(data);
    } catch (err: any) {
      setBanner({ tone: "error", message: err?.message ?? "Failed to load categories" });
    }
  }, [selectedDimension]);

  useEffect(() => {
    void loadDimensions();
  }, [loadDimensions]);

  useEffect(() => {
    void loadValues();
  }, [loadValues]);

  const createValue = async () => {
    if (!selectedDimension) {
      setBanner({ tone: "error", message: "Select a dimension first." });
      return;
    }
    if (!valueForm.label.trim()) {
      setBanner({ tone: "error", message: "Label is required." });
      return;
    }
    if (newCategoryColorInvalid) {
      setBanner({ tone: "error", message: "Fix the category color format (use hex like #AABBCC)." });
      return;
    }
    setValueLoading(true);
    setBanner(null);
    try {
      const res = await fetch("/api/category-values", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dimensionId: selectedDimension,
          label: valueForm.label.trim(),
          code: valueForm.code || null,
          color: normalizeHexColor(valueForm.color),
          isProductive: valueForm.isProductive,
        }),
      });
      if (!res.ok) throw new Error("Failed to create category");
      setValueForm({ label: "", code: "", color: null, isProductive: false });
      setBanner({ tone: "success", message: "Category added." });
      await loadValues();
    } catch (err: any) {
      setBanner({ tone: "error", message: err?.message ?? "Failed to create category" });
    } finally {
      setValueLoading(false);
    }
  };

  const updateCategory = async (id: string) => {
    const targetDimensionId = categoryEditForm.dimensionId || selectedDimension;
    if (!categoryEditForm.label.trim()) {
      setBanner({ tone: "error", message: "Label is required." });
      return;
    }
    if (!targetDimensionId) {
      setBanner({ tone: "error", message: "Select a dimension for this category." });
      return;
    }
    if (editCategoryColorInvalid) {
      setBanner({ tone: "error", message: "Fix the category color format (use hex like #AABBCC)." });
      return;
    }
    setValueLoading(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/category-values/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dimensionId: targetDimensionId,
          label: categoryEditForm.label.trim(),
          code: categoryEditForm.code || null,
          color: normalizeHexColor(categoryEditForm.color),
          isProductive: categoryEditForm.isProductive,
        }),
      });
      if (!res.ok) throw new Error("Failed to update category");
      const updated: CategoryValue = await res.json();
      setValues((prev) => {
        if (updated.dimensionId === selectedDimension) {
          return prev.map((v) => (v.id === id ? updated : v));
        }
        return prev.filter((v) => v.id !== id);
      });
      if (updated.dimensionId !== selectedDimension) {
        setSelectedDimension(updated.dimensionId);
      }
      setEditingCategoryId(null);
      setCategoryEditForm({ label: "", code: "", color: null, dimensionId: null, isProductive: false });
      setBanner({ tone: "success", message: "Category updated." });
    } catch (err: any) {
      setBanner({ tone: "error", message: err?.message ?? "Failed to update category" });
    } finally {
      setValueLoading(false);
    }
  };

  const createDimension = async () => {
    if (!dimensionForm.name.trim()) {
      setBanner({ tone: "error", message: "Dimension name is required." });
      return;
    }
    if (newDimensionColorInvalid) {
      setBanner({ tone: "error", message: "Fix the dimension color format (use hex like #AABBCC)." });
      return;
    }
    setDimensionLoading(true);
    setBanner(null);
    try {
      const res = await fetch("/api/category-dimensions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dimensionForm.name.trim(),
          description: dimensionForm.description || null,
          color: normalizeHexColor(dimensionForm.color),
        }),
      });
      if (!res.ok) throw new Error("Failed to create dimension");
      const created: Dimension = await res.json();
      setDimensionForm({ name: "", description: "", color: null });
      setSelectedDimension(created.id);
      setBanner({ tone: "success", message: "Dimension created." });
      await loadDimensions();
    } catch (err: any) {
      setBanner({ tone: "error", message: err?.message ?? "Failed to create dimension" });
    } finally {
      setDimensionLoading(false);
    }
  };

  const updateDimension = async (id: string) => {
    if (!dimensionEditForm.name.trim()) {
      setBanner({ tone: "error", message: "Dimension name is required." });
      return;
    }
    if (editDimensionColorInvalid) {
      setBanner({ tone: "error", message: "Fix the dimension color format (use hex like #AABBCC)." });
      return;
    }
    setDimensionLoading(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/category-dimensions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dimensionEditForm.name.trim(),
          description: dimensionEditForm.description || null,
          color: normalizeHexColor(dimensionEditForm.color),
        }),
      });
      if (!res.ok) throw new Error("Failed to update dimension");
      const updated: Dimension = await res.json();
      setDimensions((prev) => prev.map((d) => (d.id === id ? updated : d)));
      setEditingDimensionId(null);
      setDimensionEditForm({ name: "", description: "", color: null });
      setBanner({ tone: "success", message: "Dimension updated." });
    } catch (err: any) {
      setBanner({ tone: "error", message: err?.message ?? "Failed to update dimension" });
    } finally {
      setDimensionLoading(false);
    }
  };

  return (
    <Card>
      <div className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-[var(--color-text-main)]">Categories</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Create and manage your categories.</p>
        </div>

        {banner && (
          <div
            className={`rounded-md border px-3 py-2 text-sm ${
              banner.tone === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {banner.message}
          </div>
        )}

        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[var(--color-text-main)]">Dimensions</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Group related categories into axes such as domains, moods, or focus areas.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 shadow-sm lg:col-span-5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-sm font-semibold text-[var(--color-primary)]">
                  +
                </span>
                <span className="text-base font-semibold text-[var(--color-text-main)]">New dimension</span>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--color-text-muted)]">Name</label>
                  <Input
                    value={dimensionForm.name}
                    onChange={(e) => setDimensionForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. System, Wellbeing"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--color-text-muted)]">Description</label>
                  <Input
                    value={dimensionForm.description}
                    onChange={(e) => setDimensionForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Optional context"
                  />
                </div>
                <ColorPickerField
                  label="Color"
                  isOptional
                  value={dimensionForm.color}
                  onChange={(val) => setDimensionForm((f) => ({ ...f, color: val }))}
                  helperText="Hex value to visually group this dimension."
                  disabled={dimensionLoading}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={createDimension}
                    disabled={dimensionLoading || newDimensionColorInvalid || !dimensionForm.name.trim()}
                  >
                    Create dimension
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3 lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-sm font-semibold text-[var(--color-text-muted)]">Dimension</label>
                  <select
                    className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm shadow-sm"
                    value={selectedDimension ?? ""}
                    onChange={(e) => {
                      const next = e.target.value || null;
                      setSelectedDimension(next);
                    }}
                  >
                    {dimensions.length === 0 && <option value="">No dimensions yet</option>}
                    {dimensions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">{dimensionCountLabel}</span>
              </div>

              <div className="space-y-3">
                {dimensions.map((d) => {
                  const isEditing = editingDimensionId === d.id;
                  return (
                    <div
                      key={d.id}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-1 items-start gap-3">
                          <ColorDot color={d.color} />
                          <div className="space-y-0.5">
                            <div className="text-sm font-semibold text-[var(--color-text-main)]">{d.name}</div>
                            {d.description && !isEditing && (
                              <div className="text-xs text-[var(--color-text-muted)]">{d.description}</div>
                            )}
                          </div>
                        </div>
                        {!isEditing && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditingDimensionId(d.id);
                              setDimensionEditForm({
                                name: d.name,
                                description: d.description ?? "",
                                color: d.color ?? null,
                              });
                            }}
                          >
                            Edit
                          </Button>
                        )}
                      </div>

                      {isEditing && (
                        <div className="mt-3 space-y-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Name</label>
                              <Input
                                value={dimensionEditForm.name}
                                onChange={(e) => setDimensionEditForm((f) => ({ ...f, name: e.target.value }))}
                              />
                            </div>
                            <ColorPickerField
                              label="Color"
                              isOptional
                              value={dimensionEditForm.color}
                              onChange={(val) => setDimensionEditForm((f) => ({ ...f, color: val }))}
                              helperText="Hex value for this dimension"
                              disabled={dimensionLoading}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Description</label>
                            <Input
                              value={dimensionEditForm.description}
                              onChange={(e) => setDimensionEditForm((f) => ({ ...f, description: e.target.value }))}
                            />
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => void updateDimension(d.id)}
                              disabled={dimensionLoading || editDimensionColorInvalid || !dimensionEditForm.name.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                          onClick={() => {
                            setEditingDimensionId(null);
                            setDimensionEditForm({ name: "", description: "", color: null });
                          }}
                        >
                          Cancel
                        </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {dimensions.length === 0 && (
                  <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
                    No dimensions yet. Create one to start grouping categories.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-[var(--color-border)]" />

        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[var(--color-text-main)]">Category values</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Browse existing categories in a dimension, then add new ones with label, code, and color.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-semibold text-[var(--color-text-muted)]">Dimension</label>
              <select
                className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm shadow-sm"
                value={selectedDimension ?? ""}
                onChange={(e) => {
                  const next = e.target.value || null;
                  setSelectedDimension(next);
                }}
              >
                {dimensions.length === 0 && <option value="">No dimensions yet</option>}
                {dimensions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">
              {selectedDimension ? `${values.length} categories` : "Select a dimension to view categories"}
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="order-2 space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 shadow-sm lg:order-1 lg:col-span-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-sm font-semibold text-[var(--color-primary)]">
                    +
                  </span>
                  <span className="text-base font-semibold text-[var(--color-text-main)]">New category</span>
                </div>
                {selectedDimensionName && (
                  <span className="text-xs text-[var(--color-text-muted)]">For {selectedDimensionName}</span>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--color-text-muted)]">Label</label>
                  <Input
                    value={valueForm.label}
                    onChange={(e) => setValueForm((f) => ({ ...f, label: e.target.value }))}
                    placeholder="e.g. Deep work"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[var(--color-text-muted)]">Code</label>
                    <Input
                      value={valueForm.code}
                      onChange={(e) => setValueForm((f) => ({ ...f, code: e.target.value }))}
                      placeholder="Optional short code"
                    />
                  </div>
                  <ColorPickerField
                    label="Color"
                    isOptional
                    value={valueForm.color}
                    onChange={(val) => setValueForm((f) => ({ ...f, color: val }))}
                    helperText="Hex value to color this category"
                    disabled={valueLoading}
                  />
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
                  <input
                    type="checkbox"
                    checked={valueForm.isProductive}
                    onChange={(e) => setValueForm((f) => ({ ...f, isProductive: e.target.checked }))}
                  />
                  Marcar como productiva
                </label>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={createValue}
                    disabled={valueLoading || !selectedDimension || newCategoryColorInvalid || !valueForm.label.trim()}
                    className="w-full sm:w-auto"
                  >
                    Add category
                  </Button>
                </div>
              </div>
            </div>

            <div className="order-1 space-y-3 lg:order-2 lg:col-span-7">
              {values.map((v) => {
                const isEditing = editingCategoryId === v.id;
                const infoText = v.isUntracked ? "Untracked" : v.isProductive ? "Productive" : "Tracked";
                return (
                  <div
                    key={v.id}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-1 items-start gap-3">
                        <ColorDot color={v.color ?? null} />
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-[var(--color-text-main)]">{v.label}</span>
                            {v.code && <span className="text-xs text-[var(--color-text-muted)]">Code: {v.code}</span>}
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)]">
                            {infoText}
                            {v.isProductive && <span className="ml-2 rounded-full bg-[var(--color-success)]/10 px-2 py-[2px] text-[10px] font-semibold text-[var(--color-success)]">Productiva</span>}
                          </div>
                        </div>
                      </div>
                      {!isEditing && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingCategoryId(v.id);
                            setCategoryEditForm({
                              label: v.label,
                              code: v.code ?? "",
                              color: v.color ?? null,
                              dimensionId: v.dimensionId,
                              isProductive: v.isProductive ?? false,
                            });
                          }}
                        >
                          Edit
                        </Button>
                      )}
                    </div>

                    {isEditing && (
                      <div className="mt-3 space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Label</label>
                            <Input
                              value={categoryEditForm.label}
                              onChange={(e) => setCategoryEditForm((f) => ({ ...f, label: e.target.value }))}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Code</label>
                            <Input
                              value={categoryEditForm.code}
                              onChange={(e) => setCategoryEditForm((f) => ({ ...f, code: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <ColorPickerField
                            label="Color"
                            isOptional
                            value={categoryEditForm.color}
                            onChange={(val) => setCategoryEditForm((f) => ({ ...f, color: val }))}
                            helperText="Hex value for this category"
                            disabled={valueLoading}
                          />
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Dimension</label>
                            <select
                              className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm shadow-sm"
                              value={categoryEditForm.dimensionId ?? selectedDimension ?? ""}
                              onChange={(e) =>
                                setCategoryEditForm((f) => ({
                                  ...f,
                                  dimensionId: e.target.value || null,
                                }))
                              }
                              disabled={valueLoading || dimensions.length === 0}
                            >
                              {dimensions.length === 0 && <option value="">No dimensions yet</option>}
                              {dimensions.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                            <p className="text-[11px] text-[var(--color-text-muted)]">Move this category to another dimension.</p>
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
                          <input
                            type="checkbox"
                            checked={categoryEditForm.isProductive}
                            onChange={(e) => setCategoryEditForm((f) => ({ ...f, isProductive: e.target.checked }))}
                            disabled={valueLoading}
                          />
                          Marcar como productiva
                        </label>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => void updateCategory(v.id)}
                            disabled={
                              valueLoading ||
                              editCategoryColorInvalid ||
                              !categoryEditForm.label.trim() ||
                              !(categoryEditForm.dimensionId || selectedDimension)
                            }
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingCategoryId(null);
                              setCategoryEditForm({ label: "", code: "", color: null, dimensionId: null });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {values.length === 0 && (
                <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
                  {selectedDimension ? "No categories in this dimension yet." : "Select a dimension to see category values."}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </Card>
  );
};
