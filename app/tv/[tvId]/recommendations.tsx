import TvRecommendations from '@app/components/TvDetails/TvRecommendations';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function TvRecommendationsPage() {
  return <TvRecommendations />;
}

export default withAfterInteractions(TvRecommendationsPage);
