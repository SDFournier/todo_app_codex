import React, { useEffect, useMemo, useState } from "react";
import { TodayEntrySummary } from "@/infra/header/getHeaderData";
import { formatDurationHm } from "@/lib/time/format";
import { computeDayAggregate, computeUntrackedMeta, buildTimelineSegments } from "@/lib/analytics/dayInsights";

type Props = {
  dayStartIso: string;
  nowIso: string;
  entries: TodayEntrySummary[];
  runningEntry: { isUntracked: boolean; startedAt: string } | null;
};

export const HeaderDayProgress: React.FC<Props> = ({ dayStartIso, nowIso, entries, runningEntry }) => {
  const [now, setNow] = useState(() => new Date(nowIso));
  const [openInfo, setOpenInfo] = useState<null | "timeline" | "distribution" | "legend">(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const dayStart = useMemo(() => new Date(dayStartIso), [dayStartIso]);
  const aggregate = useMemo(() => computeDayAggregate({ entries, now, dayStart }), [entries, now, dayStart]);
  const untrackedGapSeconds = Math.max(0, aggregate.dayElapsedSeconds - (aggregate.trackedSeconds + aggregate.untrackedSeconds));
  const displayUntrackedSeconds = aggregate.untrackedSeconds + untrackedGapSeconds;
  const trackedPctOfDay =
    aggregate.dayElapsedSeconds > 0 ? Math.round((aggregate.trackedSeconds / aggregate.dayElapsedSeconds) * 100) : 0;
  const productivePct =
    aggregate.dayElapsedSeconds > 0 ? Math.round((aggregate.productiveSeconds / aggregate.dayElapsedSeconds) * 100) : 0;
  const otherPct =
    aggregate.dayElapsedSeconds > 0 ? Math.round((aggregate.otherSeconds / aggregate.dayElapsedSeconds) * 100) : 0;
  const untrackedPct =
    aggregate.dayElapsedSeconds > 0 ? Math.min(100, Math.round((displayUntrackedSeconds / aggregate.dayElapsedSeconds) * 100)) : 0;

  const untrackedMeta = useMemo(() => computeUntrackedMeta(entries, now), [entries, now]);
  const runningUntrackedSeconds =
    runningEntry && runningEntry.isUntracked ? Math.max(0, Math.floor((now.getTime() - new Date(runningEntry.startedAt).getTime()) / 1000)) : 0;

  const timelineSegments = useMemo(() => buildTimelineSegments({ entries, dayStart, now }), [entries, dayStart, now]);

  const bucketColor: Record<string, string> = {
    productive: "bg-[var(--color-success)]",
    other: "bg-[var(--color-border)]",
    untracked: "bg-[var(--color-error)]/90",
    mixed: "bg-[var(--color-border)]",
    none: "bg-[var(--color-border)]",
  };

  const LegendBubble = ({ text }: { text: string }) => (
    <div className="absolute left-1/2 top-full z-10 mt-2 w-64 -translate-x-1/2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[11px] text-[var(--color-text-muted)] shadow-lg">
      {text}
    </div>
  );

  return (
    <div className="flex min-w-[260px] flex-1 flex-col gap-2.5">
      {/* Timeline bar */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          <span>Hoy</span>
        </div>
        <div className="space-y-1.5">
          <div className="relative flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
            <span>Línea de tiempo</span>
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-border)] text-[12px] text-[var(--color-text-muted)] sm:hidden"
              aria-label="Info línea de tiempo"
              onClick={() => setOpenInfo((prev) => (prev === "timeline" ? null : "timeline"))}
            >
              ⓘ
            </button>
            {openInfo === "timeline" && (
              <div className="absolute left-0 top-6 z-10 w-64 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[11px] text-[var(--color-text-muted)] shadow-lg">
                Línea de tiempo: muestra cómo se repartió tu día hasta ahora entre tiempo productivo, otro y no trackeado en orden cronológico.
              </div>
            )}
          </div>
          <div
            className="h-[14px] w-full overflow-hidden rounded-full bg-[var(--color-border)]"
            title="Línea de tiempo: muestra cómo se repartió tu día hasta ahora entre tiempo productivo, otro y no trackeado de forma cronológica."
          >
            <div className="flex h-full">
              {timelineSegments.map((seg, idx) => (
                <div
                  key={idx}
                  className={`${bucketColor[seg.type] ?? bucketColor.untracked} h-full`}
                  style={{
                    width: `${aggregate.dayElapsedSeconds > 0 ? (seg.durationSeconds / aggregate.dayElapsedSeconds) * 100 : 0}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Accumulated distribution */}
      <div className="space-y-1.5">
        <div className="relative flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
          <span>Distribución del día</span>
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-border)] text-[12px] text-[var(--color-text-muted)] sm:hidden"
            aria-label="Info distribución del día"
            onClick={() => setOpenInfo((prev) => (prev === "distribution" ? null : "distribution"))}
          >
            ⓘ
          </button>
          {openInfo === "distribution" && (
            <div className="absolute left-0 top-6 z-10 w-64 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[11px] text-[var(--color-text-muted)] shadow-lg">
              Distribución del día: porcentaje de tiempo productivo, otro y no trackeado sobre el tiempo transcurrido del día.
            </div>
          )}
        </div>
        <div
          className="h-[14px] w-full overflow-hidden rounded-full bg-[var(--color-border)]"
          title="Distribución del día: porcentaje de tiempo productivo, otro y no trackeado sobre el tiempo transcurrido del día."
        >
          <div className="flex h-full">
            <div className={`${bucketColor.productive} h-full`} style={{ width: `${productivePct}%` }} />
            <div className={`${bucketColor.other} h-full`} style={{ width: `${otherPct}%` }} />
            <div className={`${bucketColor.untracked} h-full`} style={{ width: `${untrackedPct}%` }} />
          </div>
        </div>
        <div className="relative flex flex-col gap-0.5 text-[12px] text-[var(--color-text-muted)]">
          <span className="font-semibold text-[var(--color-text-main)]">
            Trackeado: {formatDurationHm(aggregate.trackedSeconds)} / {formatDurationHm(aggregate.dayElapsedSeconds)} ({trackedPctOfDay}%)
          </span>
          <span>
            Productivo: {formatDurationHm(aggregate.productiveSeconds)} · Otro: {formatDurationHm(aggregate.otherSeconds)} ·{" "}
            <span
              className="text-[var(--color-error)]"
              title="Incluye todo el tiempo del día que no estuvo asociado a ninguna actividad o categoría."
            >
              No trackeado: {formatDurationHm(displayUntrackedSeconds)}
            </span>
          </span>
          <div className="flex items-center gap-1">
            <div
              className="hidden cursor-default text-[11px] text-[var(--color-text-muted)] sm:inline"
              onMouseEnter={() => setOpenInfo("legend")}
              onMouseLeave={() => setOpenInfo(null)}
            >
              ⓘ Productivo es parte de Trackeado (Trackeado = productivo + otro + no trackeado).
              {openInfo === "legend" && (
                <LegendBubble text="Productivo es parte de Trackeado. Trackeado = productivo + otro + no trackeado." />
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {runningUntrackedSeconds > 0 && (
              <span className="rounded bg-[var(--color-error)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--color-error)]">
                Ahora +{formatDurationHm(runningUntrackedSeconds)}
              </span>
            )}
            {untrackedMeta.runningUntrackedSeconds > 0 && runningUntrackedSeconds === 0 && (
              <span className="rounded bg-[var(--color-error)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--color-error)]">
                Ahora +{formatDurationHm(untrackedMeta.runningUntrackedSeconds)}
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
