import DiscoverMovies from '@/components/Discover/DiscoverMovies';
import { withAfterInteractions } from '@/utils/withAfterInteractions';

function DiscoverMoviesPage() {
  return <DiscoverMovies />;
}

export default withAfterInteractions(DiscoverMoviesPage);
