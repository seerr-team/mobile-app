import DiscoverWatchlist from '@app/components/Discover/DiscoverWatchlist';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function DiscoverWatchlistPage() {
  return <DiscoverWatchlist />;
}

export default withAfterInteractions(DiscoverWatchlistPage);
