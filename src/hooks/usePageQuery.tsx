// src/hooks/usePageQuery.ts
import { useQuery, useMutation, useQueryClient, QueryKey, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

/**
 * Hook for making page-specific queries that automatically 
 * namespace query keys by current route path
 */
export function usePageQuery<TData = unknown, TError = unknown>(
  queryKey: QueryKey,
  fetchFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'queryKey' | 'queryFn'>
) {
  const location = useLocation();
  
  // Add current pathname to query key to isolate queries between pages
  const pageSpecificKey = [location.pathname, ...queryKey];
  
  return useQuery({
    queryKey: pageSpecificKey,
    queryFn: fetchFn,
    // Only fetch data when this page is active
    enabled: options?.enabled !== false,
    ...options
  });
}

/**
 * Hook for mutations that can invalidate page-specific queries
 */
export function usePageMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>
) {
  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Call the original onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    // Spread the rest of the options
    ...options
  });
}

/**
 * Utility hook for invalidating page-specific queries
 */
export function useInvalidatePageQueries() {
  const location = useLocation();
  const queryClient = useQueryClient();
  
  return (queryKey?: QueryKey) => {
    if (queryKey) {
      // Invalidate specific queries on the current page
      queryClient.invalidateQueries({
        queryKey: [location.pathname, ...queryKey],
      });
    } else {
      // Invalidate all queries for the current page
      queryClient.invalidateQueries({
        queryKey: [location.pathname],
      });
    }
  };
}

/**
 * Hook for setting up prefetching when a user hovers over a link
 * to another page, improving perceived performance
 */
export function usePrefetchPageData(pathName: string, queryKey: QueryKey, fetchFn: () => Promise<any>) {
  const queryClient = useQueryClient();
  
  const prefetchData = () => {
    // Prefetch and store in cache for quick access when navigating
    queryClient.prefetchQuery({
      queryKey: [pathName, ...queryKey],
      queryFn: fetchFn,
      staleTime: 30 * 1000, // 30 seconds
    });
  };
  
  return prefetchData;
}