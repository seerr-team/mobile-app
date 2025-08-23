import LogoStacked from '@/assets/images/logo-stacked.png';
import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import TextInput from '@/components/Common/TextInput';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import type { RootState } from '@/store';
import { setSendAnonymousData, setServerUrl } from '@/store/appSettingsSlice';
import { setSettings } from '@/store/serverSettingsSlice';
import {
  ConnectionErrorType,
  getServerSettings,
  minimumServerVersion,
} from '@/utils/serverSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function Setup() {
  const serverUrl = useServerUrl();
  const dispatch = useDispatch();
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<ConnectionErrorType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');
  const sendAnonymousData = useSelector(
    (state: RootState) => state.appSettings.sendAnonymousData
  );

  const checkServer = useCallback(
    async (url: string) => {
      if (!url) return;
      setLoading(true);
      try {
        const serverSettings = await getServerSettings(url);
        await AsyncStorage.setItem('server-url', url);
        dispatch(setServerUrl(url));
        dispatch(setSettings(serverSettings));
        setError(null);
        router.push('/login');
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message as ConnectionErrorType);
        } else {
          setError(ConnectionErrorType.SERVER_NOT_REACHABLE);
        }
        setInitialized(true);
        setLoading(false);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (serverUrl) {
      setInputUrl(serverUrl);
      checkServer(serverUrl);
    } else {
      setInitialized(true);
    }
  }, [serverUrl, checkServer]);

  useEffect(() => {
    (async () => {
      const url = await AsyncStorage.getItem('server-url');
      if (url) {
        setInputUrl(url);
      }
    })();
  }, []);

  if (!initialized) {
    return (
      <View className="flex flex-1 items-center justify-center">
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <ScrollView contentContainerClassName="flex-grow justify-center">
      <View className="relative z-40 mt-10 flex flex-col items-center px-4 sm:mx-auto sm:w-full sm:max-w-md">
        <View className="relative w-full max-w-full">
          <Image
            className="max-w-full"
            style={{ height: 192, objectFit: 'contain' }}
            source={LogoStacked}
          />
        </View>
      </View>
      <View className="relative z-50 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <ThemedText className="mt-12 text-center text-3xl font-bold">
          Enter the server address to continue.
        </ThemedText>
        <View className="mt-8 w-full bg-gray-800/50 px-10 py-8">
          <View className="">
            <ThemedText className="mb-1 text-lg font-bold text-white">
              Server address
            </ThemedText>
            <TextInput
              value={inputUrl}
              onChangeText={setInputUrl}
              placeholder="https://example.com"
              keyboardType="url"
              autoCapitalize="none"
              autoComplete="url"
            />
            {error === ConnectionErrorType.SERVER_NOT_REACHABLE && (
              <ThemedText className="mt-1.5 text-red-500">
                Unable to connect to server
              </ThemedText>
            )}
            {error === ConnectionErrorType.SERVER_NOT_INITIALIZED && (
              <ThemedText className="mt-1.5 text-red-500">
                Server not initialized
              </ThemedText>
            )}
            {error === ConnectionErrorType.SERVER_NOT_JELLYSEERR && (
              <ThemedText className="mt-1.5 text-red-500">
                Specified server is not a Jellyseerr server
              </ThemedText>
            )}
            {error === ConnectionErrorType.SERVER_NOT_UPTODATE && (
              <ThemedText className="mt-1.5 text-red-500">
                Server is not up-to-date. Minimum version required:{' '}
                {minimumServerVersion}
              </ThemedText>
            )}
          </View>
          <View className="mt-4">
            <View className="flex flex-row items-center gap-2">
              <Checkbox
                className="h-5 w-5 rounded-sm"
                value={sendAnonymousData}
                onValueChange={() =>
                  dispatch(setSendAnonymousData(!sendAnonymousData))
                }
                color={sendAnonymousData ? '#4f46e5' : '#ffffff'}
              />
              <ThemedText
                onPress={() =>
                  dispatch(setSendAnonymousData(!sendAnonymousData))
                }
                className="mb-1 text-lg font-bold text-white"
              >
                Send Anonymous Usage Data
              </ThemedText>
            </View>
            <ThemedText className="text-sm">
              Help us improve the app by sending anonymous usage data to
              Jellyseerr. This data is not shared with any third parties and is
              only used to fix bugs and improve the app. You can opt-out at any
              time in the settings.
            </ThemedText>
          </View>
          <View className="mt-8 flex border-t border-gray-700 pt-5">
            <Button
              onClick={() => checkServer(inputUrl)}
              className="self-end"
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect'}
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
