import PersonDetails from '@app/components/PersonDetails';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

const PersonDetailsPage = () => {
  return <PersonDetails />;
};

export default withAfterInteractions(PersonDetailsPage);
