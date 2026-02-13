import BottomNavigation from '@/components/Layout/BottomNavigation';
import UserDropdown from '@/components/Layout/UserDropdown';
import SearchInput from '@/components/SearchInput';
import ToastContainer from '@/components/ToastContainer';
import useServerUrl from '@/hooks/useServerUrl';
import useSettings from '@/hooks/useSettings';
import { useUser } from '@/hooks/useUser';
import { type AvailableLocale } from '@/seerr/server/types/languages';
import enMessages from '@/seerr/src/i18n/locale/en.json';
import '@/seerr/src/styles/globals.css';
import store from '@/store';
import { setSendAnonymousData, setServerUrl } from '@/store/appSettingsSlice';
import { setSettings } from '@/store/serverSettingsSlice';
import '@/utils/interceptCsrfToken';
import {
  disableSentry,
  initSentry,
  navigationIntegration,
} from '@/utils/sentry';
import { getServerSettings } from '@/utils/serverSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import axios from 'axios';
import { useFonts } from 'expo-font';
import {
  router,
  SplashScreen,
  Stack,
  useNavigationContainerRef,
  usePathname,
} from 'expo-router';
import 'intl-pluralrules';
import { useEffect, useMemo, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import { configureReanimatedLogger } from 'react-native-reanimated';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import RelativeTimeFormat from 'relative-time-format';
import en from 'relative-time-format/locale/en';
import { mutate, SWRConfig } from 'swr';

type MessagesType = Record<string, string>;

axios.defaults.withCredentials = true;

export const loadLocaleData = async (locale: string): Promise<MessagesType> => {
  const locales: Record<string, MessagesType> = {
    ar: require('../seerr/src/i18n/locale/ar.json'),
    bg: require('../seerr/src/i18n/locale/bg.json'),
    ca: require('../seerr/src/i18n/locale/ca.json'),
    cs: require('../seerr/src/i18n/locale/cs.json'),
    da: require('../seerr/src/i18n/locale/da.json'),
    de: require('../seerr/src/i18n/locale/de.json'),
    el: require('../seerr/src/i18n/locale/el.json'),
    es: require('../seerr/src/i18n/locale/es.json'),
    'es-MX': require('../seerr/src/i18n/locale/es_MX.json'),
    fi: require('../seerr/src/i18n/locale/fi.json'),
    fr: require('../seerr/src/i18n/locale/fr.json'),
    he: require('../seerr/src/i18n/locale/he.json'),
    hi: require('../seerr/src/i18n/locale/hi.json'),
    hr: require('../seerr/src/i18n/locale/hr.json'),
    hu: require('../seerr/src/i18n/locale/hu.json'),
    it: require('../seerr/src/i18n/locale/it.json'),
    ja: require('../seerr/src/i18n/locale/ja.json'),
    ko: require('../seerr/src/i18n/locale/ko.json'),
    lt: require('../seerr/src/i18n/locale/lt.json'),
    'nb-NO': require('../seerr/src/i18n/locale/nb_NO.json'),
    nl: require('../seerr/src/i18n/locale/nl.json'),
    pl: require('../seerr/src/i18n/locale/pl.json'),
    'pt-BR': require('../seerr/src/i18n/locale/pt_BR.json'),
    'pt-PT': require('../seerr/src/i18n/locale/pt_PT.json'),
    ro: require('../seerr/src/i18n/locale/ro.json'),
    ru: require('../seerr/src/i18n/locale/ru.json'),
    sq: require('../seerr/src/i18n/locale/sq.json'),
    sr: require('../seerr/src/i18n/locale/sr.json'),
    sv: require('../seerr/src/i18n/locale/sv.json'),
    tr: require('../seerr/src/i18n/locale/tr.json'),
    uk: require('../seerr/src/i18n/locale/uk.json'),
    'zh-CN': require('../seerr/src/i18n/locale/zh_Hans.json'),
    'zh-TW': require('../seerr/src/i18n/locale/zh_Hant.json'),
    default: require('../seerr/src/i18n/locale/en.json'),
  };

  return locales[locale] || locales.default;
};

RelativeTimeFormat.addLocale(en);

configureReanimatedLogger({
  strict: false,
});

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const pathname = usePathname();
  const settings = useSettings();
  const serverUrl = useServerUrl();
  const { user, revalidate } = useUser();
  const [loaded, setLoaded] = useState(false);

  const insets = useSafeAreaInsets();
  const contentStyle = useMemo(
    () => ({
      backgroundColor: '#111827',
      paddingTop: insets.top + 56,
      paddingBottom: insets.bottom + 56,
    }),
    [insets]
  );

  const swrConfig = useMemo(
    () => ({
      fetcher: (url: string) => axios.get(url).then((res) => res.data),
    }),
    []
  );

  const stackScreenOptions = useMemo(
    () => ({
      headerShown: false,
      contentStyle,
      animation: 'slide_from_right' as const,
      animationDuration: 100,
    }),
    [contentStyle]
  );

  useEffect(() => {
    if (serverUrl && settings.currentSettings && !user) {
      if (pathname !== '/login') {
        router.replace('/login');
      }
    } else if (!serverUrl || !settings.currentSettings || !user) {
      if (pathname !== '/setup') {
        router.replace('/setup');
      }
    }
  }, [pathname, serverUrl, settings.currentSettings, user]);

  useEffect(() => {
    if (serverUrl) {
      getServerSettings(serverUrl)
        .then(async (serverSettings) => {
          try {
            await mutate(
              `${serverUrl}/api/v1/auth/me`,
              axios.get(`${serverUrl}/api/v1/auth/me`),
              true
            );
            await revalidate();
          } catch {
            /* empty */
          }
          if (
            JSON.stringify(serverSettings) !==
            JSON.stringify(settings.currentSettings)
          ) {
            store.dispatch(setSettings(serverSettings));
          }
          setLoaded(true);
        })
        .catch(() => {
          setLoaded(true);
        });
    } else {
      setLoaded(true);
    }
  }, [serverUrl, revalidate, settings.currentSettings]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hide();
    }
  }, [loaded]);

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <SWRConfig value={swrConfig}>
          <KeyboardAvoidingView
            behavior="padding"
            className="flex-1 bg-gray-900"
          >
            <View className="flex-1">
              {user && (
                <View
                  className="absolute left-0 right-0 top-0 z-50 flex flex-row items-center gap-4 border-b border-gray-600 bg-gray-900 px-6 pb-2"
                  style={{
                    paddingTop: insets.top + 8,
                    height: insets.top + 64,
                  }}
                >
                  <SearchInput />
                  <UserDropdown />
                </View>
              )}
              <Stack screenOptions={stackScreenOptions}>
                <Stack.Screen name="index" />
                <Stack.Screen
                  name="setup"
                  options={{
                    contentStyle: { backgroundColor: '#111827' },
                  }}
                />
                <Stack.Screen
                  name="login"
                  options={{
                    contentStyle: { backgroundColor: '#111827' },
                  }}
                />
                <Stack.Screen name="discover_movies" />
                <Stack.Screen name="discover_tv" />
                <Stack.Screen name="requests" />
                <Stack.Screen
                  name="search"
                  options={{
                    animation: 'none',
                  }}
                />
                <Stack.Screen name="discover_trending" />
                <Stack.Screen name="discover_movies/studio/[studioId]" />
                <Stack.Screen name="discover_tv/network/[networkId]" />
                <Stack.Screen name="discover_watchlist" />
                <Stack.Screen name="movie/[movieId]/index" />
                <Stack.Screen name="movie/[movieId]/recommendations" />
                <Stack.Screen name="movie/[movieId]/similar" />
                <Stack.Screen name="tv/[tvId]/index" />
                <Stack.Screen name="tv/[tvId]/recommendations" />
                <Stack.Screen name="tv/[tvId]/similar" />
                <Stack.Screen name="person/[personId]/index" />
                <Stack.Screen name="collection/[collectionId]/index" />
              </Stack>
              {user && <BottomNavigation />}
            </View>
          </KeyboardAvoidingView>
          <ToastContainer />
        </SWRConfig>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutWithIntl() {
  const { user } = useUser();
  const settings = useSettings();
  const dispatch = useDispatch();
  const ref = useNavigationContainerRef();
  const [fontLoaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [loadedMessages, setMessages] = useState<MessagesType>(enMessages);
  const [currentLocale, setLocale] = useState<AvailableLocale>('en');
  const [asyncStorageLoaded, setAsyncStorageLoaded] = useState(false);

  useEffect(() => {
    if (ref?.current) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('server-url'),
      AsyncStorage.getItem('send-anonymous-data'),
    ]).then(([serverUrl, sendAnonymousData]) => {
      if (serverUrl) {
        dispatch(setServerUrl(serverUrl));
      }
      if (sendAnonymousData) {
        dispatch(setSendAnonymousData(sendAnonymousData === 'true'));
        if (sendAnonymousData === 'true') {
          initSentry();
        } else {
          disableSentry();
        }
      }
      setAsyncStorageLoaded(true);
    });
  }, [dispatch]);

  useEffect(() => {
    const newLocale = user?.settings?.locale
      ? user.settings.locale
      : settings.currentSettings?.locale;
    if (setLocale && newLocale) {
      setLocale(newLocale as AvailableLocale);
    }
  }, [setLocale, settings.currentSettings?.locale, user]);

  useEffect(() => {
    loadLocaleData(currentLocale).then(setMessages);
  }, [currentLocale]);

  if (!asyncStorageLoaded || !fontLoaded) {
    return null;
  }

  return (
    <IntlProvider
      locale={currentLocale}
      defaultLocale="en"
      messages={loadedMessages}
    >
      <KeyboardProvider>
        <RootLayout />
      </KeyboardProvider>
    </IntlProvider>
  );
}

function RootLayoutWithProvider() {
  return (
    <Provider store={store}>
      <RootLayoutWithIntl />
    </Provider>
  );
}

export default Sentry.wrap(RootLayoutWithProvider);
