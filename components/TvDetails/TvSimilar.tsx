import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import ErrorPage from '@app/components/ErrorPage';
import useDiscover from '@app/hooks/useDiscover';
import useServerUrl from '@app/hooks/useServerUrl';
import getSeerrMessages from '@app/utils/getSeerrMessages';
import type { TvResult } from '@server/models/Search';
import type { TvDetails } from '@server/models/Tv';
import { Link, useLocalSearchParams } from 'expo-router';
import { useIntl } from 'react-intl';
import useSWR from 'swr';

const messages = getSeerrMessages('components.TvDetails');

const TvSimilar = () => {
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
  } = useDiscover<TvResult>(`/api/v1/tv/${searchParams.tvId}/similar`);

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
            {intl.formatMessage(messages.similar)}
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

export default TvSimilar;
