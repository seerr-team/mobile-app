import type { RootState } from '@app/store';
import { useSelector } from 'react-redux';

const useServerUrl = () => {
  const serverUrl = useSelector(
    (state: RootState) => state.appSettings.serverUrl
  );
  return serverUrl;
};

export default useServerUrl;
