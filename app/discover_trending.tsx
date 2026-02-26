import Trending from '@app/components/Discover/Trending';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function DiscoverTrending() {
  return <Trending />;
}

export default withAfterInteractions(DiscoverTrending);
