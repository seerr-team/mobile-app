import CollectionDetails from '@/components/CollectionDetails';
import { withAfterInteractions } from '@/utils/withAfterInteractions';

function CollectionPage() {
  return <CollectionDetails />;
}

export default withAfterInteractions(CollectionPage);
