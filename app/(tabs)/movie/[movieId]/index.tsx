import LoadingSpinner from '@/components/Common/LoadingSpinner';
import MovieDetails from '@/components/MovieDetails';
import useServerUrl from '@/hooks/useServerUrl';
import type { MovieDetails as MovieDetailsType } from '@/jellyseerr/server/models/Movie';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

export default function MoviePage() {
  const searchParams = useLocalSearchParams();
  const serverUrl = useServerUrl();
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `${serverUrl}/api/v1/movie/${searchParams.movieId}`
      );
      if (!res.ok) throw new Error();
      const movie: MovieDetailsType = await res.json();
      setMovie(movie);
    })();
  }, [searchParams.movieId, serverUrl]);

  if (!movie) {
    return <LoadingSpinner />;
  }

  return <MovieDetails movie={movie} />;
}
