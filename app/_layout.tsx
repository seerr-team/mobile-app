import { useFonts } from 'expo-font';
import { router, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider, useDispatch } from 'react-redux';
import store from '@/store';
import { setServerUrl } from '@/store/appSettingsSlice';
import isServerReachable from '@/utils/serverReachable';

import '../jellyseerr/src/styles/globals.css';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const dispatch = useDispatch();
  const [fontLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [loaded, setLoaded] = useState(true);

  useEffect(() => {
    (async () => {
      const url = await AsyncStorage.getItem('server-url');
      console.log('Server URL:', url);
      if (url) {
        dispatch(setServerUrl(url));
        if (await isServerReachable(url)) {
          router.replace('/home');
        }
        else {
          router.replace('/setup');
        }
        setLoaded(true);
      }
      else {
        router.replace('/setup');
      }
    })();
  }, []);

  useEffect(() => {
    if (fontLoaded && loaded) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded, loaded]);

  if (!fontLoaded || !loaded) {
    return null;
  }

  return (
    <View className="bg-gray-900 h-screen">
      <Slot />
    </View>
  );
}

export default function RootLayoutWithProvider() {
  return (
    <Provider store={store}>
      <RootLayout />
    </Provider>
  );
}