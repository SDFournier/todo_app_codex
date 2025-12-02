import useSWR from 'swr';
import { TaskTemplate } from '../core/domain/taskTemplate/taskTemplate.types';

const fetcher = async (url: string): Promise<TaskTemplate[]> => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to load quick-start templates');
  }
  return res.json();
};

export function useQuickStarts() {
  const { data, error, mutate, isLoading } = useSWR<TaskTemplate[]>('/api/task-templates/quick-start', fetcher);
  return {
    quickStarts: data ?? [],
    loading: isLoading,
    error,
    refresh: () => mutate(),
  };
}
