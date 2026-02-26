import Discover from '@app/components/Discover';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function Home() {
  return <Discover />;
}

export default withAfterInteractions(Home);
