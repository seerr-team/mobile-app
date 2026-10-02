import { createContext, useContext } from 'react';
import { Platform } from 'react-native';

export const TOP_BAR_HEIGHT = 64;

export const TopBarHeightContext = createContext(0);

export const useTopBarHeight = () => useContext(TopBarHeightContext);

export const useTopBarFadingEdge = () => {
  const topBarHeight = useTopBarHeight();
  return Platform.OS === 'android' && Platform.isTV && topBarHeight > 0
    ? { start: topBarHeight, end: 0 }
    : undefined;
};
