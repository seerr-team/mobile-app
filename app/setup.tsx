import Setup from '@/components/Setup';
import { withAfterInteractions } from '@/utils/withAfterInteractions';

function IndexScreen() {
  return <Setup />;
}

export default withAfterInteractions(IndexScreen);
