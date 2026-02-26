import MovieRecommendations from '@app/components/MovieDetails/MovieRecommendations';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function MovieRecommendationsPage() {
  return <MovieRecommendations />;
}

export default withAfterInteractions(MovieRecommendationsPage);
