import { useSelector } from "react-redux";
import type { PublicSettingsResponse } from "@/jellyseerr/server/interfaces/api/settingsInterfaces"
import type { RootState } from "@/store";

interface SettingsHooks {
  currentSettings: PublicSettingsResponse;
}

const useSettings = (): SettingsHooks => {
  const currentSettings = useSelector((state: RootState) => state.serverSettings.settings)!;
  return { currentSettings };
}

export default useSettings;