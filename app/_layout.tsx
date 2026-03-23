import BottomNavigation from '@app/components/Layout/BottomNavigation';
import UserDropdown from '@app/components/Layout/UserDropdown';
import SearchInput from '@app/components/SearchInput';
import ToastContainer from '@app/components/ToastContainer';
import { LanguageContext } from '@app/context/LanguageContext';
import useServerUrl from '@app/hooks/useServerUrl';
import useSettings from '@app/hooks/useSettings';
import { useUser } from '@app/hooks/useUser';
import store from '@app/store';
import { setServerUrl } from '@app/store/appSettingsSlice';
import { setSettings } from '@app/store/serverSettingsSlice';
import '@app/utils/interceptCsrfToken';
import { getServerSettings } from '@app/utils/serverSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import enMessages from '@seerr/src/i18n/locale/en.json';
import '@seerr/src/styles/globals.css';
import { type AvailableLocale } from '@server/types/languages';
import axios from 'axios';
import { useFonts } from 'expo-font';
import { router, SplashScreen, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'intl-pluralrules';
import { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { TVFocusGuideView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import { configureReanimatedLogger } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    lb: require('../seerr/src/i18n/locale/lb.json'),
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
    vi: require('../seerr/src/i18n/locale/vi.json'),
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

  const appContent = (
    <View className="flex-1">
      <StatusBar style="light" />
      {user && (
        <TVFocusGuideView
          autoFocus
          className="flex flex-row items-center gap-4 border-b border-gray-600 bg-gray-900 px-6 "
          style={{
            paddingTop: insets.top + 8,
            height: insets.top + 64,
          }}
        >
          <SearchInput />
          <UserDropdown />
        </TVFocusGuideView>
      )}
      <View className="flex-1 ">
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#111827',
              paddingTop: 0,
              paddingBottom: 0,
            },
            animation: 'slide_from_right' as const,
            animationDuration: 100,
          }}
        >
          <Stack.Screen
            name="search"
            options={{
              animation: 'none',
            }}
          />
        </Stack>
      </View>
      {user && <BottomNavigation />}
    </View>
  );

  return (
    <GestureHandlerRootView>
      <SWRConfig
        value={() => ({
          fetcher: (url: string) => axios.get(url).then((res) => res.data),
        })}
      >
        <KeyboardAvoidingView
          behavior={pathname === '/setup' ? 'padding' : 'height'}
          className="flex-1 bg-gray-900"
        >
          {appContent}
        </KeyboardAvoidingView>
        <ToastContainer />
      </SWRConfig>
    </GestureHandlerRootView>
  );
}

function RootLayoutWithIntl() {
  const { user } = useUser();
  const settings = useSettings();
  const dispatch = useDispatch();
  const [fontLoaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [loadedMessages, setMessages] = useState<MessagesType>(enMessages);
  const [currentLocale, setLocale] = useState<AvailableLocale>('en');
  const [asyncStorageLoaded, setAsyncStorageLoaded] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem('server-url')]).then(([serverUrl]) => {
      if (serverUrl) {
        dispatch(setServerUrl(serverUrl));
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
    <LanguageContext.Provider value={{ locale: currentLocale, setLocale }}>
      <IntlProvider
        locale={currentLocale}
        defaultLocale="en"
        messages={loadedMessages}
      >
        <KeyboardProvider>
          <RootLayout />
        </KeyboardProvider>
      </IntlProvider>
    </LanguageContext.Provider>
  );
}

function RootLayoutWithProvider() {
  return (
    <Provider store={store}>
      <RootLayoutWithIntl />
    </Provider>
  );
}

export default RootLayoutWithProvider;
