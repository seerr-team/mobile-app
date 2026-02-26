import Login from '@app/components/Login';
import { withAfterInteractions } from '@app/utils/withAfterInteractions';

function LoginScreen() {
  return <Login />;
}

export default withAfterInteractions(LoginScreen);
