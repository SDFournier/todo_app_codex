"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRunningEntry } from "../hooks/useRunningEntry";
import { useQuickStarts } from "../hooks/useQuickStarts";
import { useRecentEntries } from "../hooks/useRecentEntries";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { QuickStartList } from "../components/time-tracker/QuickStartList";
import { RecentEntriesList } from "../components/time-tracker/RecentEntriesList";
import type { DayProgressSummary, TodayEntrySummary } from "@/infra/header/getHeaderData";
import { formatDurationHm } from "@/lib/time/format";
import { useRouter } from "next/navigation";
import { TimeEntry } from "@/core/domain/timeEntry/timeEntry.types";
import { RunningStatusCard } from "@/features/timeEntries/components/RunningStatusCard";
import { QuickStartChipsRow } from "@/features/timeEntries/components/QuickStartChipsRow";
import {
  buildDayTimelineBuckets,
  computeDayAggregate,
  computeProductivePercentForWindow,
  computeTopProductiveCategory,
  computeUntrackedMeta,
} from "@/lib/analytics/dayInsights";

const fetchJson = async (url: string, opts?: RequestInit) => {
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.status === 204 ? null : res.json();
};

export default function Home() {
  const { running, refresh: refreshRunning } = useRunningEntry();
  const { quickStarts, refresh: refreshQuickStarts } = useQuickStarts();
  const { entries, refresh: refreshEntries } = useRecentEntries();
  const [dayProgress, setDayProgress] = useState<DayProgressSummary | null>(null);
  const [todayEntries, setTodayEntries] = useState<TodayEntrySummary[]>([]);
  const [dayStartIso, setDayStartIso] = useState<string | null>(null);
  const [pausedEntry, setPausedEntry] = useState<TimeEntry | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newEntryTitle, setNewEntryTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const quickStartsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);
  const now = useMemo(() => new Date(nowTick), [nowTick]);
  const dayStart = useMemo(() => {
    if (dayStartIso) return new Date(dayStartIso);
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, [dayStartIso]);

  const dayAgg = useMemo(() => computeDayAggregate({ entries: todayEntries, now, dayStart }), [todayEntries, now, dayStart]);
  const trackedSecondsDisplay = dayAgg.trackedSeconds;
  const productiveSecondsDisplay = dayAgg.productiveSeconds;
  const otherSecondsDisplay = dayAgg.otherSeconds;
  const untrackedEntrySeconds = dayAgg.untrackedSeconds;
  const untrackedGapSeconds = Math.max(0, dayAgg.dayElapsedSeconds - (trackedSecondsDisplay + untrackedEntrySeconds));
  const displayUntrackedSeconds = untrackedEntrySeconds + untrackedGapSeconds;
  const trackedPctOfDay =
    dayAgg.dayElapsedSeconds > 0 ? Math.round((trackedSecondsDisplay / dayAgg.dayElapsedSeconds) * 100) : 0;
  const timelineBuckets = useMemo(
    () => buildDayTimelineBuckets({ entries: todayEntries, dayStart, now, bucketMinutes: 60 }),
    [todayEntries, dayStart, now],
  );
  const streaks = useMemo(
    () => [60, 120, 240].map((minutes) => ({ minutes, ...computeProductivePercentForWindow(todayEntries, now, minutes) })),
    [todayEntries, now],
  );
  const topCategory = useMemo(() => computeTopProductiveCategory(todayEntries), [todayEntries]);
  const untrackedMeta = useMemo(() => computeUntrackedMeta(todayEntries, now), [todayEntries, now]);
  const bucketColor: Record<string, string> = {
    productive: "bg-[var(--color-success)]",
    other: "bg-[var(--color-primary)] opacity-80",
    untracked: "bg-[var(--color-error)] opacity-80",
    mixed: "bg-[var(--color-border)]",
    none: "bg-[var(--color-border)]",
  };
  const streakTone = (pct: number) => {
    if (pct >= 70) return "text-[var(--color-success)]";
    if (pct >= 40) return "text-[var(--color-warning)]";
    return "text-[var(--color-error)]";
  };
  const dayElapsedSeconds = dayAgg.dayElapsedSeconds || 1;
  const productivePctOfDay = dayElapsedSeconds > 0 ? Math.round((productiveSecondsDisplay / dayElapsedSeconds) * 100) : 0;
  const otherPctOfDay = dayElapsedSeconds > 0 ? Math.round((otherSecondsDisplay / dayElapsedSeconds) * 100) : 0;
  const untrackedPctOfDay = dayElapsedSeconds > 0 ? Math.round((displayUntrackedSeconds / dayElapsedSeconds) * 100) : 0;
  const entryCount = dayAgg.entryCount ?? dayProgress?.entryCount ?? todayEntries.length;
  const productivePctOfTracked = trackedSecondsDisplay > 0 ? Math.round((productiveSecondsDisplay / trackedSecondsDisplay) * 100) : 0;
  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    todayEntries.forEach((entry) => {
      if (entry.isUntracked || !entry.isProductive || !entry.mainCategoryLabel) return;
      const start = new Date(entry.startedAt);
      const end = entry.endedAt ? new Date(entry.endedAt) : now;
      const dur = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
      totals.set(entry.mainCategoryLabel, (totals.get(entry.mainCategoryLabel) ?? 0) + dur);
    });
    return Array.from(totals.entries())
      .map(([label, seconds]) => ({ label, seconds }))
      .sort((a, b) => b.seconds - a.seconds);
  }, [todayEntries, now]);
  const maxCategorySeconds = categoryBreakdown[0]?.seconds ?? 0;
  const longestFocusBlock = useMemo(() => {
    let max = 0;
    todayEntries.forEach((entry) => {
      if (entry.isUntracked || !entry.isProductive) return;
      const start = new Date(entry.startedAt);
      const end = entry.endedAt ? new Date(entry.endedAt) : now;
      const dur = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
      if (dur > max) max = dur;
    });
    return max;
  }, [todayEntries, now]);
  const averageFocusBlock = useMemo(() => {
    const durations: number[] = [];
    todayEntries.forEach((entry) => {
      if (entry.isUntracked || !entry.isProductive) return;
      const start = new Date(entry.startedAt);
      const end = entry.endedAt ? new Date(entry.endedAt) : now;
      durations.push(Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000)));
    });
    if (!durations.length) return 0;
    const total = durations.reduce((sum, v) => sum + v, 0);
    return Math.round(total / durations.length);
  }, [todayEntries, now]);
  const lastUntrackedAgoSeconds = useMemo(() => {
    if (!untrackedMeta.lastEndedAt) return null;
    return Math.max(0, Math.floor((now.getTime() - untrackedMeta.lastEndedAt.getTime()) / 1000));
  }, [untrackedMeta.lastEndedAt, now]);

  const refreshDayProgress = async () => {
    try {
      const data = await fetchJson("/api/header");
      setDayProgress(data.dayProgress);
      setTodayEntries(data.todayEntries ?? []);
      setDayStartIso(data.dayStartIso ?? null);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshDayProgress();
  }, []);

  const handleStart = async (templateId?: string, titleOverrideArg?: string) => {
    setLoadingAction(true);
    setError(null);
    try {
      const title = (titleOverrideArg ?? newEntryTitle).trim();
      await fetchJson("/api/time-entries/start", {
        method: "POST",
        body: JSON.stringify({
          taskTemplateId: templateId ?? null,
          ...(title ? { titleOverride: title } : {}),
          stopRunningIfExists: true,
        }),
      });
      setNewEntryTitle("");
      await Promise.all([refreshRunning(), refreshEntries(), refreshQuickStarts(), refreshDayProgress()]);
      router.refresh();
      setPausedEntry(null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to start");
    } finally {
      setLoadingAction(false);
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleManualStart = async () => {
    if (!newEntryTitle.trim()) {
      focusInput();
      return;
    }
    await handleStart(undefined, newEntryTitle);
  };

  const focusQuickStarts = () => {
    if (quickStartsRef.current) {
      quickStartsRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      const firstButton = quickStartsRef.current.querySelector("button");
      if (firstButton instanceof HTMLButtonElement) {
        firstButton.focus();
      }
    }
  };

  const handleStop = async () => {
    setLoadingAction(true);
    setError(null);
    try {
      await fetchJson("/api/time-entries/stop", { method: "POST" });
      await Promise.all([refreshRunning(), refreshEntries(), refreshDayProgress()]);
      router.refresh();
      setPausedEntry(null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to stop");
    } finally {
      setLoadingAction(false);
    }
  };

  const handlePause = async (entry: TimeEntry) => {
    await handleStop();
    setPausedEntry(entry);
  };

  const handleResume = async (entry: TimeEntry) => {
    setLoadingAction(true);
    setError(null);
    try {
      await fetchJson("/api/time-entries/start", {
        method: "POST",
        body: JSON.stringify({
          taskTemplateId: entry.taskTemplateId ?? null,
          titleOverride: entry.titleOverride ?? null,
          stopRunningIfExists: true,
        }),
      });
      await Promise.all([refreshRunning(), refreshEntries(), refreshQuickStarts(), refreshDayProgress()]);
      router.refresh();
      setPausedEntry(null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to resume");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateEntry = async (
    entryId: string,
    updates: { titleOverride?: string | null; mainCategoryValueId?: string | null; categoryValueIds?: string[] },
  ) => {
    setLoadingAction(true);
    setError(null);
    try {
      await fetchJson(`/api/time-entries/${entryId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      await refreshEntries();
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Failed to update entry");
      throw err;
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    setLoadingAction(true);
    setError(null);
    try {
      await fetchJson(`/api/time-entries/${entryId}`, { method: "DELETE" });
      await Promise.all([refreshEntries(), refreshDayProgress()]);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete");
    } finally {
      setLoadingAction(false);
    }
  };

  const handlePromote = async (entry: TimeEntry) => {
    if (!entry.taskTemplateId) return;
    setLoadingAction(true);
    setError(null);
    try {
      await fetchJson(`/api/task-templates/${entry.taskTemplateId}/quick-start`, {
        method: "POST",
        body: JSON.stringify({ isQuickStart: true }),
      });
      await refreshQuickStarts();
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Failed to promote quick start");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--color-background)] via-white to-[var(--color-primary-soft)] px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--color-text-main)]">What are you working on?</h3>
                  <span className="text-xs text-[var(--color-text-muted)]">Untracked runs when nothing else is active.</span>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    ref={inputRef}
                    className="flex-1 h-10 rounded border border-[var(--color-border)] px-3 text-sm"
                    placeholder="Add a quick label and start tracking"
                    value={newEntryTitle}
                    onChange={(e) => setNewEntryTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleManualStart();
                      }
                    }}
                  />
                  <Button onClick={() => void handleManualStart()} disabled={loadingAction || !newEntryTitle.trim()}>
                    Start
                  </Button>
                </div>
                <RunningStatusCard
                  entry={running ?? null}
                  pausedEntry={pausedEntry}
                  quickStarts={quickStarts}
                  isLoading={loadingAction}
                  onPause={handlePause}
                  onStop={handleStop}
                  onResume={handleResume}
                  onStartFromInput={() => void handleManualStart()}
                  onChooseQuickStarts={focusQuickStarts}
                />
                {running?.isUntracked && quickStarts.length > 0 && (
                  <div className="space-y-2" ref={quickStartsRef}>
                    <div className="text-xs font-semibold text-[var(--color-text-muted)]">Start quickly with:</div>
                    <QuickStartChipsRow dense templates={quickStarts} onStart={(id) => handleStart(id)} />
                  </div>
                )}
              </div>
            </Card>
          </div>
          <div className="space-y-3">
            <Card title="At a glance">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-[var(--color-text-main)]">Hoy</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{todayIso}</div>
                  </div>
                  <div className="h-3 w-full rounded-full bg-[var(--color-border)]">
                    <div className="flex h-3 overflow-hidden rounded-full">
                      <div className={`h-3 ${bucketColor.productive}`} style={{ width: `${productivePctOfDay}%` }} />
                      <div className={`h-3 ${bucketColor.other}`} style={{ width: `${otherPctOfDay}%` }} />
                      <div className={`h-3 ${bucketColor.untracked}`} style={{ width: `${untrackedPctOfDay}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[12px] text-[var(--color-text-muted)]">
                    <span className="font-semibold text-[var(--color-text-main)]">
                      Trackeado: {formatDurationHm(trackedSecondsDisplay)} / {formatDurationHm(dayAgg.dayElapsedSeconds)} ({trackedPctOfDay}%)
                    </span>
                    <span className="text-[var(--color-success)]">Productivo: {formatDurationHm(productiveSecondsDisplay)}</span>
                    <span>Otro: {formatDurationHm(otherSecondsDisplay)}</span>
                    <span className="text-[var(--color-error)]">No trackeado: {formatDurationHm(displayUntrackedSeconds)}</span>
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    Productivo es un subconjunto de lo trackeado; lo trackeado suma productivo + otro + no trackeado.
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
                    <span className="font-semibold text-[var(--color-text-main)]">Mini timeline</span>
                    <div className="flex flex-1 items-center gap-[2px]">
                      {timelineBuckets.map((b, idx) => (
                        <div
                          key={`${b.start.toISOString()}-${idx}`}
                          className={`h-2 flex-1 rounded-sm ${bucketColor[b.label]}`}
                          title={`${b.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${b.end.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 shadow-sm">
                    <div className="text-[12px] font-semibold text-[var(--color-text-muted)]">Volumen</div>
                    <div className="mt-1 text-lg font-bold text-[var(--color-text-main)]">{formatDurationHm(trackedSecondsDisplay)}</div>
                    <div className="text-[12px] text-[var(--color-text-muted)]">
                      {entryCount} entradas · {trackedPctOfDay}% del día
                    </div>
                  </div>
                  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 shadow-sm">
                    <div className="text-[12px] font-semibold text-[var(--color-text-muted)]">Calidad</div>
                    <div className="mt-1 text-lg font-bold text-[var(--color-text-main)]">{formatDurationHm(productiveSecondsDisplay)}</div>
                    <div className="text-[12px] text-[var(--color-text-muted)]">
                      {trackedSecondsDisplay > 0 ? `${productivePctOfTracked}% de lo trackeado` : "Sin datos"}
                    </div>
                    <div className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                      Bloque más largo: {formatDurationHm(longestFocusBlock)} · Promedio: {formatDurationHm(averageFocusBlock)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 shadow-sm">
                    <div className="text-[12px] font-semibold text-[var(--color-text-muted)]">Distracciones / Untracked</div>
                    <div className="mt-1 text-lg font-bold text-[var(--color-text-main)]">{formatDurationHm(displayUntrackedSeconds)}</div>
                    <div className="text-[12px] text-[var(--color-text-muted)]">
                      {untrackedMeta.intervals} intervalos · Último {lastUntrackedAgoSeconds != null ? formatDurationHm(lastUntrackedAgoSeconds) + " atrás" : "—"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 shadow-sm">
                    <div className="text-[12px] font-semibold text-[var(--color-text-muted)]">Rachas recientes</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {streaks.map((s) => (
                        <div key={s.minutes} className="rounded-full border border-[var(--color-border)] px-2 py-1 text-[12px]">
                          <span className="text-[var(--color-text-muted)]">Últ {s.minutes / 60}h </span>
                          <span className={`font-semibold ${streakTone(s.pct)}`}>{s.trackedSeconds > 0 ? `${s.pct}%` : "--"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[12px] font-semibold text-[var(--color-text-muted)]">Productivo por categoría</div>
                      <div className="text-sm font-bold text-[var(--color-text-main)]">Top: {topCategory ? topCategory.label : "—"}</div>
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">Solo tiempo productivo</div>
                  </div>
                  <div className="space-y-2">
                    {categoryBreakdown.length === 0 && (
                      <div className="text-xs text-[var(--color-text-muted)]">Aún no hay tiempo productivo registrado hoy.</div>
                    )}
                    {categoryBreakdown.map((cat) => (
                      <div key={cat.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                          <span className="font-medium text-[var(--color-text-main)]">{cat.label}</span>
                          <span>{formatDurationHm(cat.seconds)}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[var(--color-border)]">
                          <div
                            className="h-2 rounded-full bg-[var(--color-primary)]"
                            style={{ width: `${maxCategorySeconds > 0 ? Math.max(4, Math.round((cat.seconds / maxCategorySeconds) * 100)) : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 text-xs text-[var(--color-text-muted)]">
                    <div>
                      {topCategory
                        ? `Categoría productiva principal: ${topCategory.label} (${formatDurationHm(topCategory.seconds)})`
                        : "Sin categoría productiva destacada aún."}
                    </div>
                    <div>No trackeado acumulado: {formatDurationHm(displayUntrackedSeconds)} ({trackedPctOfDay > 0 ? `${untrackedPctOfDay}% del día` : "--"})</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <QuickStartList templates={quickStarts} onStartTemplate={(id) => handleStart(id)} />
          <RecentEntriesList
            entries={entries}
            onUpdate={handleUpdateEntry}
            onDelete={handleDelete}
            onPromoteQuickStart={handlePromote}
          />
        </section>
      </div>
    </main>
  );
}
