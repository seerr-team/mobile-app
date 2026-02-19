import UserProfile from '@/components/UserProfile';
import { withAfterInteractions } from '@/utils/withAfterInteractions';

function Profile() {
  return <UserProfile />;
}

export default withAfterInteractions(Profile);
