import useSWR from 'swr';
import { CategoryDimension } from '../core/domain/categoryDimension/categoryDimension.types';

const fetcher = async (url: string): Promise<CategoryDimension[]> => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to load category dimensions');
  }
  return res.json();
};

export function useCategoryDimensions() {
  const { data, error, mutate, isLoading } = useSWR<CategoryDimension[]>('/api/category-dimensions', fetcher);
  return {
    dimensions: data ?? [],
    loading: isLoading,
    error,
    refresh: () => mutate(),
  };
}
