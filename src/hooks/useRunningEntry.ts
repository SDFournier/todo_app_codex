import useSWR from 'swr';
import { TimeEntry } from '../core/domain/timeEntry/timeEntry.types';

const fetcher = async (url: string): Promise<TimeEntry | null> => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to load running entry');
  }
  if (res.status === 204) return null;
  return res.json();
};

export function useRunningEntry() {
  const { data, error, mutate, isLoading } = useSWR<TimeEntry | null>('/api/time-entries/running', fetcher, {
    refreshInterval: 5000,
  });
  return {
    running: data,
    loading: isLoading,
    error,
    refresh: () => mutate(),
  };
}
