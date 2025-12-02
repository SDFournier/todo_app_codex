"use client";

import React, { useMemo, useRef, useState } from "react";
import { useTemplates } from "@/hooks/useTemplates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorPickerField } from "@/components/ui/ColorPickerField";
import { Badge } from "@/components/ui/badge";
import { TaskTemplate } from "@/core/domain/taskTemplate/taskTemplate.types";
import { CategoryValue } from "@/core/domain/categoryValue/categoryValue.types";
import { CategoriesSettingsSection } from "./CategoriesSettingsSection";
import { FALLBACK_TEMPLATE_COLOR, getTemplateColor } from "@/lib/display/templates";

type TabKey = "templates" | "goals" | "categories" | "untracked";

const tabs: { key: TabKey; label: string }[] = [
  { key: "templates", label: "Templates" },
  { key: "goals", label: "Goals" },
  { key: "categories", label: "Categories" },
  { key: "untracked", label: "Untracked (coming soon)" },
];

const ColorDot: React.FC<{ color: string }> = ({ color }) => (
  <span
    className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[var(--color-border)]"
    style={{ backgroundColor: color }}
  />
);

const TemplatePreview: React.FC<{ name: string; mainCategory?: CategoryValue | null; color: string }> = ({
  name,
  mainCategory,
  color,
}) => {
  return (
    <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm shadow-sm">
      <ColorDot color={color} />
      <div className="flex flex-col">
        <span className="font-semibold text-[var(--color-text-main)]">{name || "Nombre de plantilla"}</span>
        {mainCategory && <span className="text-xs text-[var(--color-text-muted)]">{mainCategory.label}</span>}
        {!mainCategory && <span className="text-xs text-[var(--color-text-muted)]">Selecciona una categoría principal</span>}
      </div>
    </div>
  );
};

