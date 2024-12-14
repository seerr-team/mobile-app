import { View, Image } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import ThemedText from '@/components/Common/ThemedText';
import TextInput from '@/components/Common/TextInput';
import Button from '@/components/Common/Button';
import { isServerReachable } from '@/utils/serverSettings';
import { setServerUrl } from '@/store/appSettingsSlice';
import { router } from 'expo-router';
import type { RootState } from '@/store';

enum ErrorType {
  NoServerUrl,
  ServerNotInitialized,
  ServerNotReachable,
}

export default function Setup() {
  const serverUrl = useSelector((state: RootState) => state.appSettings.serverUrl);
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
    <View className="flex flex-col h-full justify-center items-center">
      <View className="px-8">
        <Image
          className="h-64 max-w-full object-cover"
          style={{ resizeMode: 'contain' }}
          source={require('@/assets/images/logo-stacked.png')}
        />
      </View>
      <ThemedText className="mt-12 text-3xl font-bold text-center">Enter the server address to continue.</ThemedText>
      <View className="mt-8 w-full bg-gray-800/50 px-10 py-8">
        <View className="">
          <ThemedText className="font-bold text-gray-400 mb-1">Server address</ThemedText>
          <TextInput
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="https://example.com"
            keyboardType='url'
          />
          {error === ErrorType.ServerNotReachable && (
            <ThemedText className="text-red-500 mt-1.5">Unable to connect to server</ThemedText>
          )}
        </View>
        <View className="mt-8 border-t border-gray-700 pt-5 flex">
          <Button
            onClick={async () => {
              if (!inputUrl) return;
              setLoading(true);
              if (await isServerReachable(inputUrl)) {
                await AsyncStorage.setItem('server-url', inputUrl);
                dispatch(setServerUrl(inputUrl));
                setError(null);
                router.push('/login');
              }
              else {
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
