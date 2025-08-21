// import Button from '@/components/Common/Button';
import Header from '@/components/Common/Header';
import ListView from '@/components/Common/ListView';
import type { FilterOptions } from '@/components/Discover/constants';
import {
  // countActiveFilters,
  prepareFilterValues,
} from '@/components/Discover/constants';
// import FilterSlideover from '@/components/Discover/FilterSlideover';
import useDiscover from '@/hooks/useDiscover';
// import { useUpdateQueryParams } from '@/hooks/useUpdateQueryParams';
import ErrorPage from '@/components/ErrorPage';
// import { BarsArrowDown, Funnel } from '@nandorojo/heroicons/24/solid';
// import type { SortOptions as TMDBSortOptions } from '@/jellyseerr/server/api/themoviedb';
import type { TvResult } from '@/jellyseerr/server/models/Search';
// import { useState } from 'react';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { useLocalSearchParams } from 'expo-router';
import { useIntl } from 'react-intl';
import { View } from 'react-native';

const messages = getJellyseerrMessages('components.Discover.DiscoverTv');

// const SortOptions: Record<string, TMDBSortOptions> = {
//   PopularityAsc: 'popularity.asc',
//   PopularityDesc: 'popularity.desc',
//   FirstAirDateAsc: 'first_air_date.asc',
//   FirstAirDateDesc: 'first_air_date.desc',
//   TmdbRatingAsc: 'vote_average.asc',
//   TmdbRatingDesc: 'vote_average.desc',
//   TitleAsc: 'original_title.asc',
//   TitleDesc: 'original_title.desc',
// } as const;

const DiscoverTv = () => {
  const intl = useIntl();
  // const [showFilters, setShowFilters] = useState(false);
  const searchParams = useLocalSearchParams();
  const preparedFilters = prepareFilterValues(searchParams);
  // const updateQueryParams = useUpdateQueryParams({});

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<TvResult, never, FilterOptions>('/api/v1/discover/tv', {
    ...preparedFilters,
  });

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  const title = intl.formatMessage(messages.discovertv);

  return (
    <>
      <View>
        {/* <div className="mt-2 flex flex-grow flex-col sm:flex-row lg:flex-grow-0">
          <div className="mb-2 flex flex-grow sm:mb-0 sm:mr-2 lg:flex-grow-0">
            <span className="inline-flex cursor-default items-center rounded-l-md border border-r-0 border-gray-500 bg-gray-800 px-3 text-gray-100 sm:text-sm">
              <BarsArrowDown className="h-6 w-6" />
            </span>
            <select
              id="sortBy"
              name="sortBy"
              className="rounded-r-only"
              value={preparedFilters.sortBy || SortOptions.PopularityDesc}
              onChange={(e) => updateQueryParams('sortBy', e.target.value)}
            >
              <option value={SortOptions.PopularityDesc}>
                {intl.formatMessage(messages.sortPopularityDesc)}
              </option>
              <option value={SortOptions.PopularityAsc}>
                {intl.formatMessage(messages.sortPopularityAsc)}
              </option>
              <option value={SortOptions.FirstAirDateDesc}>
                {intl.formatMessage(messages.sortFirstAirDateDesc)}
              </option>
              <option value={SortOptions.FirstAirDateAsc}>
                {intl.formatMessage(messages.sortFirstAirDateAsc)}
              </option>
              <option value={SortOptions.TmdbRatingDesc}>
                {intl.formatMessage(messages.sortTmdbRatingDesc)}
              </option>
              <option value={SortOptions.TmdbRatingAsc}>
                {intl.formatMessage(messages.sortTmdbRatingAsc)}
              </option>
              <option value={SortOptions.TitleAsc}>
                {intl.formatMessage(messages.sortTitleAsc)}
              </option>
              <option value={SortOptions.TitleDesc}>
                {intl.formatMessage(messages.sortTitleDesc)}
              </option>
            </select>
          </div>
          <FilterSlideover
            type="tv"
            currentFilters={preparedFilters}
            onClose={() => setShowFilters(false)}
            show={showFilters}
          />
          <div className="mb-2 flex flex-grow sm:mb-0 lg:flex-grow-0">
            <Button onClick={() => setShowFilters(true)} className="w-full">
              <Funnel />
              <span>
                {intl.formatMessage(messages.activefilters, {
                  count: countActiveFilters(preparedFilters),
                })}
              </span>
            </Button>
          </div>
        </div> */}
        <ListView
          header={<Header>{title}</Header>}
          items={titles}
          isEmpty={isEmpty}
          isReachingEnd={isReachingEnd}
          isLoading={
            isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
          }
          onScrollBottom={fetchMore}
        />
      </View>
    </>
  );
};

export default DiscoverTv;
