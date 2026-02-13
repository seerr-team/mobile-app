import MovieDetails from '@/components/MovieDetails';
import { withAfterInteractions } from '@/utils/withAfterInteractions'; // Adjust path as needed

const MoviePage = () => {
  return <MovieDetails />;
};

export default withAfterInteractions(MoviePage);
