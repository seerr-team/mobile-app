import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import ErrorPage from '@app/components/ErrorPage';
import useDiscover from '@app/hooks/useDiscover';
import useServerUrl from '@app/hooks/useServerUrl';
import getSeerrMessages from '@app/utils/getSeerrMessages';
import type { MovieDetails } from '@server/models/Movie';
import type { MovieResult } from '@server/models/Search';
import { Link, useLocalSearchParams } from 'expo-router';
import { useIntl } from 'react-intl';
import useSWR from 'swr';

const messages = getSeerrMessages('components.MovieDetails');

const MovieRecommendations = () => {
  const serverUrl = useServerUrl();
  const searchParams = useLocalSearchParams();
  const intl = useIntl();
  const { data: movieData } = useSWR<MovieDetails>(
    `${serverUrl}/api/v1/movie/${searchParams.movieId}`
  );
  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<MovieResult>(
    `/api/v1/movie/${searchParams.movieId}/recommendations`
  );

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
                href={`/movie/${movieData?.id}`}
                className="text-lg text-gray-400 hover:underline"
              >
                {movieData?.title}
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

export default MovieRecommendations;
