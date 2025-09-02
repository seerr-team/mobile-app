import Header from '@/components/Common/Header';
import ListView from '@/components/Common/ListView';
import ErrorPage from '@/components/ErrorPage';
import useDiscover from '@/hooks/useDiscover';
import useServerUrl from '@/hooks/useServerUrl';
import type { TvResult } from '@/jellyseerr/server/models/Search';
import type { TvDetails } from '@/jellyseerr/server/models/Tv';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { Link, useLocalSearchParams } from 'expo-router';
import { useIntl } from 'react-intl';
import useSWR from 'swr';

const messages = getJellyseerrMessages('components.TvDetails');

const TvRecommendations = () => {
  const serverUrl = useServerUrl();
  const searchParams = useLocalSearchParams();
  const intl = useIntl();
  const { data: tvData } = useSWR<TvDetails>(
    `${serverUrl}/api/v1/tv/${searchParams.tvId}`
  );
  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<TvResult>(`/api/v1/tv/${searchParams.tvId}/recommendations`);

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  return (
    <>
      <ListView
        header={
          <Header
            subtext={
              <Link
                href={`/tv/${tvData?.id}`}
                className="text-lg text-gray-400 hover:underline"
              >
                {tvData?.name}
              </Link>
            }
          >
            {intl.formatMessage(messages.recommendations)}
          </Header>
        }
        items={titles}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
        isLoading={
          isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
        }
        onScrollBottom={fetchMore}
      />
    </>
  );
};

export default TvRecommendations;
