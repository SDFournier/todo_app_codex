import useSWR from 'swr';
import { TaskTemplate } from '../core/domain/taskTemplate/taskTemplate.types';

const fetcher = async (url: string): Promise<TaskTemplate[]> => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to load task templates');
  }
  return res.json();
};

export function useTaskTemplates() {
  const { data, error, mutate, isLoading } = useSWR<TaskTemplate[]>('/api/task-templates', fetcher);
  return {
    templates: data ?? [],
    loading: isLoading,
    error,
    refresh: () => mutate(),
  };
}
