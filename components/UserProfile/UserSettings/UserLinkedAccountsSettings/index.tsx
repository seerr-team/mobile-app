import EmbyLogo from '@/assets/services/emby-icon-only.png';
import JellyfinLogo from '@/assets/services/jellyfin-icon.png';
import PlexLogo from '@/assets/services/plex.png';
import Alert from '@/components/Common/Alert';
import ButtonWithDropdown from '@/components/Common/ButtonWithDropdown';
import ConfirmButton from '@/components/Common/ConfirmButton';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import useSettings from '@/hooks/useSettings';
import { Permission, UserType, useUser } from '@/hooks/useUser';
import { MediaServerType } from '@/seerr/server/constants/server';
import getSeerrMessages from '@/utils/getSeerrMessages';
import globalMessages from '@/utils/globalMessages';
import PlexOAuth from '@/utils/plex';
import { Trash } from '@nandorojo/heroicons/24/solid';
import axios from 'axios';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import useSWR from 'swr';
import LinkJellyfinModal from './LinkJellyfinModal';

const messages = getSeerrMessages(
  'components.UserProfile.UserSettings.UserLinkedAccountsSettings'
);

const plexOAuth = new PlexOAuth();

enum LinkedAccountType {
  Plex = 'Plex',
  Jellyfin = 'Jellyfin',
  Emby = 'Emby',
}

type LinkedAccount = {
  type: LinkedAccountType;
  username: string;
};

