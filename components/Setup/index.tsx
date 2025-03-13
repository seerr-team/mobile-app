import LogoStacked from '@/assets/images/logo-stacked.png';
import Button from '@/components/Common/Button';
import TextInput from '@/components/Common/TextInput';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import { setServerUrl } from '@/store/appSettingsSlice';
import { setSettings } from '@/store/serverSettingsSlice';
import {
  ConnectionErrorType,
  getServerSettings,
  minimumServerVersion,
} from '@/utils/serverSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useDispatch } from 'react-redux';

export default function Setup() {
  const serverUrl = useServerUrl();
  const dispatch = useDispatch();
  const [error, setError] = useState<ConnectionErrorType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');

  useEffect(() => {
    if (serverUrl) {
      setInputUrl(serverUrl);
      setError(ConnectionErrorType.SERVER_NOT_REACHABLE);
    }
  }, [serverUrl]);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="min-h-screen bg-gray-900"
    >
      <ScrollView contentContainerClassName="flex-grow justify-center item-center pb-8">
        <View className="px-8 py-2">
          <Image
            className="h-64 max-w-full object-cover md:h-48"
            contentFit="contain"
            source={LogoStacked}
          />
        </View>
        <ThemedText className="mt-12 text-center text-3xl font-bold">
          Enter the server address to continue.
        </ThemedText>
        <View className="mt-8 w-full bg-gray-800/50 px-10 py-8">
          <View className="">
            <ThemedText className="mb-1 font-bold text-gray-400">
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
          <View className="mt-8 flex border-t border-gray-700 pt-5">
            <Button
              onClick={async () => {
                if (!inputUrl) return;
                setLoading(true);
                try {
                  const serverSettings = await getServerSettings(inputUrl);
                  await AsyncStorage.setItem('server-url', inputUrl);
                  dispatch(setServerUrl(inputUrl));
                  dispatch(setSettings(serverSettings));
                  setError(null);
                  router.push('/login');
                } catch (e) {
                  if (e instanceof Error) {
                    setError(e.message as ConnectionErrorType);
                  } else {
                    setError(ConnectionErrorType.SERVER_NOT_REACHABLE);
                  }
                }
                setLoading(false);
              }}
              className="self-end"
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect'}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
