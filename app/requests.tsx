import RequestList from '@app/components/RequestList';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function Requests() {
  return <RequestList />;
}

export default withAfterInteractions(Requests);
