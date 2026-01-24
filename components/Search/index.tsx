import Header from '@/components/Common/Header';
import ListView from '@/components/Common/ListView';
import ErrorPage from '@/components/ErrorPage';
import useDiscover from '@/hooks/useDiscover';
import type {
  MovieResult,
  PersonResult,
  TvResult,
} from '@/seerr/server/models/Search';
import getSeerrMessages from '@/utils/getSeerrMessages';
import { useLocalSearchParams } from 'expo-router';
import { useIntl } from 'react-intl';

const messages = getSeerrMessages('components.Search');

const Search = () => {
  const intl = useIntl();
  const searchParams = useLocalSearchParams();

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<MovieResult | TvResult | PersonResult>(
    `/api/v1/search`,
    {
      query: searchParams.query,
    },
    { hideAvailable: false }
  );

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  return (
    <ListView
      header={<Header>{intl.formatMessage(messages.searchresults)}</Header>}
      items={titles}
      isEmpty={isEmpty}
      isLoading={
        isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
      }
      isReachingEnd={isReachingEnd}
      onScrollBottom={fetchMore}
    />
  );
};

export default Search;
