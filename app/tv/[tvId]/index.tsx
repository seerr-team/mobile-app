import TvDetails from '@app/components/TvDetails';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function TvPage() {
  return <TvDetails />;
}

export default withAfterInteractions(TvPage);
