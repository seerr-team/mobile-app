import enLocale from '@/jellyseerr/src/i18n/locale/en.json';
import store from '@/store';
import { setServerUrl } from '@/store/appSettingsSlice';
import { setSettings } from '@/store/serverSettingsSlice';
import { getServerSettings } from '@/utils/serverSettings';
import { Toasts } from '@backpackapp-io/react-native-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { router, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';

import useSettings from '@/hooks/useSettings';
import '../jellyseerr/src/styles/globals.css';

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const dispatch = useDispatch();
  const [fontLoaded] = useFonts({
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
  }, []);

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
        <ScrollView
          className="h-screen bg-gray-900"
          contentContainerClassName="flex-grow justify-center"
        >
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
