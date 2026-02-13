import RequestList from '@/components/RequestList';
import { withAfterInteractions } from '@/utils/withAfterInteractions';

function Requests() {
  return <RequestList />;
}

export default withAfterInteractions(Requests);
