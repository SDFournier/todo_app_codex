export const formatDurationShort = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.max(0, Math.floor(seconds % 60));
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m || h) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
};

export const formatDurationMinutes = (seconds: number): string => {
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
};

export const formatDateTimeShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
};

export const formatDateRange = (start: Date | string, end?: Date | string | null): string => {
  const startStr = formatDateTimeShort(start);
  const endStr = end ? formatDateTimeShort(end) : null;
  return `${startStr}${endStr ? ` - ${endStr}` : ''}`;
};

export const formatDurationHm = (seconds: number): string => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
  if (totalMinutes >= 1) {
    return `${totalMinutes}m`;
  }
  const s = Math.max(0, Math.floor(seconds));
  return `${s}s`;
};
