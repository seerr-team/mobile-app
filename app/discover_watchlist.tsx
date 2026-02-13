import DiscoverWatchlist from '@/components/Discover/DiscoverWatchlist';
import { withAfterInteractions } from '@/utils/withAfterInteractions';

function DiscoverWatchlistPage() {
  return <DiscoverWatchlist />;
}

export default withAfterInteractions(DiscoverWatchlistPage);
