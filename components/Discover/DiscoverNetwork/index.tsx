import CachedImage from '@app/components/Common/CachedImage';
import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import ErrorPage from '@app/components/ErrorPage';
import useDiscover from '@app/hooks/useDiscover';
import getSeerrMessages from '@app/utils/getSeerrMessages';
import globalMessages from '@app/utils/globalMessages';
import type { TvNetwork } from '@server/models/common';
import type { TvResult } from '@server/models/Search';
import { useLocalSearchParams } from 'expo-router';
import { useIntl } from 'react-intl';

const messages = getSeerrMessages('components.Discover.DiscoverNetwork');

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
    </>
  );
};

export default DiscoverTvNetwork;
