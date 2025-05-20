import JellyseerrIcon from '@/assets/images/icon.png';
import LogoStacked from '@/assets/images/logo-stacked.png';
import EmbyLogo from '@/assets/services/emby-icon-only.png';
import JellyfinLogo from '@/assets/services/jellyfin-icon.png';
import PlexLogo from '@/assets/services/plex.png';
import Button from '@/components/Common/Button';
import ImageFader from '@/components/Common/ImageFader';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import useServerUrl from '@/hooks/useServerUrl';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
// import LanguagePicker from '@/components/Layout/LanguagePicker';
import ThemedText from '@/components/Common/ThemedText';
import JellyfinLogin from '@/components/Login/JellyfinLogin';
import LocalLogin from '@/components/Login/LocalLogin';
import PlexLoginButton from '@/components/Login/PlexLoginButton';
import useSettings from '@/hooks/useSettings';
import { useUser } from '@/hooks/useUser';
import { MediaServerType } from '@/jellyseerr/server/constants/server';
import { XCircle } from '@nandorojo/heroicons/24/solid';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Image, View } from 'react-native';
// import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { setServerUrl } from '@/store/appSettingsSlice';
import { useDispatch } from 'react-redux';
import useSWR from 'swr';
// import { BlurView } from 'expo-blur';
import axiosInstance from '@/utils/axios';

const messages = getJellyseerrMessages('components.Login');

