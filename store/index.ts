import { configureStore } from '@reduxjs/toolkit';
import appSettingsSlice, { type AppSettingsState } from './appSettingsSlice';
import serverSettingsSlice, {
  type ServerSettingsState,
} from './serverSettingsSlice';

export interface RootState {
  appSettings: AppSettingsState;
  serverSettings: ServerSettingsState;
}

export default configureStore({
  reducer: {
    appSettings: appSettingsSlice,
    serverSettings: serverSettingsSlice,
  },
});
