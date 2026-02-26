import MovieSimilar from '@app/components/MovieDetails/MovieSimilar';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function MovieSimilarPage() {
  return <MovieSimilar />;
}

export default withAfterInteractions(MovieSimilarPage);
