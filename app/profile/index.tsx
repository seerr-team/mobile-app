import UserProfile from '@app/components/UserProfile';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function Profile() {
  return <UserProfile />;
}

export default withAfterInteractions(Profile);
