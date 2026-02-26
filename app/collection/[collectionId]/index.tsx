import CollectionDetails from '@app/components/CollectionDetails';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function CollectionPage() {
  return <CollectionDetails />;
}

export default withAfterInteractions(CollectionPage);
