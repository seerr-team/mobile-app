import BottomNavigation from '@/components/Layout/BottomNavigation';
import UserDropdown from '@/components/Layout/UserDropdown';
import SearchInput from '@/components/SearchInput';
import ToastContainer from '@/components/ToastContainer';
import useServerUrl from '@/hooks/useServerUrl';
import useSettings from '@/hooks/useSettings';
import { useUser } from '@/hooks/useUser';
import type { AvailableLocale } from '@/jellyseerr/src/context/LanguageContext';
import enMessages from '@/jellyseerr/src/i18n/locale/en.json';
import '@/jellyseerr/src/styles/globals.css';
import store from '@/store';
import { setSendAnonymousData, setServerUrl } from '@/store/appSettingsSlice';
import { setSettings } from '@/store/serverSettingsSlice';
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
import { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { KeyboardAvoidingView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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

const loadLocaleData = async (locale: string): Promise<MessagesType> => {
  switch (locale) {
    case 'ar':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/ar.json')).default;
    case 'bg':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/bg.json')).default;
    case 'ca':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/ca.json')).default;
    case 'cs':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/cs.json')).default;
    case 'da':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/da.json')).default;
    case 'de':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/de.json')).default;
    case 'el':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/el.json')).default;
    case 'es':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/es.json')).default;
    case 'es-MX':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/es_MX.json')).default;
    case 'fi':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/fi.json')).default;
    case 'fr':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/fr.json')).default;
    case 'he':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/he.json')).default;
    case 'hi':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/hi.json')).default;
    case 'hr':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/hr.json')).default;
    case 'hu':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/hu.json')).default;
    case 'it':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/it.json')).default;
    case 'ja':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/ja.json')).default;
    case 'ko':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/ko.json')).default;
    case 'lt':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/lt.json')).default;
    case 'nb-NO':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/nb_NO.json')).default;
    case 'nl':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/nl.json')).default;
    case 'pl':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/pl.json')).default;
    case 'pt-BR':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/pt_BR.json')).default;
    case 'pt-PT':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/pt_PT.json')).default;
    case 'ro':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/ro.json')).default;
    case 'ru':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/ru.json')).default;
    case 'sq':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/sq.json')).default;
    case 'sr':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/sr.json')).default;
    case 'sv':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/sv.json')).default;
    case 'tr':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/tr.json')).default;
    case 'uk':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/uk.json')).default;
    case 'zh-CN':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/zh_Hans.json'))
        .default;
    case 'zh-TW':
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/zh_Hant.json'))
        .default;
    default:
      // @ts-expect-error not an ES module
      return (await import('../jellyseerr/src/i18n/locale/en.json')).default;
  }
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
  const contentStyle = {
    backgroundColor: '#111827',
    paddingTop: insets.top + 67,
    paddingBottom: 56 + insets.bottom,
  };

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
        <SWRConfig
          value={{
            fetcher: (url) => axios.get(url).then((res) => res.data),
          }}
        >
          <KeyboardAvoidingView
            behavior="padding"
            className="flex-1 bg-gray-900"
          >
            <View className="flex-1">
              {user && (
                <View
                  className="h-18 absolute left-0 right-0 top-0 z-50 flex flex-row items-center gap-4 border-b border-gray-600 bg-gray-900 px-6 pb-2"
                  style={{ paddingTop: insets.top + 16 }}
                >
                  <SearchInput />
                  <UserDropdown />
                </View>
              )}
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle:
                    pathname === '/setup' || pathname === '/login'
                      ? {
                          backgroundColor: '#111827',
                          // paddingTop: 0,
                          // paddingBottom: 0,
                        }
                      : contentStyle,
                  animation: 'slide_from_right',
                  animationDuration: 100,
                }}
              >
                <Stack.Screen
                  name="index"
                  options={{
                    contentStyle,
                  }}
                />
                <Stack.Screen name="setup" />
                <Stack.Screen name="login" />
                <Stack.Screen
                  name="discover_movies"
                  options={{
                    contentStyle,
                  }}
                />
                <Stack.Screen
                  name="discover_tv"
                  options={{
                    contentStyle,
                  }}
                />
                <Stack.Screen
                  name="requests"
                  options={{
                    contentStyle,
                  }}
                />
                <Stack.Screen
                  name="search"
                  options={{
                    contentStyle,
                    animation: 'none',
                  }}
                />
                <Stack.Screen
                  name="discover_trending"
                  options={{
                    contentStyle,
                  }}
                />
                <Stack.Screen
                  name="discover_movies/studio/[studioId]"
                  options={{
                    contentStyle,
                  }}
                />
                <Stack.Screen
                  name="discover_tv/network/[networkId]"
                  options={{
                    contentStyle,
                  }}
                />
                <Stack.Screen
                  name="discover_watchlist"
                  options={{
                    contentStyle,
                  }}
                />
                <Stack.Screen
                  name="movie/[movieId]/index"
                  options={{
                    contentStyle,
                  }}
                />
                <Stack.Screen
                  name="movie/[movieId]/recommendations"
                  options={{
                    contentStyle,
                  }}
                />
                <Stack.Screen
                  name="movie/[movieId]/similar"
                  options={{
                    contentStyle,
                  }}
                />
                <Stack.Screen
                  name="tv/[tvId]/index"
                  options={{
                    contentStyle,
                  }}
                />
                <Stack.Screen
                  name="tv/[tvId]/recommendations"
                  options={{
                    contentStyle,
                  }}
                />
                <Stack.Screen
                  name="tv/[tvId]/similar"
                  options={{
                    contentStyle,
                  }}
                />
                <Stack.Screen
                  name="person/[personId]/index"
                  options={{
                    contentStyle,
                  }}
                />
                <Stack.Screen
                  name="collection/[collectionId]/index"
                  options={{
                    contentStyle,
                  }}
                />
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
      <RootLayout />
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