const TemplatesSection: React.FC = () => {
  const { templates, refresh, loading } = useTemplates();
  const [showArchived, setShowArchived] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<CategoryValue[]>([]);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [formErrors, setFormErrors] = useState<{ name?: string; mainCategory?: string }>({});
  const [form, setForm] = useState<{
    id?: string;
    name: string;
    description: string;
    isQuickStart: boolean;
    categoryValueIds: string[];
    mainCategoryValueId: string | null;
    colorHex: string | null;
    useMainCategoryColor: boolean;
  }>({
    name: "",
    description: "",
    isQuickStart: false,
    categoryValueIds: [],
    mainCategoryValueId: null,
    colorHex: null,
    useMainCategoryColor: true,
  });
  const filtered = useMemo(() => templates.filter((t) => showArchived || !t.isArchived), [templates, showArchived]);

  React.useEffect(() => {
    const loadCategories = async () => {
      const dimsRes = await fetch("/api/category-dimensions", { cache: "no-store" });
      if (!dimsRes.ok) return;
      const dims: { id: string; name: string }[] = await dimsRes.json();
      const valuesArrays = await Promise.all(
        dims.map((d) =>
          fetch(`/api/category-values?dimensionId=${d.id}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
        ),
      );
      setAvailableCategories(valuesArrays.flat());
    };
    void loadCategories();
  }, []);

  const mainCategory = useMemo(
    () => availableCategories.find((c) => c.id === form.mainCategoryValueId) ?? null,
    [availableCategories, form.mainCategoryValueId],
  );
  const previewColor = form.useMainCategoryColor
    ? mainCategory?.color ?? FALLBACK_TEMPLATE_COLOR
    : form.colorHex ?? FALLBACK_TEMPLATE_COLOR;
  const canCreate = Boolean(form.name.trim() && form.mainCategoryValueId);

  const exampleTemplates = useMemo(() => {
    if (availableCategories.length === 0) return [];
    const first = availableCategories[0];
    const second = availableCategories[1] ?? first;
    const third = availableCategories[2] ?? first;
    return [
      { name: "Trabajo profundo 90min", mainCategoryId: first.id, colorHex: first.color ?? "#6C5CE7" },
      { name: "Ejercicio", mainCategoryId: second.id, colorHex: second.color ?? "#22c55e" },
      { name: "Rutina matutina", mainCategoryId: third.id, colorHex: third.color ?? "#f59e0b" },
    ];
  }, [availableCategories]);

  const saveTemplate = async () => {
    const errors: { name?: string; mainCategory?: string } = {};
    if (!form.name.trim()) errors.name = "El nombre es obligatorio.";
    if (!form.mainCategoryValueId) errors.mainCategory = "Selecciona una categoría principal.";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      if (errors.name) {
        nameInputRef.current?.focus();
      }
      return;
    }
    const categoryValueIds = Array.from(
      new Set([...(form.categoryValueIds ?? []), form.mainCategoryValueId ?? ""].filter(Boolean)),
    );
    const payload = {
      name: form.name,
      description: form.description || null,
      isQuickStart: form.isQuickStart,
      categoryValueIds,
      mainCategoryValueId: form.mainCategoryValueId,
      colorHex: form.useMainCategoryColor ? null : form.colorHex,
    };
    const res = await fetch(form.id ? `/api/task-templates/${form.id}` : "/api/task-templates", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save template");
    setForm({
      name: "",
      description: "",
      isQuickStart: false,
      categoryValueIds: [],
      mainCategoryValueId: null,
      colorHex: null,
      useMainCategoryColor: true,
    });
    setFormErrors({});
    refresh();
  };

  const toggleQuickStart = async (tpl: TaskTemplate, isQuickStart: boolean) => {
    await fetch(`/api/task-templates/${tpl.id}/quick-start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isQuickStart }),
    });
    refresh();
  };

  const toggleArchive = async (tpl: TaskTemplate, archive: boolean) => {
    await fetch(`/api/task-templates/${tpl.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: archive }),
    });
    refresh();
  };

  return (
    <div className="space-y-4">
      <Card title="Templates">
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Crea una plantilla</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Separa la información en bloques para elegir categoría principal, categorías adicionales, colores y comportamiento.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[var(--color-text-main)]">Información básica</h3>
                <span className="text-xs text-[var(--color-text-muted)]">Requerida</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--color-text-muted)]">Nombre</label>
                  <Input
                    ref={nameInputRef}
                    value={form.name}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, name: e.target.value }));
                      setFormErrors((errs) => ({ ...errs, name: undefined }));
                    }}
                    placeholder="p.ej. Trabajo profundo"
                  />
                  {formErrors.name && <span className="text-[11px] text-[var(--color-error)]">{formErrors.name}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--color-text-muted)]">Categoría principal</label>
                  <select
                    className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm shadow-sm"
                    value={form.mainCategoryValueId ?? ""}
                    onChange={(e) => {
                      const val = e.target.value || null;
                      setForm((f) => {
                        const nextCategories = val
                          ? Array.from(new Set([...(f.categoryValueIds ?? []), val]))
                          : f.categoryValueIds;
                        return { ...f, mainCategoryValueId: val, categoryValueIds: nextCategories };
                      });
                      setFormErrors((errs) => ({ ...errs, mainCategory: undefined }));
                    }}
                  >
                    <option value="">Selecciona</option>
                    {availableCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.mainCategory && (
                    <span className="text-[11px] text-[var(--color-error)]">{formErrors.mainCategory}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--color-text-muted)]">Descripción (opcional)</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Añade contexto o duración estimada"
                />
              </div>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
              <h3 className="text-base font-semibold text-[var(--color-text-main)]">Previsualización</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Color y categoría principal como se verá en listas.</p>
              <div className="mt-3">
                <TemplatePreview name={form.name} mainCategory={mainCategory} color={previewColor} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--color-text-main)]">Categorías adicionales (opcional)</h3>
              <span className="text-xs text-[var(--color-text-muted)]">Añade etiquetas secundarias</span>
            </div>
            {availableCategories.length === 0 && (
              <div className="text-xs text-[var(--color-text-muted)]">Crea categorías primero en la pestaña Categorías.</div>
            )}
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-1 rounded border border-[var(--color-border)] px-2 py-1 text-xs shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.categoryValueIds.includes(c.id)}
                    onChange={(e) => {
                      setForm((f) => {
                        const next = e.target.checked
                          ? Array.from(new Set([...f.categoryValueIds, c.id]))
                          : f.categoryValueIds.filter((id) => id !== c.id);
                        const withMain =
                          f.mainCategoryValueId && !next.includes(f.mainCategoryValueId)
                            ? [...next, f.mainCategoryValueId]
                            : next;
                        return { ...f, categoryValueIds: Array.from(new Set(withMain)) };
                      });
                    }}
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">
              La categoría principal siempre se incluye; no verás duplicados aunque la selecciones aquí.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[var(--color-text-main)]">Apariencia (color)</h3>
                <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <input
                    type="checkbox"
                    checked={form.useMainCategoryColor}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        useMainCategoryColor: e.target.checked,
                        colorHex: e.target.checked ? null : f.colorHex,
                      }))
                    }
                  />
                  Usar color de categoría principal
                </label>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Si no eliges un color, la plantilla tomará el color de su categoría principal.
              </p>
              <div className="mt-3 max-w-md">
                <ColorPickerField
                  label="Color personalizado"
                  value={form.colorHex}
                  onChange={(val) =>
                    setForm((f) => ({
                      ...f,
                      colorHex: val,
                      useMainCategoryColor: false,
                    }))
                  }
                  helperText="Introduce un HEX o elige en el selector."
                  disabled={form.useMainCategoryColor}
                  onDisabledClick={() => setForm((f) => ({ ...f, useMainCategoryColor: false }))}
                />
              </div>
            </div>

            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
              <h3 className="text-base font-semibold text-[var(--color-text-main)]">Comportamiento</h3>
              <div className="mt-2 flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.isQuickStart}
                  onChange={(e) => setForm((f) => ({ ...f, isQuickStart: e.target.checked }))}
                />
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-[var(--color-text-main)]">Quick Start</span>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Las plantillas Quick Start aparecen en Home para iniciarlas con un clic.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={saveTemplate} disabled={loading || !canCreate}>
              {form.id ? "Actualizar" : "Crear"}
            </Button>
            {form.id && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  {
                    setFormErrors({});
                    setForm({
                      name: "",
                      description: "",
                      isQuickStart: false,
                      categoryValueIds: [],
                      mainCategoryValueId: null,
                      colorHex: null,
                      useMainCategoryColor: true,
                    });
                  }
                }
              >
                Cancelar edición
              </Button>
            )}
            {!canCreate && (
              <span className="text-xs text-[var(--color-text-muted)]">
                Completa el nombre y la categoría principal para crear.
              </span>
            )}
          </div>
        </div>
      </Card>

      <Card title="Template list">
        <div className="flex items-center justify-between pb-2">
          <label className="text-xs text-[var(--color-text-muted)]">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="mr-2" />
            Mostrar archivados
          </label>
          {loading && <span className="text-xs text-[var(--color-text-muted)]">Cargando...</span>}
        </div>
        <div className="space-y-2">
          {filtered.map((tpl) => (
            <div
              key={tpl.id}
              className="flex items-center justify-between rounded border border-[var(--color-border)] px-3 py-2"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <ColorDot color={getTemplateColor(tpl, tpl.mainCategoryValue ?? null)} />
                  <div className="text-sm font-semibold text-[var(--color-text-main)]">{tpl.name}</div>
                  {tpl.isQuickStart && <Badge color="blue">Quick Start</Badge>}
                </div>
                {tpl.mainCategoryValue && (
                  <div className="text-xs text-[var(--color-text-muted)]">Principal: {tpl.mainCategoryValue.label}</div>
                )}
                {tpl.description && <div className="text-xs text-[var(--color-text-muted)]">{tpl.description}</div>}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    {
                      setFormErrors({});
                      setForm({
                        id: tpl.id,
                        name: tpl.name,
                        description: tpl.description ?? "",
                        isQuickStart: tpl.isQuickStart,
                        categoryValueIds:
                          tpl.mainCategoryValueId && !(tpl.categoryValueIds ?? []).includes(tpl.mainCategoryValueId)
                            ? Array.from(new Set([...(tpl.categoryValueIds ?? []), tpl.mainCategoryValueId]))
                            : tpl.categoryValueIds ?? [],
                        mainCategoryValueId: tpl.mainCategoryValueId ?? null,
                        colorHex: tpl.colorHex ?? null,
                        useMainCategoryColor: !tpl.colorHex,
                      });
                    }
                  }
                >
                  Editar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleQuickStart(tpl, !tpl.isQuickStart)}>
                  {tpl.isQuickStart ? "Desfijar" : "Fijar"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleArchive(tpl, !tpl.isArchived)}>
                  {tpl.isArchived ? "Desarchivar" : "Archivar"}
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="space-y-3 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
              <div>
                Las plantillas guardan actividades recurrentes (ej. “Trabajo profundo”, “Ejercicio”, “Rutina matutina”) para iniciarlas rápido.
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => nameInputRef.current?.focus()}>
                  Crea tu primera plantilla
                </Button>
                {exampleTemplates.length > 0 &&
                  exampleTemplates.map((ex) => (
                    <button
                      key={ex.name}
                      className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-medium text-[var(--color-text-main)] shadow-sm hover:border-[var(--color-primary)]"
                      onClick={() =>
                        {
                          setFormErrors({});
                          setForm((f) => ({
                            ...f,
                            name: ex.name,
                            description: "",
                            mainCategoryValueId: ex.mainCategoryId,
                            categoryValueIds: Array.from(new Set([ex.mainCategoryId])),
                            colorHex: ex.colorHex,
                            useMainCategoryColor: false,
                            isQuickStart: f.isQuickStart,
                          }));
                          nameInputRef.current?.focus();
                        }
                      }
                    >
                      {ex.name}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const GoalsSection: React.FC = () => {
  const [goalMinutes, setGoalMinutes] = useState<number>(() => {
    if (typeof window === "undefined") return 360;
    const stored = localStorage.getItem("dailyFocusGoalMinutes");
    return stored ? Number(stored) : 360;
  });

  const save = () => {
    localStorage.setItem("dailyFocusGoalMinutes", String(goalMinutes));
  };

  return (
    <Card title="Daily focus goal">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          className="w-24 rounded border border-[var(--color-border)] px-2 py-1 text-sm"
          value={goalMinutes}
          onChange={(e) => setGoalMinutes(Number(e.target.value))}
        />
        <span className="text-sm text-[var(--color-text-muted)]">minutes per day</span>
        <Button size="sm" onClick={save}>Save</Button>
      </div>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        This is a local setting for now; header and analytics will use this when wired to backend config.
      </p>
    </Card>
  );
};

const PlaceholderCard: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <Card title={title}>
    <div className="text-sm text-[var(--color-text-muted)]">{body}</div>
  </Card>
);

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("templates");

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded px-3 py-1 text-sm font-medium ${
                tab === t.key
                  ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)]"
                  : "bg-[var(--color-primary-soft)] text-[var(--color-text-main)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "templates" && <TemplatesSection />}
        {tab === "goals" && <GoalsSection />}
        {tab === "categories" && (
          <CategoriesSettingsSection />
        )}
        {tab === "untracked" && (
          <PlaceholderCard title="Untracked / Free time" body="Configure how Untracked time behaves and which category represents it. Not implemented yet." />
        )}
      </div>
    </main>
  );
}
