import Header from '@/components/Common/Header';
import ListView from '@/components/Common/ListView';
import ErrorPage from '@/components/ErrorPage';
import useDiscover from '@/hooks/useDiscover';
import useServerUrl from '@/hooks/useServerUrl';
import type {
  MovieResult,
  PersonResult,
  TvResult,
} from '@/jellyseerr/server/models/Search';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { useLocalSearchParams } from 'expo-router';
import { useIntl } from 'react-intl';
import { View } from 'react-native';

const messages = getJellyseerrMessages('components.Search');

const Search = () => {
  const serverUrl = useServerUrl();
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
    <View className="mt-8">
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
    </View>
  );
};

export default Search;
