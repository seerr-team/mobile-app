import ErrorPage from '@/components/ErrorPage';
import { withAfterInteractions } from '@/utils/withAfterInteractions';

function NotFound() {
  return <ErrorPage statusCode={404} />;
}

export default withAfterInteractions(NotFound);
