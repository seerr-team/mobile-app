import DiscoverTvNetwork from '@app/components/Discover/DiscoverNetwork';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function DiscoverNetwork() {
  return <DiscoverTvNetwork />;
}

export default withAfterInteractions(DiscoverNetwork);
