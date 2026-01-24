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
import getSeerrMessages from '@/utils/getSeerrMessages';
// import { BarsArrowDown, Funnel } from '@nandorojo/heroicons/24/solid';
// import type { SortOptions as TMDBSortOptions } from '@/seerr/server/api/themoviedb';
import type { MovieResult } from '@/seerr/server/models/Search';
// import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useIntl } from 'react-intl';
import { View } from 'react-native';

const messages = getSeerrMessages('components.Discover.DiscoverMovies');

// const SortOptions: Record<string, TMDBSortOptions> = {
//   PopularityAsc: 'popularity.asc',
//   PopularityDesc: 'popularity.desc',
//   ReleaseDateAsc: 'release_date.asc',
//   ReleaseDateDesc: 'release_date.desc',
//   TmdbRatingAsc: 'vote_average.asc',
//   TmdbRatingDesc: 'vote_average.desc',
//   TitleAsc: 'original_title.asc',
//   TitleDesc: 'original_title.desc',
// } as const;

const DiscoverMovies = () => {
  const intl = useIntl();
  // const updateQueryParams = useUpdateQueryParams({});

  const searchParams = useLocalSearchParams();
  const preparedFilters = prepareFilterValues(searchParams);

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<MovieResult, unknown, FilterOptions>(
    '/api/v1/discover/movies',
    preparedFilters
  );
  // const [showFilters, setShowFilters] = useState(false);

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  const title = intl.formatMessage(messages.discovermovies);

  return (
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
            <option value={SortOptions.ReleaseDateDesc}>
              {intl.formatMessage(messages.sortReleaseDateDesc)}
            </option>
            <option value={SortOptions.ReleaseDateAsc}>
              {intl.formatMessage(messages.sortReleaseDateAsc)}
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
          type="movie"
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
        isLoading={
          isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
        }
        isReachingEnd={isReachingEnd}
        onScrollBottom={fetchMore}
      />
    </View>
  );
};

export default DiscoverMovies;
