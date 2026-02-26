import Search from '@app/components/Search';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function SearchPage() {
  return <Search />;
}

export default withAfterInteractions(SearchPage);
