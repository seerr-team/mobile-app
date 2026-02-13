import TvDetails from '@/components/TvDetails';
import { withAfterInteractions } from '@/utils/withAfterInteractions';

function TvPage() {
  return <TvDetails />;
}

export default withAfterInteractions(TvPage);