const Login = () => {
  const dispatch = useDispatch();
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const settings = useSettings();
  const { user, error: userError, revalidate } = useUser();

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setProcessing] = useState(false);
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const [mediaServerLogin, setMediaServerLogin] = useState(
    settings.currentSettings.mediaServerLogin
  );

  useEffect(() => {
    (async () => {
      try {
        await axiosInstance(`${serverUrl}/api/v1/auth/me`);
        router.replace('/(tabs)');
      } catch {
        setLoaded(true);
      }
    })();
  }, [serverUrl]);

  // Effect that is triggered when the `authToken` comes back from the Plex OAuth
  // We take the token and attempt to sign in. If we get a success message, we will
  // ask swr to revalidate the user which _should_ come back with a valid user.
  useEffect(() => {
    const login = async () => {
      setProcessing(true);
      try {
        const response = await axiosInstance.post(
          serverUrl + '/api/v1/auth/plex',
          {
            authToken,
          }
        );

        if (response.data?.id) {
          revalidate();
        }
      } catch (e) {
        setError(e.response?.data?.message);
        setAuthToken(undefined);
        setProcessing(false);
      }
    };
    if (authToken) {
      login();
    }
  }, [authToken, intl, revalidate, serverUrl]);

  // Effect that is triggered whenever `useUser`'s user changes. If we get a new
  // valid user, we redirect the user to the home page as the login was successful.
  useEffect(() => {
    if (user && !userError) {
      router.replace('/(tabs)');
    }
  }, [user, userError]);

  const { data: backdrops } = useSWR<string[]>(
    serverUrl + '/api/v1/backdrops',
    {
      refreshInterval: 0,
      refreshWhenHidden: false,
      revalidateOnFocus: false,
    }
  );

  const mediaServerName =
    settings.currentSettings.mediaServerType === MediaServerType.PLEX
      ? 'Plex'
      : settings.currentSettings.mediaServerType === MediaServerType.JELLYFIN
        ? 'Jellyfin'
        : settings.currentSettings.mediaServerType === MediaServerType.EMBY
          ? 'Emby'
          : undefined;

  const MediaServerLogo =
    settings.currentSettings.mediaServerType === MediaServerType.PLEX
      ? PlexLogo
      : settings.currentSettings.mediaServerType === MediaServerType.JELLYFIN
        ? JellyfinLogo
        : settings.currentSettings.mediaServerType === MediaServerType.EMBY
          ? EmbyLogo
          : undefined;

  const isJellyfin =
    settings.currentSettings.mediaServerType === MediaServerType.JELLYFIN ||
    settings.currentSettings.mediaServerType === MediaServerType.EMBY;
  // const mediaServerLoginRef = useRef<HTMLDivElement>(null);
  // const localLoginRef = useRef<HTMLDivElement>(null);
  // const loginRef = mediaServerLogin ? mediaServerLoginRef : localLoginRef;

  const loginFormVisible =
    (isJellyfin && settings.currentSettings.mediaServerLogin) ||
    settings.currentSettings.localLogin;
  const additionalLoginOptions = [
    settings.currentSettings.mediaServerLogin &&
      (settings.currentSettings.mediaServerType === MediaServerType.PLEX ? (
        <PlexLoginButton
          key="plex"
          isProcessing={isProcessing}
          onAuthToken={(authToken) => setAuthToken(authToken)}
          large={!isJellyfin && !settings.currentSettings.localLogin}
        />
      ) : (
        settings.currentSettings.localLogin &&
        (mediaServerLogin ? (
          <Button
            key="jellyseerr"
            data-testid="jellyseerr-login-button"
            buttonType="ghost"
            className="flex w-full flex-row items-center justify-center gap-2 bg-transparent"
            onClick={() => setMediaServerLogin(false)}
          >
            <Image
              source={JellyseerrIcon}
              alt={settings.currentSettings.applicationTitle}
              className="mr-2"
              style={{ width: 20, height: 20, objectFit: 'contain' }}
            />
            <ThemedText>{settings.currentSettings.applicationTitle}</ThemedText>
          </Button>
        ) : (
          <Button
            key="mediaserver"
            data-testid="mediaserver-login-button"
            buttonType="ghost"
            className="flex w-full flex-row items-center justify-center gap-2 bg-transparent"
            onClick={() => setMediaServerLogin(true)}
          >
            <Image
              source={MediaServerLogo}
              style={{ width: 20, height: 20, objectFit: 'contain' }}
            />
            <ThemedText>{mediaServerName}</ThemedText>
          </Button>
        ))
      )),
  ].filter((o): o is JSX.Element => !!o);

  if (!loaded) {
    return (
      <View className="flex min-h-screen items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View className="relative flex min-h-screen flex-col bg-gray-900 py-14">
      <ImageFader
        backgroundImages={
          backdrops?.map(
            (backdrop) => `https://image.tmdb.org/t/p/original${backdrop}`
          ) ?? []
        }
      />
      {/* <View className="absolute top-4 right-4 z-50">
        <LanguagePicker />
      </View> */}
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
        {/* <BlurView
          className="absolute h-full w-full overflow-hidden rounded-md"
          intensity={10}
          tint="regular"
          experimentalBlurMethod="dimezisBlurView"
        /> */}
        <View className="bg-gray-800/80">
          {/* <Transition
            as="div"
            show={!!error}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          > */}
          {!!error && (
            <View className="mb-4 rounded-md bg-red-600 p-4">
              <View className="flex flex-row">
                <View className="flex-shrink-0">
                  <XCircle width={20} height={20} color="#fca5a5" />
                </View>
                <View className="ml-3">
                  <ThemedText className="text-sm font-medium text-red-300">
                    {error}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}
          <View className="px-10 py-8">
            <View className="button-container">
              {isJellyfin &&
              (mediaServerLogin || !settings.currentSettings.localLogin) ? (
                <JellyfinLogin
                  serverType={settings.currentSettings.mediaServerType}
                  revalidate={revalidate}
                />
              ) : (
                settings.currentSettings.localLogin && (
                  <LocalLogin revalidate={revalidate} />
                )
              )}
            </View>
            {additionalLoginOptions.length > 0 &&
              (loginFormVisible ? (
                <View className="flex flex-row items-center py-5">
                  <View className="flex-grow border-t border-gray-600"></View>
                  <ThemedText className="mx-2 flex-shrink text-sm text-gray-400">
                    {intl.formatMessage(messages.orsigninwith)}
                  </ThemedText>
                  <View className="flex-grow border-t border-gray-600"></View>
                </View>
              ) : (
                <ThemedText className="mb-6 text-center text-lg font-bold text-neutral-200">
                  {intl.formatMessage(messages.signinheader)}
                </ThemedText>
              ))}

            <View
              className={`flew-row flex w-full flex-wrap gap-2 ${
                !loginFormVisible ? 'flex-col' : ''
              }`}
            >
              {additionalLoginOptions}
            </View>
          </View>
        </View>
      </View>
      <View className="mt-4 flex flex-row justify-center">
        <Button
          buttonType="ghost"
          onClick={() => {
            dispatch(setServerUrl(''));
            router.push('/');
          }}
          className="mt-4"
        >
          Use another server
        </Button>
      </View>
    </View>
  );
};

export default Login;
