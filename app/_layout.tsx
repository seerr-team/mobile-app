import { useFonts } from 'expo-font';
import { router, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider, useDispatch } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { Toasts } from '@backpackapp-io/react-native-toast';
import store from '@/store';
import { setServerUrl } from '@/store/appSettingsSlice';
import { setSettings } from '@/store/serverSettingsSlice';
import { getServerSettings } from '@/utils/serverSettings';
import enLocale from '@/jellyseerr/src/i18n/locale/en.json';

import '../jellyseerr/src/styles/globals.css';

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
      if (url) {
        dispatch(setServerUrl(url));
        const serverSettings = await getServerSettings(url);
        if (serverSettings !== null) {
          setSettings(serverSettings);
          router.replace('/login');
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
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <ScrollView className="bg-gray-900 h-screen" contentContainerClassName="flex-grow justify-center">
          <Slot />
          <Toasts
            overrideDarkMode
            defaultStyle={{
              view: {
                backgroundColor: '#111827',
                borderWidth: 1,
                borderColor: '#6b7280',
                borderRadius: 8,
              },
              text: {
                color: '#ffffff',
              }
            }}
          />
        </ScrollView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayoutWithProvider() {
  const currentLocale = 'en';
  return (
    <Provider store={store}>
      <IntlProvider
        locale={currentLocale}
        defaultLocale="en"
        messages={enLocale}
      >
        <RootLayout />
      </IntlProvider>
    </Provider>
  );
}