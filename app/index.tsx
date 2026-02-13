import Discover from '@/components/Discover';
import { withAfterInteractions } from '@/utils/withAfterInteractions';

function Home() {
  return <Discover />;
}

export default withAfterInteractions(Home);
