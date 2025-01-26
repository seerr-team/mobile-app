import Accordion from '@/components/Common/Accordion';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import useSettings from '@/hooks/useSettings';
import { MediaServerType } from '@/jellyseerr/server/constants/server';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import JellyfinLogin from './JellyfinLogin';
import LocalLogin from './LocalLogin';

const messages = getJellyseerrMessages('components.Login');

export default function Login() {
  const serverUrl = useServerUrl();
  const settings = useSettings();
  const intl = useIntl();
  const [loaded, setLoaded] = useState(false);

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
        router.replace('/(tabs)');
      } else {
        setLoaded(true);
      }
    })();
  }, [serverUrl]);

  if (!loaded) {
    return (
      <View className="flex min-h-screen items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="min-h-screen bg-gray-900"
    >
      <ScrollView contentContainerClassName="flex-grow justify-center item-center">
        <View className="px-8 py-2">
          <Image
            className="h-64 max-w-full object-cover md:h-48"
            style={{ resizeMode: 'contain' }}
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('@/assets/images/logo-stacked.png')}
          />
        </View>
        <ThemedText className="mt-12 text-center text-3xl font-bold">
          Sign in to continue.
        </ThemedText>
        <View className="mt-8 w-full bg-gray-800/50">
          <Accordion single atLeastOne>
            {({ openIndexes, handleClick, AccordionContent }) => (
              <>
                <Pressable
                  className="w-full cursor-default bg-gray-800 bg-opacity-70 py-2"
                  onPress={() => handleClick(0)}
                >
                  <ThemedText
                    className={`text-center font-bold text-gray-400 ${openIndexes.includes(0) ? 'text-indigo-500' : ''}`}
                  >
                    {settings.currentSettings.mediaServerType ===
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
                      <ThemedText
                        className={`text-center font-bold text-gray-400 ${openIndexes.includes(1) ? 'text-indigo-500' : ''}`}
                      >
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
