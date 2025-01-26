import useSettings from '@/hooks/useSettings';
import enLocale from '@/jellyseerr/src/i18n/locale/en.json';
import store from '@/store';
import { setServerUrl } from '@/store/appSettingsSlice';
import { setSettings } from '@/store/serverSettingsSlice';
import { getServerSettings } from '@/utils/serverSettings';
import { Toasts } from '@backpackapp-io/react-native-toast';
import '@formatjs/intl-displaynames/polyfill-force';
import '@formatjs/intl-locale/polyfill';
import '@formatjs/intl-relativetimeformat/locale-data/en';
import '@formatjs/intl-relativetimeformat/polyfill';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { router, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'intl-pluralrules';
import { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { configureReanimatedLogger } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import { SWRConfig } from 'swr';

import '@/jellyseerr/src/styles/globals.css';

configureReanimatedLogger({
  strict: false,
});

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const dispatch = useDispatch();
  const [fontLoaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const settings = useSettings();
  const [loaded, setLoaded] = useState(true);

  useEffect(() => {
    (async () => {
      const url = await AsyncStorage.getItem('server-url');
      if (url) {
        dispatch(setServerUrl(url));
        const serverSettings = await getServerSettings(url);
        if (serverSettings !== null) {
          dispatch(setSettings(serverSettings));
        } else {
          router.replace('/');
          setLoaded(true);
        }
      } else {
        router.replace('/');
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    if (settings.currentSettings) {
      router.replace('/login');
      setLoaded(true);
    }
  }, [settings]);

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
        <SWRConfig
          value={{
            fetcher: async (resource, init) => {
              const res = await fetch(resource, init);
              if (!res.ok) throw new Error();
              return await res.json();
            },
          }}
        >
          <View>
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
                },
              }}
            />
          </View>
        </SWRConfig>
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
