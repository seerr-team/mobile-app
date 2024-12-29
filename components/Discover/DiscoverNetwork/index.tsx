import CachedImage from '@/components/Common/CachedImage';
import Header from '@/components/Common/Header';
import ListView from '@/components/Common/ListView';
import ErrorPage from '@/components/ErrorPage';
import useDiscover from '@/hooks/useDiscover';
import type { TvNetwork } from '@/jellyseerr/server/models/common';
import type { TvResult } from '@/jellyseerr/server/models/Search';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import globalMessages from '@/utils/globalMessages';
import { useLocalSearchParams } from 'expo-router';
import { useIntl } from 'react-intl';
import { View } from 'react-native';

const messages = getJellyseerrMessages('components.Discover.DiscoverNetwork');

const DiscoverTvNetwork = () => {
  const searchParams = useLocalSearchParams();
  const intl = useIntl();

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
    firstResultData,
  } = useDiscover<TvResult, { network: TvNetwork }>(
    `/api/v1/discover/tv/network/${searchParams.networkId}`
  );

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  const title = isLoadingInitialData
    ? intl.formatMessage(globalMessages.loading)
    : intl.formatMessage(messages.networkSeries, {
        network: firstResultData?.network.name,
      });

  return (
    <>
      <View className="mt-8">
        <ListView
          header={
            <Header>
              {firstResultData?.network.logoPath ? (
                <CachedImage
                  type="tmdb"
                  src={`https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bababa)${firstResultData.network.logoPath}`}
                  alt={firstResultData.network.name}
                  style={{ height: 128 }}
                  contentFit="contain"
                />
              ) : (
                title
              )}
            </Header>
          }
          items={titles}
          isEmpty={isEmpty}
          isLoading={
            isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
          }
          isReachingEnd={isReachingEnd}
          onScrollBottom={fetchMore}
        />
      </View>
    </>
  );
};

export default DiscoverTvNetwork;
