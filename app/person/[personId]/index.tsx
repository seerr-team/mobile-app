import PersonDetails from '@/components/PersonDetails';
import { withAfterInteractions } from '@/utils/withAfterInteractions';

const PersonDetailsPage = () => {
  return <PersonDetails />;
};

export default withAfterInteractions(PersonDetailsPage);
