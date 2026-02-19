import UserSettings from '@/components/UserProfile/UserSettings';
import { withAfterInteractions } from '@/utils/withAfterInteractions';

function Profile() {
  return <UserSettings />;
}

export default withAfterInteractions(Profile);
