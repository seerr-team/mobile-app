import ErrorPage from '@app/components/ErrorPage';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function NotFound() {
  return <ErrorPage statusCode={404} />;
}

export default withAfterInteractions(NotFound);
