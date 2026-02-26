import UserSettings from '@app/components/UserProfile/UserSettings';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function Profile() {
  return <UserSettings />;
}

export default withAfterInteractions(Profile);
