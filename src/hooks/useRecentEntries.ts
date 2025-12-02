import useSWR from 'swr';
import { TimeEntry } from '../core/domain/timeEntry/timeEntry.types';

const fetcher = async (url: string): Promise<TimeEntry[]> => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to load recent entries');
  }
  return res.json();
};

export function useRecentEntries(limit = 10) {
  const { data, error, mutate, isLoading } = useSWR<TimeEntry[]>(
    `/api/time-entries/recent?limit=${limit}`,
    fetcher,
  );
  return {
    entries: data ?? [],
    loading: isLoading,
    error,
    refresh: () => mutate(),
  };
}
