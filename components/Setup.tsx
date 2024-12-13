import { View, Image, Animated, Easing } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { fetch } from 'expo/fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import { ThemedText } from './ThemedText';
import TextInput from './Common/TextInput';
import Button from './Common/Button';

enum ErrorType {
  NoServerUrl,
  ServerNotInitialized,
  ServerNotReachable,
}

export type SetupProps = {
  children: React.ReactNode;
};

async function isServerReachable(serverUrl: string) {
  try {
    if (serverUrl.endsWith('/')) {
      serverUrl = serverUrl.slice(0, -1);
    }
    console.log('Checking server reachability:', `${serverUrl}/api/v1/settings/public`);
    const abortController = new AbortController();
    setTimeout(() => abortController.abort(), 5000);
    const res = await fetch(`${serverUrl}/api/v1/settings/public`, {
      signal: abortController.signal,
    });
    if (!res.ok) throw new Error('Server not reachable');
    const data = await res.json();
    return data.initialized === true;
  }
  catch (e) {
    console.error(e);
  }
  return false;
}

export default function Setup({ children }: SetupProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorType | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  const [inputUrl, setInputUrl] = useState<string>('');

  const spinValue = useRef(new Animated.Value(0)).current;

  async function loadServerUrl() {
    const url = await AsyncStorage.getItem('server-url');
    if (!url) {
      setError(ErrorType.NoServerUrl);
      setLoading(false);
      return;
    }
    if (await isServerReachable(url)) {
      setServerUrl(url);
    }
    else {
      setError(ErrorType.ServerNotReachable);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadServerUrl();
  }, []);

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );
    spinAnimation.start();
    return () => spinAnimation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // if (serverUrl) {
  //   return children;
  // }

  return (
    <View className="flex flex-col h-full justify-center items-center">
      <View className="px-8">
        <Image
          className="h-64 max-w-full object-cover"
          style={{ resizeMode: 'contain' }}
          source={require('@/assets/images/logo-stacked.png')}
        />
      </View>
      {(loading && !inputUrl) && (
        <ThemedText className="mt-12 text-3xl font-bold text-center">
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <AntDesign name="loading1" size={32} color="white" />
          </Animated.View>
        </ThemedText>
      )}
      {!(loading && !inputUrl) && <>
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
                console.log('Connecting to server:', inputUrl);
                if (!inputUrl) return;
                setLoading(true);
                if (await isServerReachable(inputUrl)) {
                  console.log('Server reachable');
                  await AsyncStorage.setItem('server-url', inputUrl);
                  setServerUrl(inputUrl);
                  setError(null);
                }
                else {
                  console.log('Server not reachable');
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
      </>}
    </View>
  );
}
