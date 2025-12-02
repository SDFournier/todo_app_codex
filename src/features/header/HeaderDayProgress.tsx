import React, { useEffect, useMemo, useState } from "react";
import { TodayEntrySummary } from "@/infra/header/getHeaderData";
import { formatDurationHm } from "@/lib/time/format";
import {
  computeDayAggregate,
  computeUntrackedMeta,
  buildTimelineSegments,
  TimelineSegment,
} from "@/lib/analytics/dayInsights";

type Props = {
  dayStartIso: string;
  nowIso: string;
  entries: TodayEntrySummary[];
  runningEntry: { isUntracked: boolean; startedAt: string } | null;
};

type NormalizedSegment = {
  type: TimelineSegment["type"] | "future";
  widthPct: number;
};

const segmentColors: Record<NormalizedSegment["type"], string> = {
  productive: "bg-[var(--color-success)]",
  other: "bg-[var(--color-border)]",
  untracked: "bg-[var(--color-error)]/90",
  future: "bg-[var(--color-surface)]",
};

export const HeaderDayProgress: React.FC<Props> = ({ dayStartIso, nowIso, entries, runningEntry }) => {
  const [now, setNow] = useState(() => new Date(nowIso));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const dayStart = useMemo(() => new Date(dayStartIso), [dayStartIso]);
  const fullDaySeconds = 24 * 60 * 60;
  const elapsedSeconds = useMemo(
    () => Math.min(Math.max(0, Math.floor((now.getTime() - dayStart.getTime()) / 1000)), fullDaySeconds),
    [now, dayStart, fullDaySeconds],
  );

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

  const normalizedSegments: NormalizedSegment[] = useMemo(() => {
    const totalCovered = timelineSegments.reduce((acc, seg) => acc + seg.durationSeconds, 0);
    const remaining = Math.max(0, fullDaySeconds - totalCovered);
    const base = timelineSegments.map((seg) => ({
      type: seg.type,
      widthPct: (seg.durationSeconds / fullDaySeconds) * 100,
    })) as NormalizedSegment[];
    if (remaining > 0) {
      base.push({ type: "future", widthPct: (remaining / fullDaySeconds) * 100 });
    }
    return base;
  }, [timelineSegments, fullDaySeconds]);

  const timelineMarkers = useMemo(
    () =>
      [
        { pct: 0, label: "00:00" },
        { pct: 0.25, label: "06:00" },
        { pct: 0.5, label: "12:00" },
        { pct: 0.75, label: "18:00" },
        { pct: elapsedSeconds / fullDaySeconds, label: "Ahora" },
      ].map((m) => ({ pct: Math.min(1, Math.max(0, m.pct)), label: m.label })),
    [elapsedSeconds, fullDaySeconds],
  );

  return (
    <div className="flex min-w-[260px] flex-1 flex-col gap-3">
      {/* Línea de tiempo */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          <span>Hoy</span>
        </div>
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-[var(--color-text-muted)]">Línea de tiempo</div>
          <div className="relative flex flex-col gap-2 pb-5 pt-1">
            <div
              className="h-[12px] w-full overflow-hidden rounded-full bg-[var(--color-border)]"
              title="Muestra cómo se repartió tu día entre tiempo productivo, otro y no trackeado en orden cronológico."
            >
              <div className="flex h-full">
                {normalizedSegments.map((seg, idx) => (
                  <div
                    key={`${seg.type}-${idx}`}
                    className={`${segmentColors[seg.type]} h-full`}
                    style={{ width: `${seg.widthPct}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-[var(--color-text-muted)]">
              {timelineMarkers.map((marker, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1" style={{ left: `${marker.pct * 100}%` }}>
                  <span className="h-3 w-px bg-[var(--color-border)]" />
                  <span className="leading-none">{marker.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distribución acumulada */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-[var(--color-text-muted)]">Distribución del día</div>
        <div
          className="h-[12px] w-full overflow-hidden rounded-full bg-[var(--color-border)]"
          title="Porcentaje de tiempo productivo, otro y no trackeado sobre el tiempo transcurrido del día."
        >
          <div className="flex h-full">
            <div className={`${segmentColors.productive} h-full`} style={{ width: `${productivePct}%` }} />
            <div className={`${segmentColors.other} h-full`} style={{ width: `${otherPct}%` }} />
            <div className={`${segmentColors.untracked} h-full`} style={{ width: `${untrackedPct}%` }} />
          </div>
        </div>
        <div className="flex flex-col gap-1 text-[12px] text-[var(--color-text-muted)]">
          <span className="font-semibold text-[var(--color-text-main)]">
            Trackeado: {formatDurationHm(aggregate.trackedSeconds)} / {formatDurationHm(aggregate.dayElapsedSeconds)} ({trackedPctOfDay}%)
          </span>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-2 py-[4px]">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                <span>Productivo</span>
              </div>
              <span className="text-[12px] font-semibold text-[var(--color-text-main)]">{formatDurationHm(aggregate.productiveSeconds)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-2 py-[4px]">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                <span className="h-2 w-2 rounded-full bg-[var(--color-border)]" />
                <span>Otro (trackeado no productivo)</span>
              </div>
              <span className="text-[12px] font-semibold text-[var(--color-text-main)]">{formatDurationHm(aggregate.otherSeconds)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-2 py-[4px]">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                <span className="h-2 w-2 rounded-full bg-[var(--color-error)]/90" />
                <span>No trackeado</span>
              </div>
              <span className="text-[12px] font-semibold text-[var(--color-text-main)]">{formatDurationHm(displayUntrackedSeconds)}</span>
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
