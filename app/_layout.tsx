import useSettings from '@/hooks/useSettings';
import enLocale from '@/jellyseerr/src/i18n/locale/en.json';
import store, { type RootState } from '@/store';
import { setSendAnonymousData, setServerUrl } from '@/store/appSettingsSlice';
import { setSettings } from '@/store/serverSettingsSlice';
import {
  disableSentry,
  initSentry,
  navigationIntegration,
} from '@/utils/sentry';
import { getServerSettings } from '@/utils/serverSettings';
import { Toasts } from '@backpackapp-io/react-native-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import { useFonts } from 'expo-font';
import { router, Slot, useNavigationContainerRef } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'intl-pluralrules';
import { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { configureReanimatedLogger } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import RelativeTimeFormat from 'relative-time-format';
import en from 'relative-time-format/locale/en';
import { SWRConfig } from 'swr';

import '@/jellyseerr/src/styles/globals.css';

RelativeTimeFormat.addLocale(en);

configureReanimatedLogger({
  strict: false,
});

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const ref = useNavigationContainerRef();
  const dispatch = useDispatch();
  const [fontLoaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const settings = useSettings();
  const [loaded, setLoaded] = useState(true);
  const sendAnonymousData = useSelector(
    (state: RootState) => state.appSettings.sendAnonymousData
  );

  useEffect(() => {
    (async () => {
      dispatch(
        setSendAnonymousData(
          JSON.parse(
            (await AsyncStorage.getItem('send-anonymous-data')) || 'false'
          )
        )
      );
    })();
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      await AsyncStorage.setItem(
        'send-anonymous-data',
        JSON.stringify(sendAnonymousData)
      );
      if (sendAnonymousData) {
        initSentry();
      } else {
        disableSentry();
      }
    })();
  }, [sendAnonymousData]);

  useEffect(() => {
    if (ref?.current) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  useEffect(() => {
    (async () => {
      const url = await AsyncStorage.getItem('server-url');
      if (url) {
        dispatch(setServerUrl(url));
        try {
          const serverSettings = await getServerSettings(url);
          dispatch(setSettings(serverSettings));
        } catch {
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
          <View className="bg-gray-900">
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

function RootLayoutWithProvider() {
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

export default Sentry.wrap(RootLayoutWithProvider);
