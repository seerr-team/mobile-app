import type { PublicSettingsResponse } from "@/jellyseerr/server/interfaces/api/settingsInterfaces"
import type { RootState } from "@/store";
import { useSelector } from "react-redux";


interface SettingsHooks {
  currentSettings: PublicSettingsResponse;
}

const useSettings = (): SettingsHooks => {
  const currentSettings = useSelector((state: RootState) => state.serverSettings.settings);

  return {
    currentSettings: currentSettings!, // settings are already loaded from the main _layout.tsx
  };
}

export default useSettings;