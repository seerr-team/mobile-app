import type { RootState } from '@app/store';
import type { PublicSettingsResponse } from '@server/interfaces/api/settingsInterfaces';
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
