import Header from '@/components/Common/Header';
import ListView from '@/components/Common/ListView';
import ErrorPage from '@/components/ErrorPage';
import useDiscover from '@/hooks/useDiscover';
import type {
  MovieResult,
  PersonResult,
  TvResult,
} from '@/jellyseerr/server/models/Search';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { useIntl } from 'react-intl';

const messages = getJellyseerrMessages('components.Discover');

const Trending = () => {
  const intl = useIntl();
  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<MovieResult | TvResult | PersonResult>(
    '/api/v1/discover/trending'
  );

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  return (
    <ListView
      header={<Header>{intl.formatMessage(messages.trending)}</Header>}
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

export default Trending;
