import Setup from '@app/components/Setup';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function IndexScreen() {
  return <Setup />;
}

export default withAfterInteractions(IndexScreen);
