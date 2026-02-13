import MovieSimilar from '@/components/MovieDetails/MovieSimilar';
import { withAfterInteractions } from '@/utils/withAfterInteractions';

function MovieSimilarPage() {
  return <MovieSimilar />;
}

export default withAfterInteractions(MovieSimilarPage);
