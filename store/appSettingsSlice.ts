import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppSettingsState {
  serverUrl: string;
}

export const initialState: AppSettingsState = {
  serverUrl: '',
};

const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState,
  reducers: {
    setServerUrl(state, action: PayloadAction<string>) {
      state.serverUrl = action.payload;
    },
  },
});

export const { setServerUrl } = appSettingsSlice.actions;

export default appSettingsSlice.reducer;
