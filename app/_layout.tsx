import useSettings from '@/hooks/useSettings';
import { useUser } from '@/hooks/useUser';
import enMessages from '@/jellyseerr/src/i18n/locale/en.json';
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
import { KeyboardAvoidingView, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { configureReanimatedLogger } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import RelativeTimeFormat from 'relative-time-format';
import en from 'relative-time-format/locale/en';
import { SWRConfig } from 'swr';

import type { AvailableLocale } from '@/jellyseerr/src/context/LanguageContext';
import '@/jellyseerr/src/styles/globals.css';

type MessagesType = Record<string, string>;

const loadLocaleData = async (locale: string): Promise<MessagesType> => {
  switch (locale) {
    case 'ar':
      return (await import('../jellyseerr/src/i18n/locale/ar.json')).default;
    case 'bg':
      return (await import('../jellyseerr/src/i18n/locale/bg.json')).default;
    case 'ca':
      return (await import('../jellyseerr/src/i18n/locale/ca.json')).default;
    case 'cs':
      return (await import('../jellyseerr/src/i18n/locale/cs.json')).default;
    case 'da':
      return (await import('../jellyseerr/src/i18n/locale/da.json')).default;
    case 'de':
      return (await import('../jellyseerr/src/i18n/locale/de.json')).default;
    case 'el':
      return (await import('../jellyseerr/src/i18n/locale/el.json')).default;
    case 'es':
      return (await import('../jellyseerr/src/i18n/locale/es.json')).default;
    case 'es-MX':
      return (await import('../jellyseerr/src/i18n/locale/es_MX.json')).default;
    case 'fi':
      return (await import('../jellyseerr/src/i18n/locale/fi.json')).default;
    case 'fr':
      return (await import('../jellyseerr/src/i18n/locale/fr.json')).default;
    case 'he':
      return (await import('../jellyseerr/src/i18n/locale/he.json')).default;
    case 'hi':
      return (await import('../jellyseerr/src/i18n/locale/hi.json')).default;
    case 'hr':
      return (await import('../jellyseerr/src/i18n/locale/hr.json')).default;
    case 'hu':
      return (await import('../jellyseerr/src/i18n/locale/hu.json')).default;
    case 'it':
      return (await import('../jellyseerr/src/i18n/locale/it.json')).default;
    case 'ja':
      return (await import('../jellyseerr/src/i18n/locale/ja.json')).default;
    case 'ko':
      return (await import('../jellyseerr/src/i18n/locale/ko.json')).default;
    case 'lt':
      return (await import('../jellyseerr/src/i18n/locale/lt.json')).default;
    case 'nb-NO':
      return (await import('../jellyseerr/src/i18n/locale/nb_NO.json')).default;
    case 'nl':
      return (await import('../jellyseerr/src/i18n/locale/nl.json')).default;
    case 'pl':
      return (await import('../jellyseerr/src/i18n/locale/pl.json')).default;
    case 'pt-BR':
      return (await import('../jellyseerr/src/i18n/locale/pt_BR.json')).default;
    case 'pt-PT':
      return (await import('../jellyseerr/src/i18n/locale/pt_PT.json')).default;
    case 'ro':
      return (await import('../jellyseerr/src/i18n/locale/ro.json')).default;
    case 'ru':
      return (await import('../jellyseerr/src/i18n/locale/ru.json')).default;
    case 'sq':
      return (await import('../jellyseerr/src/i18n/locale/sq.json')).default;
    case 'sr':
      return (await import('../jellyseerr/src/i18n/locale/sr.json')).default;
    case 'sv':
      return (await import('../jellyseerr/src/i18n/locale/sv.json')).default;
    case 'tr':
      return (await import('../jellyseerr/src/i18n/locale/tr.json')).default;
    case 'uk':
      return (await import('../jellyseerr/src/i18n/locale/uk.json')).default;
    case 'zh-CN':
      return (await import('../jellyseerr/src/i18n/locale/zh_Hans.json'))
        .default;
    case 'zh-TW':
      return (await import('../jellyseerr/src/i18n/locale/zh_Hant.json'))
        .default;
    default:
      return (await import('../jellyseerr/src/i18n/locale/en.json')).default;
  }
};

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
          <KeyboardAvoidingView
            behavior="padding"
            className="flex-1 bg-gray-900"
          >
            <ScrollView contentContainerClassName="flex-grow justify-center item-center">
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
          </KeyboardAvoidingView>
        </SWRConfig>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutWithIntl() {
  const { user } = useUser();
  const settings = useSettings();

  const [loadedMessages, setMessages] = useState<MessagesType>(enMessages);
  const [currentLocale, setLocale] = useState<AvailableLocale>('en');

  useEffect(() => {
    if (setLocale) {
      setLocale(
        (user?.settings?.locale
          ? user.settings.locale
          : settings.currentSettings?.locale) as AvailableLocale
      );
    }
  }, [setLocale, settings.currentSettings?.locale, user]);

  useEffect(() => {
    loadLocaleData(currentLocale).then(setMessages);
  }, [currentLocale]);

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
