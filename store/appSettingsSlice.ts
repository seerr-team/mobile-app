import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export interface AppSettingsState {
  serverUrl: string;
  sendAnonymousData: boolean;
}

export const initialState: AppSettingsState = {
  serverUrl: '',
  sendAnonymousData: false,
};

const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState,
  reducers: {
    setServerUrl(state, action: PayloadAction<string>) {
      state.serverUrl = action.payload;
    },
    setSendAnonymousData(state, action: PayloadAction<boolean>) {
      state.sendAnonymousData = action.payload;
    },
  },
});

export const { setServerUrl, setSendAnonymousData } = appSettingsSlice.actions;

export default appSettingsSlice.reducer;
