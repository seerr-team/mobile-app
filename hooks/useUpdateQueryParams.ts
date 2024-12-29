import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useCallback } from 'react';

type UseQueryParamReturnedFunction = (
  query: Record<string, string | undefined>,
  routerAction?: 'push' | 'replace'
) => void;

interface MergedQueryString {
  pathname: string;
  path: string;
}

/**
 * Returns a filtered object containing only key/value pairs that don't exist in the current
 * router path.
 *
 * @param filters Object containing key value pairs for filter items that should be cleaned
 */
export const filterQueryString = (
  currentParams: Record<string, string>,
  filters: Record<string, string | undefined>
): Record<string, string | undefined> => {
  const cleanedFilters: Record<string, string | undefined> = {};

  Object.keys(filters).forEach((key) => {
    if (!currentParams[key]) {
      cleanedFilters[key] = filters[key];
    }
  });

  return cleanedFilters;
};

/**
 * Takes a query parameter object and returns a new pathname and path
 * with the new values appended.
 *
 * - If the value already exists, it is updated.
 * - If a key with the value of null is passed, it will be removed from
 *   the current query parameters
 *
 * @param currentParams Current query parameters from the router
 * @param query Key/value pair object containing query parameters
 */
export const mergeQueryString = (
  pathname: string,
  currentParams: Record<string, string>,
  query: Record<string, string | undefined>
): MergedQueryString => {
  const cleanedQuery = filterQueryString(currentParams, currentParams);

  const mergedQuery = Object.assign({}, cleanedQuery, query);

  const queryArray: string[] = [];

  Object.keys(mergedQuery).forEach((key) => {
    if (mergedQuery[key]) {
      queryArray.push(`${key}=${mergedQuery[key]}`);
    }
  });

  const path = `${pathname}${queryArray.length > 0 ? `?${queryArray.join('&')}` : ''}`;

  return { pathname, path };
};
/**
 * useQueryParams hook is used just to provide a callback with an Expo Router
 * navigation instance attached to it. The returned method can be called with
 * an object of key/value pairs to route the user with the new query parameters.
 */
export const useQueryParams = (): UseQueryParamReturnedFunction => {
  const router = useRouter();
  const currentParams = useLocalSearchParams();
  const pathname = usePathname();

  return useCallback(
    (
      query: Record<string, string | undefined>,
      routerAction: 'push' | 'replace' = 'push'
    ) => {
      const newParams = {
        ...currentParams,
        ...query,
      };

      if (routerAction === 'replace') {
        router.replace(pathname, newParams);
      } else {
        router.push(pathname, newParams);
      }
    },
    [pathname, currentParams, router]
  );
};

export const useUpdateQueryParams = (
  filter: Record<string, string | undefined>
): ((key: string, value?: string) => void) => {
  const updateQueryParams = useQueryParams();

  return useCallback(
    (key: string, value?: string) => {
      const query = {
        ...filter,
        [key]: value,
      };
      updateQueryParams(query, 'replace');
    },
    [filter, updateQueryParams]
  );
};

export const useBatchUpdateQueryParams = (
  filter: Record<string, string | undefined>
): ((items: Record<string, string | undefined>) => void) => {
  const updateQueryParams = useQueryParams();

  return useCallback(
    (items: Record<string, string | undefined>) => {
      const query = {
        ...filter,
        ...items,
      };
      updateQueryParams(query, 'replace');
    },
    [filter, updateQueryParams]
  );
};
