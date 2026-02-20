import Button from '@/components/Common/Button';
import Header from '@/components/Common/Header';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
// import RequestItem from '@/components/RequestList/RequestItem';
import RequestCard from '@/components/RequestCard';
// import { useUpdateQueryParams } from '@/hooks/useUpdateQueryParams';
import { useUser } from '@/hooks/useUser';
// import {
//   BarsArrowDown,
//   ChevronLeft,
//   ChevronRight,
//   Funnel,
// } from '@nandorojo/heroicons/24/solid';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import type { RequestResultsResponse } from '@/seerr/server/interfaces/api/requestInterfaces';
import getSeerrMessages from '@/utils/getSeerrMessages';
import globalMessages from '@/utils/globalMessages';
import { Link, useLocalSearchParams, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  RefreshControl,
  ScrollView,
  TVFocusGuideView,
  View,
} from 'react-native';
import useSWR from 'swr';

const messages = getSeerrMessages('components.RequestList');

enum Filter {
  ALL = 'all',
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  FAILED = 'failed',
  DELETED = 'deleted',
  COMPLETED = 'completed',
}

type Sort = 'added' | 'modified';

const RequestList = () => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const pathname = usePathname();
  const searchParams = useLocalSearchParams();
  const { user: currentUser } = useUser();
  const [currentFilter, setCurrentFilter] = useState<Filter>(Filter.PENDING);
  const [currentSort, setCurrentSort] = useState<Sort>('added');
  const [currentPageSize, setCurrentPageSize] = useState<number>(10);
  const { user } = useUser({
    id: Number(searchParams.userId),
  });

  const page = searchParams.page ? Number(searchParams.page) : 1;
  const pageIndex = page - 1;
  // const updateQueryParams = useUpdateQueryParams({ page: page.toString() });

  // const { data: radarrData } = useSWR<RadarrSettings[]>(
  //   hasPermission(Permission.ADMIN) ? '/api/v1/settings/radarr' : null
  // );
  // const { data: sonarrData } = useSWR<SonarrSettings[]>(
  //   hasPermission(Permission.ADMIN) ? '/api/v1/settings/sonarr' : null
  // );

  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<RequestResultsResponse>(
    `${serverUrl}/api/v1/request?take=${currentPageSize}&skip=${
      pageIndex * currentPageSize
    }&filter=${currentFilter}&sort=${currentSort}${
      pathname.startsWith('/profile')
        ? `&requestedBy=${currentUser?.id}`
        : searchParams.userId
          ? `&requestedBy=${searchParams.userId}`
          : ''
    }`
  );

  // Restore last set filter values on component mount
  useEffect(() => {
    // const filterString = window.localStorage.getItem('rl-filter-settings');

    // if (filterString) {
    //   const filterSettings = JSON.parse(filterString);

    //   setCurrentFilter(filterSettings.currentFilter);
    //   setCurrentSort(filterSettings.currentSort);
    //   setCurrentPageSize(filterSettings.currentPageSize);
    // }

    // If filter value is provided in query, use that instead
    if (Object.values(Filter).includes(searchParams.filter as Filter)) {
      setCurrentFilter(searchParams.filter as Filter);
    }
  }, [searchParams.filter]);

  // Set filter values to local storage any time they are changed
  // useEffect(() => {
  //   window.localStorage.setItem(
  //     'rl-filter-settings',
  //     JSON.stringify({
  //       currentFilter,
  //       currentSort,
  //       currentPageSize,
  //     })
  //   );
  // }, [currentFilter, currentSort, currentPageSize]);

  if (!data && !error) {
    return (
      <View className="flex flex-1 items-center justify-center">
        <LoadingSpinner />
      </View>
    );
  }

  // const hasNextPage = data.pageInfo.pages > pageIndex + 1;
  // const hasPrevPage = pageIndex > 0;

  return (
    <ScrollView
      contentContainerClassName="pb-4"
      className="px-2"
      refreshControl={
        <RefreshControl
          refreshing={!data && !error}
          onRefresh={() => revalidate()}
          colors={['white']}
          progressBackgroundColor={'black'}
        />
      }
    >
      <View className="mb-4 flex flex-col justify-between lg:flex-row lg:items-end">
        <Header
          subtext={
            pathname.startsWith('/profile') ? (
              <Link href={`/profile`} className="hover:underline">
                <ThemedText>{currentUser?.displayName}</ThemedText>
              </Link>
            ) : searchParams.userId ? (
              <Link href={`/users/${user?.id}`} className="hover:underline">
                <ThemedText>{user?.displayName}</ThemedText>
              </Link>
            ) : (
              ''
            )
          }
        >
          {intl.formatMessage(messages.requests)}
        </Header>
        {/* <div className="mt-2 flex flex-grow flex-col sm:flex-row lg:flex-grow-0">
          <div className="mb-2 flex flex-grow sm:mb-0 sm:mr-2 lg:flex-grow-0">
            <span className="inline-flex cursor-default items-center rounded-l-md border border-r-0 border-gray-500 bg-gray-800 px-3 text-sm text-gray-100">
              <Funnel className="h-6 w-6" />
            </span>
            <select
              id="filter"
              name="filter"
              onChange={(e) => {
                setCurrentFilter(e.target.value as Filter);
                router.push({
                  pathname,
                  query: searchParams.userId
                    ? { userId: searchParams.userId }
                    : {},
                });
              }}
              value={currentFilter}
              className="rounded-r-only"
            >
              <option value="all">
                {intl.formatMessage(globalMessages.all)}
              </option>
              <option value="pending">
                {intl.formatMessage(globalMessages.pending)}
              </option>
              <option value="approved">
                {intl.formatMessage(globalMessages.approved)}
              </option>
              <option value="completed">
                {intl.formatMessage(globalMessages.completed)}
              </option>
              <option value="processing">
                {intl.formatMessage(globalMessages.processing)}
              </option>
              <option value="failed">
                {intl.formatMessage(globalMessages.failed)}
              </option>
              <option value="available">
                {intl.formatMessage(globalMessages.available)}
              </option>
              <option value="unavailable">
                {intl.formatMessage(globalMessages.unavailable)}
              </option>
              <option value="deleted">
                {intl.formatMessage(globalMessages.deleted)}
              </option>
            </select>
          </div>
          <div className="mb-2 flex flex-grow sm:mb-0 lg:flex-grow-0">
            <span className="inline-flex cursor-default items-center rounded-l-md border border-r-0 border-gray-500 bg-gray-800 px-3 text-gray-100 sm:text-sm">
              <BarsArrowDown className="h-6 w-6" />
            </span>
            <select
              id="sort"
              name="sort"
              onChange={(e) => {
                setCurrentSort(e.target.value as Sort);
                router.push({
                  pathname,
                  query: searchParams.userId
                    ? { userId: searchParams.userId }
                    : {},
                });
              }}
              value={currentSort}
              className="rounded-r-only"
            >
              <option value="added">
                {intl.formatMessage(messages.sortAdded)}
              </option>
              <option value="modified">
                {intl.formatMessage(messages.sortModified)}
              </option>
            </select>
          </div>
        </div> */}
      </View>
      {data?.results.map((request) => {
        return (
          <TVFocusGuideView autoFocus key={`request-list-${request.id}`}>
            <View className="py-2">
              {/* <RequestItem
                request={request}
                revalidateList={() => revalidate()}
                radarrData={radarrData}
                sonarrData={sonarrData}
              /> */}
              <RequestCard request={request} canExpand />
            </View>
          </TVFocusGuideView>
        );
      })}

      {data?.results.length === 0 && (
        <View className="flex w-full flex-col items-center justify-center py-24 text-white">
          <ThemedText className="text-2xl text-gray-400">
            {intl.formatMessage(globalMessages.noresults)}
          </ThemedText>
          {currentFilter !== Filter.ALL && (
            <View className="mt-4">
              <Button onClick={() => setCurrentFilter(Filter.ALL)}>
                {intl.formatMessage(messages.showallrequests)}
              </Button>
            </View>
          )}
        </View>
      )}
      {/* <div className="actions">
        <nav
          className="mb-3 flex flex-col items-center space-y-3 sm:flex-row sm:space-y-0"
          aria-label="Pagination"
        >
          <div className="hidden lg:flex lg:flex-1">
            <p className="text-sm">
              {data.results.length > 0 &&
                intl.formatMessage(globalMessages.showingresults, {
                  from: pageIndex * currentPageSize + 1,
                  to:
                    data.results.length < currentPageSize
                      ? pageIndex * currentPageSize + data.results.length
                      : (pageIndex + 1) * currentPageSize,
                  total: data.pageInfo.results,
                  strong: (msg: React.ReactNode) => (
                    <span className="font-medium">{msg}</span>
                  ),
                })}
            </p>
          </div>
          <div className="flex justify-center sm:flex-1 sm:justify-start lg:justify-center">
            <span className="-mt-3 items-center truncate text-sm sm:mt-0">
              {intl.formatMessage(globalMessages.resultsperpage, {
                pageSize: (
                  <select
                    id="pageSize"
                    name="pageSize"
                    onChange={(e) => {
                      setCurrentPageSize(Number(e.target.value));
                      router
                        .push(
                          pathname,
                          searchParams.userId
                            ? { userId: searchParams.userId.toString() }
                            : {},
                        )
                        // .then(() => window.scrollTo(0, 0));
                    }}
                    value={currentPageSize}
                    className="short inline"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                ),
              })}
            </span>
          </div>
          <View className="flex flex-row flex-auto justify-center space-x-2 sm:flex-1 sm:justify-end">
            <Button
              disabled={!hasPrevPage}
              onClick={() => updateQueryParams('page', (page - 1).toString())}
            >
              <ChevronLeft />
              <ThemedText>{intl.formatMessage(globalMessages.previous)}</ThemedText>
            </Button>
            <Button
              disabled={!hasNextPage}
              onClick={() => updateQueryParams('page', (page + 1).toString())}
            >
              <ThemedText>{intl.formatMessage(globalMessages.next)}</ThemedText>
              <ChevronRight />
            </Button>
          </View>
        </nav>
      </div> */}
    </ScrollView>
  );
};

export default RequestList;
