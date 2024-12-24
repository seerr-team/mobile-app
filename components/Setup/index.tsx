import Button from '@/components/Common/Button';
import TextInput from '@/components/Common/TextInput';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import { setServerUrl } from '@/store/appSettingsSlice';
import { setSettings } from '@/store/serverSettingsSlice';
import { getServerSettings } from '@/utils/serverSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { useDispatch } from 'react-redux';

enum ErrorType {
  NoServerUrl,
  ServerNotInitialized,
  ServerNotReachable,
}

export default function Setup() {
  const serverUrl = useServerUrl();
  const dispatch = useDispatch();
  const [error, setError] = useState<ErrorType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');

  useEffect(() => {
    if (serverUrl) {
      setInputUrl(serverUrl);
      setError(ErrorType.ServerNotReachable);
    }
  }, [serverUrl]);

  return (
    <View className="flex h-full flex-col items-center justify-center">
      <View className="px-8">
        <Image
          className="h-64 max-w-full object-cover"
          style={{ resizeMode: 'contain' }}
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require('@/assets/images/logo-stacked.png')}
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
          />
          {error === ErrorType.ServerNotReachable && (
            <ThemedText className="mt-1.5 text-red-500">
              Unable to connect to server
            </ThemedText>
          )}
        </View>
        <View className="mt-8 flex border-t border-gray-700 pt-5">
          <Button
            onClick={async () => {
              if (!inputUrl) return;
              setLoading(true);
              const serverSettings = await getServerSettings(inputUrl);
              if (serverSettings) {
                await AsyncStorage.setItem('server-url', inputUrl);
                dispatch(setServerUrl(inputUrl));
                dispatch(setSettings(serverSettings));
                setError(null);
                router.push('/login');
              } else {
                setError(ErrorType.ServerNotReachable);
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
    </View>
  );
}
