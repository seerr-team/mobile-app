import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { PublicSettingsResponse } from '@server/interfaces/api/settingsInterfaces';

export interface ServerSettingsState {
  settings: PublicSettingsResponse | null;
}

export const initialState: ServerSettingsState = {
  settings: null,
};

const serverSettingsSlice = createSlice({
  name: 'serverSettings',
  initialState,
  reducers: {
    setSettings(state, action: PayloadAction<PublicSettingsResponse>) {
      state.settings = action.payload;
    },
  },
});

export const { setSettings } = serverSettingsSlice.actions;

export default serverSettingsSlice.reducer;
