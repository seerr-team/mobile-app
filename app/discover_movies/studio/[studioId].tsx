import DiscoverStudio from '@app/components/Discover/DiscoverStudio';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function DiscoverMoviesStudio() {
  return <DiscoverStudio />;
}

export default withAfterInteractions(DiscoverMoviesStudio);
