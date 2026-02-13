import MovieRecommendations from '@/components/MovieDetails/MovieRecommendations';
import { withAfterInteractions } from '@/utils/withAfterInteractions';

function MovieRecommendationsPage() {
  return <MovieRecommendations />;
}

export default withAfterInteractions(MovieRecommendationsPage);
