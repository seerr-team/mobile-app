import { configureStore } from '@reduxjs/toolkit';
import appSettingsSlice from './appSettingsSlice';

export default configureStore({
  reducer: {
    appSettings: appSettingsSlice,
  },
});