const UserLinkedAccountsSettings = () => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const settings = useSettings();
  const { user: currentUser } = useUser();
  const {
    user,
    hasPermission,
    revalidate: revalidateUser,
    // } = useUser({ id: Number(router.query.userId) });
  } = useUser();
  const { data: passwordInfo } = useSWR<{ hasPassword: boolean }>(
    user ? `${serverUrl}/api/v1/user/${user?.id}/settings/password` : null
  );
  const [showJellyfinModal, setShowJellyfinModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applicationName = settings.currentSettings.applicationTitle;

  const accounts: LinkedAccount[] = useMemo(() => {
    const accounts: LinkedAccount[] = [];
    if (!user) return accounts;
    if (user.userType === UserType.PLEX && user.plexUsername)
      accounts.push({
        type: LinkedAccountType.Plex,
        username: user.plexUsername,
      });
    if (user.userType === UserType.EMBY && user.jellyfinUsername)
      accounts.push({
        type: LinkedAccountType.Emby,
        username: user.jellyfinUsername,
      });
    if (user.userType === UserType.JELLYFIN && user.jellyfinUsername)
      accounts.push({
        type: LinkedAccountType.Jellyfin,
        username: user.jellyfinUsername,
      });
    return accounts;
  }, [user]);

  const linkPlexAccount = async () => {
    setError(null);
    try {
      const authToken = await plexOAuth.login();
      await axios.post(
        `${serverUrl}/api/v1/user/${user?.id}/settings/linked-accounts/plex`,
        {
          authToken,
        }
      );
      await revalidateUser();
    } catch (e) {
      if (e?.response?.status === 401) {
        setError(intl.formatMessage(messages.plexErrorUnauthorized));
      } else if (e?.response?.status === 422) {
        setError(intl.formatMessage(messages.plexErrorExists));
      } else {
        setError(intl.formatMessage(messages.errorUnknown));
      }
      setError(intl.formatMessage(messages.errorUnknown));
    }
  };

  const linkable = [
    {
      name: 'Plex',
      action: () => linkPlexAccount(),
      hide:
        settings.currentSettings.mediaServerType !== MediaServerType.PLEX ||
        accounts.some((a) => a.type === LinkedAccountType.Plex),
    },
    {
      name: 'Jellyfin',
      action: () => setShowJellyfinModal(true),
      hide:
        settings.currentSettings.mediaServerType !== MediaServerType.JELLYFIN ||
        accounts.some((a) => a.type === LinkedAccountType.Jellyfin),
    },
    {
      name: 'Emby',
      action: () => setShowJellyfinModal(true),
      hide:
        settings.currentSettings.mediaServerType !== MediaServerType.EMBY ||
        accounts.some((a) => a.type === LinkedAccountType.Emby),
    },
  ].filter((l) => !l.hide);

  const deleteRequest = async (account: string) => {
    try {
      await axios.delete(
        `${serverUrl}/api/v1/user/${user?.id}/settings/linked-accounts/${account}`
      );
    } catch {
      setError(intl.formatMessage(messages.deleteFailed));
    }

    await revalidateUser();
  };

  if (
    currentUser?.id !== user?.id &&
    hasPermission(Permission.ADMIN) &&
    currentUser?.id !== 1
  ) {
    return (
      <>
        <View className="mb-6">
          <ThemedText className="heading">
            {intl.formatMessage(messages.linkedAccounts)}
          </ThemedText>
        </View>
        <Alert
          title={intl.formatMessage(messages.noPermissionDescription)}
          type="error"
        />
      </>
    );
  }

  const enableMediaServerUnlink = user?.id !== 1 && passwordInfo?.hasPassword;

  return (
    <View className="px-4">
      {/* <View className="mb-6 flex flex-row items-end justify-between"> */}
      <View className="mb-6 flex gap-2">
        <View>
          <ThemedText className="heading">
            {intl.formatMessage(messages.linkedAccounts)}
          </ThemedText>
          <ThemedText className="description mt-1 max-w-4xl text-sm leading-5 text-gray-400">
            {intl.formatMessage(messages.linkedAccountsHint, {
              applicationName,
            })}
          </ThemedText>
        </View>
        {currentUser?.id === user?.id && !!linkable.length && (
          <View className="relative">
            {/* <Dropdown text="Link Account" buttonType="ghost">
              {linkable.map(({ name, action }) => (
                <Dropdown.Item key={name} onClick={action}>
                  {name}
                </Dropdown.Item>
              ))}
            </Dropdown> */}
            <ButtonWithDropdown
              buttonType="ghost"
              text={<ThemedText>Link Account</ThemedText>}
              disabled={true}
              popoverStyle={{ marginTop: 50, marginLeft: -92 }}
            >
              {(close) =>
                linkable.map(({ name, action }) => (
                  <ButtonWithDropdown.Item
                    key={name}
                    onPress={() => {
                      close();
                      action();
                    }}
                    buttonType="ghost"
                  >
                    <ThemedText>{name}</ThemedText>
                  </ButtonWithDropdown.Item>
                ))
              }
            </ButtonWithDropdown>
          </View>
        )}
      </View>
      {error && <Alert title={error} type="error" />}
      {accounts.length ? (
        <View className="space-y-4">
          {accounts.map((acct, i) => (
            <View
              key={i}
              className="flex flex-row items-center gap-4 overflow-hidden rounded-lg border border-gray-700 bg-gray-800 bg-opacity-50 px-4 py-5 shadow sm:p-6"
            >
              <View className="w-12">
                {acct.type === LinkedAccountType.Plex ? (
                  <View className="flex aspect-square h-full flex-row items-center justify-center rounded-full bg-neutral-800">
                    <Image
                      source={PlexLogo}
                      contentFit="contain"
                      style={{ width: 48, height: 48 }}
                    />
                  </View>
                ) : acct.type === LinkedAccountType.Emby ? (
                  <Image
                    source={EmbyLogo}
                    contentFit="contain"
                    style={{ width: 48, height: 48 }}
                  />
                ) : (
                  <Image
                    source={JellyfinLogo}
                    contentFit="contain"
                    style={{ width: 48, height: 48 }}
                  />
                )}
              </View>
              <View>
                <ThemedText className="truncate text-sm font-bold text-gray-300">
                  {acct.type}
                </ThemedText>
                <ThemedText className="text-xl font-semibold text-white">
                  {acct.username}
                </ThemedText>
              </View>
              <View className="flex-grow" />
              {enableMediaServerUnlink && (
                <ConfirmButton
                  onClick={() => {
                    deleteRequest(
                      acct.type === LinkedAccountType.Plex ? 'plex' : 'jellyfin'
                    );
                  }}
                  confirmText={intl.formatMessage(globalMessages.areyousure)}
                  className="flex flex-row items-center gap-2"
                >
                  <Trash />
                  <ThemedText>
                    {intl.formatMessage(globalMessages.delete)}
                  </ThemedText>
                </ConfirmButton>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View className="mt-4 md:py-12">
          <ThemedText className="text-center text-xl font-semibold text-gray-400">
            {intl.formatMessage(messages.noLinkedAccounts)}
          </ThemedText>
        </View>
      )}

      <LinkJellyfinModal
        show={showJellyfinModal}
        onClose={() => setShowJellyfinModal(false)}
        onSave={() => {
          setShowJellyfinModal(false);
          revalidateUser();
        }}
      />
    </View>
  );
};

export default UserLinkedAccountsSettings;
