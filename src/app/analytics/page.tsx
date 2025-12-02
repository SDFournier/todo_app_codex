"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useTaskTemplates } from "@/hooks/useTaskTemplates";
import { AnalyticsResponse, ComparisonMode, PeriodPreset } from "@/features/analytics/types";
import { SummaryKpiRow } from "@/features/analytics/components/SummaryKpiRow";
import { StackedComparisonChart } from "@/features/analytics/components/StackedComparisonChart";
import { CategoryBreakdownChart } from "@/features/analytics/components/CategoryBreakdownChart";
import { UntrackedDonutCard } from "@/features/analytics/components/UntrackedDonutCard";
import { TimelineChart } from "@/features/analytics/components/TimelineChart";
import { CategoryValue } from "@/core/domain/categoryValue/categoryValue.types";
import { CategoryDimension } from "@/core/domain/categoryDimension/categoryDimension.types";

type DateRange = { from: Date; to: Date; resolution: "hour" | "day" | "month" };

type FiltersState = {
  categoryValueIds: string[];
  mainCategoryIds: string[];
  dimensionIds: string[];
  templateIds: string[];
  includeUntracked: boolean;
};

type CategoryOption = CategoryValue & { dimensionName?: string };

const startOfDay = (d: Date) => {
  const next = new Date(d);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (d: Date) => {
  const next = new Date(d);
  next.setHours(23, 59, 59, 999);
  return next;
};

const rangeFromPreset = (preset: PeriodPreset): { range: DateRange; label: string } => {
  const now = new Date();
  if (preset === "today") {
    const from = startOfDay(now);
    const to = endOfDay(now);
    return { range: { from, to, resolution: "hour" }, label: "Today" };
  }
  if (preset === "week") {
    const day = now.getDay() || 7;
    const from = startOfDay(new Date(now));
    from.setDate(now.getDate() - (day - 1));
    const to = endOfDay(new Date(from));
    to.setDate(from.getDate() + 6);
    return { range: { from, to, resolution: "day" }, label: "This week" };
  }
  if (preset === "month") {
    const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    const to = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    return { range: { from, to, resolution: "day" }, label: "This month" };
  }
  if (preset === "year") {
    const from = startOfDay(new Date(now.getFullYear(), 0, 1));
    const to = endOfDay(new Date(now.getFullYear(), 11, 31));
    return { range: { from, to, resolution: "month" }, label: "This year" };
  }
  const from = startOfDay(now);
  const to = endOfDay(now);
  return { range: { from, to, resolution: "day" }, label: "Custom" };
};

const toIso = (d: Date) => d.toISOString();

const formatRangeLabel = (range: DateRange) =>
  `${range.from.toLocaleDateString()} – ${range.to.toLocaleDateString()}`;

const computeComparisonRange = (
  base: DateRange,
  mode: ComparisonMode,
  customFrom?: string,
  customTo?: string,
): { range: DateRange; label: string } | null => {
  if (mode === "none") return null;
  if (mode === "custom" && customFrom && customTo) {
    const from = startOfDay(new Date(`${customFrom}T00:00:00`));
    const to = endOfDay(new Date(`${customTo}T00:00:00`));
    return { range: { from, to, resolution: base.resolution }, label: formatRangeLabel({ from, to, resolution: base.resolution }) };
  }
  if (mode === "last-year") {
    const from = new Date(base.from);
    from.setFullYear(from.getFullYear() - 1);
    const to = new Date(base.to);
    to.setFullYear(to.getFullYear() - 1);
    return { range: { from, to, resolution: base.resolution }, label: "Same period last year" };
  }
  // previous period
  const lengthMs = base.to.getTime() - base.from.getTime();
  const compareTo = new Date(base.from.getTime() - 1);
  const compareFrom = new Date(compareTo.getTime() - lengthMs);
  return { range: { from: compareFrom, to: compareTo, resolution: base.resolution }, label: "Previous period" };
};

export default function AnalyticsPage() {
  const [preset, setPreset] = useState<PeriodPreset>("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("previous");
  const [compareCustomFrom, setCompareCustomFrom] = useState("");
  const [compareCustomTo, setCompareCustomTo] = useState("");
  const [filters, setFilters] = useState<FiltersState>({
    categoryValueIds: [],
    mainCategoryIds: [],
    dimensionIds: [],
    templateIds: [],
    includeUntracked: true,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [dimensions, setDimensions] = useState<CategoryDimension[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [report, setReport] = useState<AnalyticsResponse["report"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { templates } = useTaskTemplates();

  const baseRange = useMemo(() => {
    if (preset === "custom" && customFrom && customTo) {
      const from = startOfDay(new Date(`${customFrom}T00:00:00`));
      const to = endOfDay(new Date(`${customTo}T00:00:00`));
      return { range: { from, to, resolution: "day" as const }, label: formatRangeLabel({ from, to, resolution: "day" }) };
    }
    return rangeFromPreset(preset);
  }, [preset, customFrom, customTo]);

  const comparisonRange = useMemo(
    () => computeComparisonRange(baseRange.range, comparisonMode, compareCustomFrom, compareCustomTo),
    [baseRange, comparisonMode, compareCustomFrom, compareCustomTo],
  );

  const fetchAnalytics = async () => {
    if (preset === "custom" && (!customFrom || !customTo)) return;
    if (comparisonMode === "custom" && (!compareCustomFrom || !compareCustomTo)) return;
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        range: {
          from: toIso(baseRange.range.from),
          to: toIso(baseRange.range.to),
          resolution: baseRange.range.resolution,
        },
        filters,
      };
      if (comparisonRange) {
        payload.compareRange = {
          from: toIso(comparisonRange.range.from),
          to: toIso(comparisonRange.range.to),
          resolution: comparisonRange.range.resolution,
        };
      }
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load analytics");
      }
      const json: AnalyticsResponse = await res.json();
      setReport(json.report);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, customFrom, customTo, comparisonMode, compareCustomFrom, compareCustomTo, filters]);

  const loadCategories = async () => {
    if (loadingCategories) return;
    setLoadingCategories(true);
    try {
      const dimRes = await fetch("/api/category-dimensions");
      const dims: CategoryDimension[] = dimRes.ok ? await dimRes.json() : [];
      setDimensions(dims);
      const collected: CategoryOption[] = [];
      for (const dim of dims) {
        const valsRes = await fetch(`/api/category-values?dimensionId=${dim.id}`);
        if (!valsRes.ok) continue;
        const vals: CategoryValue[] = await valsRes.json();
        vals.forEach((v) => collected.push({ ...v, dimensionName: dim.name }));
      }
      setCategories(collected);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const activeFilterChips = [
    ...filters.mainCategoryIds.map((id) => {
      const cat = categories.find((c) => c.id === id);
      return { id: `main-${id}`, label: cat ? `Main: ${cat.label}` : `Main: ${id}` };
    }),
    ...filters.categoryValueIds.map((id) => {
      const cat = categories.find((c) => c.id === id);
      return { id: `cat-${id}`, label: cat ? `${cat.label}${cat.dimensionName ? ` (${cat.dimensionName})` : ""}` : id };
    }),
    ...filters.dimensionIds.map((id) => {
      const dim = dimensions.find((d) => d.id === id);
      return { id: `dim-${id}`, label: dim ? `Dim: ${dim.name}` : id };
    }),
    ...filters.templateIds.map((id) => {
      const tpl = templates.find((t) => t.id === id);
      return { id: `tpl-${id}`, label: tpl?.name ?? id };
    }),
    filters.includeUntracked === false ? { id: "untracked-off", label: "Exclude untracked" } : null,
  ].filter(Boolean) as { id: string; label: string }[];

  const toggleCategoryFilter = (id: string | null) => {
    if (!id) return;
    setFilters((prev) => {
      const next = new Set(prev.mainCategoryIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, mainCategoryIds: Array.from(next) };
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--color-background)] via-white to-[var(--color-primary-soft)] px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Card>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {(["today", "week", "month", "year"] as PeriodPreset[]).map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={preset === p ? "primary" : "secondary"}
                    onClick={() => setPreset(p)}
                  >
                    {p === "today" ? "Today" : p === "week" ? "This week" : p === "month" ? "This month" : "This year"}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant={preset === "custom" ? "primary" : "secondary"}
                  onClick={() => setPreset("custom")}
                >
                  Custom
                </Button>
              </div>
              {preset === "custom" && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <label className="text-[13px] text-[var(--color-text-muted)]">From</label>
                  <input
                    type="date"
                    className="rounded border border-[var(--color-border)] px-2 py-1 text-sm"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                  <label className="text-[13px] text-[var(--color-text-muted)]">To</label>
                  <input
                    type="date"
                    className="rounded border border-[var(--color-border)] px-2 py-1 text-sm"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-[13px] text-[var(--color-text-muted)]">Comparison</label>
                <select
                  className="rounded border border-[var(--color-border)] px-3 py-2 text-sm"
                  value={comparisonMode}
                  onChange={(e) => setComparisonMode(e.target.value as ComparisonMode)}
                >
                  <option value="none">No comparison</option>
                  <option value="previous">vs previous period</option>
                  <option value="last-year">vs same period last year</option>
                  <option value="custom">Custom period (TODO)</option>
                </select>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setShowFilters(true);
                    void loadCategories();
                  }}
                >
                  Filters
                </Button>
              </div>
              {comparisonMode === "custom" && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <label className="text-[13px] text-[var(--color-text-muted)]">From</label>
                  <input
                    type="date"
                    className="rounded border border-[var(--color-border)] px-2 py-1 text-sm"
                    value={compareCustomFrom}
                    onChange={(e) => setCompareCustomFrom(e.target.value)}
                  />
                  <label className="text-[13px] text-[var(--color-text-muted)]">To</label>
                  <input
                    type="date"
                    className="rounded border border-[var(--color-border)] px-2 py-1 text-sm"
                    value={compareCustomTo}
                    onChange={(e) => setCompareCustomTo(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilterChips.map((chip) => (
              <Badge key={chip.id} color="gray">
                <span className="mr-1">{chip.label}</span>
                <button
                  className="text-[11px] text-[var(--color-text-muted)]"
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      categoryValueIds: prev.categoryValueIds.filter((id) => `cat-${id}` !== chip.id),
                      mainCategoryIds: prev.mainCategoryIds.filter((id) => `main-${id}` !== chip.id),
                      dimensionIds: prev.dimensionIds.filter((id) => `dim-${id}` !== chip.id),
                      templateIds: prev.templateIds.filter((id) => `tpl-${id}` !== chip.id),
                      includeUntracked: chip.id === "untracked-off" ? true : prev.includeUntracked,
                    }));
                  }}
                >
                  ✕
                </button>
              </Badge>
            ))}
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setFilters({
                  categoryValueIds: [],
                  mainCategoryIds: [],
                  dimensionIds: [],
                  templateIds: [],
                  includeUntracked: true,
                })
              }
            >
              Clear all
            </Button>
          </div>
        )}

        {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        {loading && <div className="text-sm text-[var(--color-text-muted)]">Loading analytics…</div>}

        {!loading && report && (
          <div className="space-y-4">
            <SummaryKpiRow summary={report.summary} showComparison={comparisonMode !== "none" && Boolean(report.summary.compare)} />
            <StackedComparisonChart summary={report.summary} showComparison={comparisonMode !== "none" && Boolean(report.summary.compare)} />
            <div className="grid gap-4 lg:grid-cols-2">
              <CategoryBreakdownChart
                categories={report.categories}
                onSelectCategory={toggleCategoryFilter}
                activeCategoryIds={filters.mainCategoryIds}
                showComparison={comparisonMode !== "none"}
              />
              <UntrackedDonutCard
                untracked={report.untracked}
                totalTracked={report.summary.totalSeconds}
                showComparison={comparisonMode !== "none"}
              />
            </div>
            <TimelineChart timeline={report.timeline} />
          </div>
        )}

        {!loading && !report && !error && (
          <div className="text-sm text-[var(--color-text-muted)]">Select a period to see analytics.</div>
        )}
      </div>

      <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filters">
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[var(--color-text-muted)]">Include untracked</div>
            <label className="flex items-center gap-2 text-sm text-[var(--color-text-main)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[var(--color-border)]"
                checked={filters.includeUntracked}
                onChange={(e) => setFilters((prev) => ({ ...prev, includeUntracked: e.target.checked }))}
              />
              Include untracked entries
            </label>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[var(--color-text-muted)]">Main categories</div>
            {loadingCategories && <div className="text-[12px] text-[var(--color-text-muted)]">Loading categories...</div>}
            {!loadingCategories && categories.length > 0 && (
              <div className="grid max-h-36 grid-cols-2 gap-1 overflow-y-auto rounded border border-[var(--color-border)] bg-white px-2 py-2 text-sm">
                {categories.map((cat) => {
                  const checked = filters.mainCategoryIds.includes(cat.id);
                  return (
                    <label key={`main-${cat.id}`} className="flex items-center gap-2 text-[13px] text-[var(--color-text-main)]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[var(--color-border)]"
                        checked={checked}
                        onChange={(e) =>
                          setFilters((prev) => {
                            const next = new Set(prev.mainCategoryIds);
                            if (e.target.checked) next.add(cat.id);
                            else next.delete(cat.id);
                            return { ...prev, mainCategoryIds: Array.from(next) };
                          })
                        }
                      />
                      <span className="truncate">{cat.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[var(--color-text-muted)]">Category values</div>
            {!loadingCategories && categories.length === 0 && (
              <div className="text-[12px] text-[var(--color-text-muted)]">No categories yet.</div>
            )}
            {!loadingCategories && categories.length > 0 && (
              <div className="grid max-h-36 grid-cols-2 gap-1 overflow-y-auto rounded border border-[var(--color-border)] bg-white px-2 py-2 text-sm">
                {categories.map((cat) => {
                  const checked = filters.categoryValueIds.includes(cat.id);
                  return (
                    <label key={`cat-${cat.id}`} className="flex items-center gap-2 text-[13px] text-[var(--color-text-main)]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[var(--color-border)]"
                        checked={checked}
                        onChange={(e) =>
                          setFilters((prev) => {
                            const next = new Set(prev.categoryValueIds);
                            if (e.target.checked) next.add(cat.id);
                            else next.delete(cat.id);
                            return { ...prev, categoryValueIds: Array.from(next) };
                          })
                        }
                      />
                      <span className="truncate">
                        {cat.label}
                        {cat.dimensionName ? ` (${cat.dimensionName})` : ""}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[var(--color-text-muted)]">Dimensions</div>
            {dimensions.length === 0 ? (
              <div className="text-[12px] text-[var(--color-text-muted)]">No dimensions.</div>
            ) : (
              <div className="grid grid-cols-2 gap-1 text-sm">
                {dimensions.map((dim) => {
                  const checked = filters.dimensionIds.includes(dim.id);
                  return (
                    <label key={`dim-${dim.id}`} className="flex items-center gap-2 text-[13px] text-[var(--color-text-main)]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[var(--color-border)]"
                        checked={checked}
                        onChange={(e) =>
                          setFilters((prev) => {
                            const next = new Set(prev.dimensionIds);
                            if (e.target.checked) next.add(dim.id);
                            else next.delete(dim.id);
                            return { ...prev, dimensionIds: Array.from(next) };
                          })
                        }
                      />
                      <span>{dim.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[var(--color-text-muted)]">Templates</div>
            {templates.length === 0 ? (
              <div className="text-[12px] text-[var(--color-text-muted)]">No templates loaded.</div>
            ) : (
              <div className="grid max-h-32 grid-cols-2 gap-1 overflow-y-auto rounded border border-[var(--color-border)] bg-white px-2 py-2 text-sm">
                {templates.map((tpl) => {
                  const checked = filters.templateIds.includes(tpl.id);
                  return (
                    <label key={`tpl-${tpl.id}`} className="flex items-center gap-2 text-[13px] text-[var(--color-text-main)]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[var(--color-border)]"
                        checked={checked}
                        onChange={(e) =>
                          setFilters((prev) => {
                            const next = new Set(prev.templateIds);
                            if (e.target.checked) next.add(tpl.id);
                            else next.delete(tpl.id);
                            return { ...prev, templateIds: Array.from(next) };
                          })
                        }
                      />
                      <span className="truncate">{tpl.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowFilters(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setShowFilters(false);
                void fetchAnalytics();
              }}
            >
              Apply filters
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
