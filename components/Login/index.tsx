import { View, Image, Pressable, Animated, Easing } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { useIntl } from 'react-intl';
import ThemedText from '@/components/Common/ThemedText';
import Accordion from '@/components/Common/Accordion';
import JellyfinLogin from './JellyfinLogin';
import LocalLogin from './LocalLogin';
import { MediaServerType } from '@/jellyseerr/server/constants/server';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import useSettings from '@/hooks/useSettings';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import AntDesign from '@expo/vector-icons/AntDesign';

const messages = getJellyseerrMessages('components.Login');

export default function Login() {
  const serverUrl = useSelector((state: RootState) => state.appSettings.serverUrl);
  const settings = useSettings();
  const intl = useIntl();
  const [loaded, setLoaded] = useState(false);

  const spinValue = useRef(new Animated.Value(0)).current;

  const mediaServerFormatValues = {
    mediaServerName:
      settings.currentSettings.mediaServerType === MediaServerType.JELLYFIN
        ? 'Jellyfin'
        : settings.currentSettings.mediaServerType === MediaServerType.EMBY
        ? 'Emby'
        : undefined,
  };

  useEffect(() => {
    (async () => {
      const res = await fetch(`${serverUrl}/api/v1/auth/me`);
      if (res.ok) {
        router.replace('/home');
      }
      else {
        setLoaded(true);
      }
    })();
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

  if (!loaded) {
    return (
      <ThemedText className="mt-12 text-3xl font-bold text-center">
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <AntDesign name="loading1" size={32} color="white" />
        </Animated.View>
      </ThemedText>
    );
  }

  return (
    <View>
      <View className="px-8">
        <Image
          className="h-64 max-w-full object-cover"
          style={{ resizeMode: 'contain' }}
          source={require('@/assets/images/logo-stacked.png')}
        />
      </View>
      <ThemedText className="mt-12 text-3xl font-bold text-center">Sign in to continue.</ThemedText>
      <View className="mt-8 w-full bg-gray-800/50">
        <Accordion single atLeastOne>
          {({ openIndexes, handleClick, AccordionContent }) => (
            <>
              <Pressable
                className="w-full cursor-default bg-gray-800 bg-opacity-70 py-2"
                onPress={() => handleClick(0)}
              >
                <ThemedText className={`text-center font-bold text-gray-400 ${openIndexes.includes(0) ? "text-indigo-500" : ""}`}>
                  {settings.currentSettings.mediaServerType ==
                  MediaServerType.PLEX
                    ? intl.formatMessage(messages.signinwithplex)
                    : intl.formatMessage(
                        messages.signinwithjellyfin,
                        mediaServerFormatValues
                      )}
                </ThemedText>
              </Pressable>
              <AccordionContent isOpen={openIndexes.includes(0)}>
                <View className="px-10 py-8">
                  {/* {settings.currentSettings.mediaServerType ==
                  MediaServerType.PLEX ? (
                    <PlexLoginButton
                      isProcessing={isProcessing}
                      onAuthToken={(authToken) => setAuthToken(authToken)}
                    />
                  ) : (
                    <JellyfinLogin revalidate={revalidate} />
                  )} */}
                  <JellyfinLogin />
                </View>
              </AccordionContent>
              {settings.currentSettings.localLogin && (
                <View>
                  <Pressable
                    className="w-full cursor-default bg-gray-800 bg-opacity-70 py-2"
                    onPress={() => handleClick(1)}
                  >
                    <ThemedText className={`text-center font-bold text-gray-400 ${openIndexes.includes(1) ? "text-indigo-500" : ""}`}>
                      {intl.formatMessage(messages.signinwithoverseerr, {
                        applicationTitle:
                          settings.currentSettings.applicationTitle,
                      })}
                    </ThemedText>
                  </Pressable>
                  <AccordionContent isOpen={openIndexes.includes(1)}>
                    <View className="px-10 py-8">
                      <LocalLogin />
                    </View>
                  </AccordionContent>
                </View>
              )}
            </>
          )}
        </Accordion>
      </View>
    </View>
  );
}
