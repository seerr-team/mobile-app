import { createContext, useContext } from 'react';

export const TOP_BAR_HEIGHT = 64;

export const TopBarHeightContext = createContext(0);

export const useTopBarHeight = () => useContext(TopBarHeightContext);
