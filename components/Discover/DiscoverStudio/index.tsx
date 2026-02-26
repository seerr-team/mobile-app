import CachedImage from '@app/components/Common/CachedImage';
import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import ErrorPage from '@app/components/ErrorPage';
import useDiscover from '@app/hooks/useDiscover';
import getSeerrMessages from '@app/utils/getSeerrMessages';
import globalMessages from '@app/utils/globalMessages';
import type { ProductionCompany } from '@server/models/common';
import type { MovieResult } from '@server/models/Search';
import { useLocalSearchParams } from 'expo-router';
import { useIntl } from 'react-intl';

const messages = getSeerrMessages('components.Discover.DiscoverStudio');

const DiscoverMovieStudio = () => {
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
  } = useDiscover<MovieResult, { studio: ProductionCompany }>(
    `/api/v1/discover/movies/studio/${searchParams.studioId}`
  );

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  const title = isLoadingInitialData
    ? intl.formatMessage(globalMessages.loading)
    : intl.formatMessage(messages.studioMovies, {
        studio: firstResultData?.studio.name,
      });

  return (
    <>
      <ListView
        header={
          <Header>
            {firstResultData?.studio.logoPath ? (
              <CachedImage
                type="tmdb"
                src={`https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bababa)${firstResultData.studio.logoPath}`}
                alt={firstResultData.studio.name}
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

export default DiscoverMovieStudio;
