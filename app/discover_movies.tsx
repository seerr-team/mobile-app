import DiscoverMovies from '@app/components/Discover/DiscoverMovies';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function DiscoverMoviesPage() {
  return <DiscoverMovies />;
}

export default withAfterInteractions(DiscoverMoviesPage);
