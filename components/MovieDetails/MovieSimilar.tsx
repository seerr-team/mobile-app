import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import Error from '@app/components/ErrorPage';
import useDiscover from '@app/hooks/useDiscover';
import useServerUrl from '@app/hooks/useServerUrl';
import getSeerrMessages from '@app/utils/getSeerrMessages';
import type { MovieDetails } from '@server/models/Movie';
import type { MovieResult } from '@server/models/Search';
import { Link, useLocalSearchParams } from 'expo-router';
import { useIntl } from 'react-intl';
import useSWR from 'swr';

const messages = getSeerrMessages('components.MovieDetails');

const MovieSimilar = () => {
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
  } = useDiscover<MovieResult>(`/api/v1/movie/${searchParams.movieId}/similar`);

  if (error) {
    return <Error statusCode={500} />;
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
            {intl.formatMessage(messages.similar)}
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

export default MovieSimilar;
