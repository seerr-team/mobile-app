import type { PublicSettingsResponse } from '@/seerr/server/interfaces/api/settingsInterfaces';
import type { RootState } from '@/store';
import { useSelector } from 'react-redux';

interface SettingsHooks {
  currentSettings: PublicSettingsResponse;
}

const useSettings = (): SettingsHooks => {
  const currentSettings = useSelector(
    (state: RootState) => state.serverSettings.settings
  )!;
  return { currentSettings };
};

export default useSettings;
