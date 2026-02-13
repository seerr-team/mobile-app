import Login from '@/components/Login';
import { withAfterInteractions } from '@/utils/withAfterInteractions';

function LoginScreen() {
  return <Login />;
}

export default withAfterInteractions(LoginScreen);
