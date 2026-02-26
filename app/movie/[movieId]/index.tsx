import MovieDetails from '@app/components/MovieDetails';
import { withAfterInteractions } from '@app/utils/withAfterInteractions'; // Adjust path as needed

const MoviePage = () => {
  return <MovieDetails />;
};

export default withAfterInteractions(MoviePage);
