import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import ErrorPage from '@app/components/ErrorPage';
import useDiscover from '@app/hooks/useDiscover';
import getSeerrMessages from '@app/utils/getSeerrMessages';
import type {
  MovieResult,
  PersonResult,
  TvResult,
} from '@server/models/Search';
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
