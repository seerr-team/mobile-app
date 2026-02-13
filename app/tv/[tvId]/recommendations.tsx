import TvRecommendations from '@/components/TvDetails/TvRecommendations';
import { withAfterInteractions } from '@/utils/withAfterInteractions';

function TvRecommendationsPage() {
  return <TvRecommendations />;
}

export default withAfterInteractions(TvRecommendationsPage);
