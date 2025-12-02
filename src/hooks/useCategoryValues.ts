import useSWR from 'swr';
import { CategoryValue } from '../core/domain/categoryValue/categoryValue.types';

const fetcher = async (url: string): Promise<CategoryValue[]> => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to load category values');
  }
  return res.json();
};

export function useCategoryValues(dimensionId?: string) {
  const shouldFetch = Boolean(dimensionId);
  const { data, error, mutate, isLoading } = useSWR<CategoryValue[]>(
    shouldFetch ? `/api/category-values?dimensionId=${dimensionId}` : null,
    fetcher,
  );
  return {
    values: data ?? [],
    loading: isLoading,
    error,
    refresh: () => mutate(),
  };
}
