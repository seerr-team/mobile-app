import Button from '@/components/Common/Button';
import CachedImage from '@/components/Common/CachedImage';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import type { User as UserType } from '@/hooks/useUser';
import { Permission, useUser } from '@/hooks/useUser';
import getSeerrMessages from '@/utils/getSeerrMessages';
import { ArrowRightOnRectangle } from '@nandorojo/heroicons/24/outline';
import { Cog, User } from '@nandorojo/heroicons/24/solid';
import axios from 'axios';
import { Link, router } from 'expo-router';
import { useIntl } from 'react-intl';
import { Platform, View } from 'react-native';
import { mutate } from 'swr';

const messages = getSeerrMessages('components.UserProfile.ProfileHeader');
const dropdownMessages = getSeerrMessages('components.Layout.UserDropdown');

interface ProfileHeaderProps {
  user: UserType;
  isSettingsPage?: boolean;
}

const ProfileHeader = ({ user, isSettingsPage }: ProfileHeaderProps) => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const { user: loggedInUser, hasPermission, revalidate } = useUser();

  const subtextItems: React.ReactNode[] = [
    intl.formatMessage(messages.joindate, {
      joindate: intl.formatDate(user.createdAt, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    }),
  ];

  if (hasPermission(Permission.MANAGE_REQUESTS)) {
    subtextItems.push(intl.formatMessage(messages.userid, { userid: user.id }));
  }

  const logout = async () => {
    const response = await axios.post(serverUrl + '/api/v1/auth/logout');

    if (response.data?.status === 'ok') {
      mutate((_) => true, undefined, { revalidate: false });
      await mutate(`${serverUrl}/api/v1/auth/me`, null, false);
      await revalidate();
    }
  };

  return (
    <View className="mt-6 px-4 lg:flex lg:flex-row lg:items-end lg:justify-between lg:gap-5">
      <View className="flex flex-row items-end justify-items-end gap-5">
        <View className="flex-shrink-0">
          <View className="overflow-hidden rounded-full">
            {/* <CachedImage
              type="avatar"
              className="h-24 w-24 rounded-full bg-gray-600 object-cover ring-1 ring-gray-700"
              src={user.avatar}
              alt=""
            /> */}
            <CachedImage
              type="avatar"
              style={{ width: 96, height: 96 }}
              src={user.avatar}
              contentFit="cover"
              alt=""
            />
          </View>
        </View>
        <View className="pt-1.5">
          <View className="mb-1 flex flex-col sm:flex-row sm:items-center">
            {Platform.isTV ? (
              <ThemedText className="text-xl font-bold text-indigo-400 sm:text-2xl">
                {user.displayName}
              </ThemedText>
            ) : (
              <Link
                href={
                  user.id === loggedInUser?.id
                    ? '/profile'
                    : `/users/${user.id}`
                }
              >
                <ThemedText className="text-xl font-bold text-indigo-400 sm:text-2xl">
                  {user.displayName}
                </ThemedText>
              </Link>
            )}
            {user.email && user.displayName.toLowerCase() !== user.email && (
              <ThemedText className="text-sm text-gray-400 sm:ml-2 sm:text-lg">
                ({user.email})
              </ThemedText>
            )}
          </View>
          <ThemedText className="text-sm font-medium text-gray-400">
            {subtextItems.reduce((prev, curr) => (
              <>
                {prev} | {curr}
              </>
            ))}
          </ThemedText>
        </View>
      </View>
      <View className="mt-6 flex flex-col-reverse justify-stretch gap-2 space-y-4 space-y-reverse lg:flex-row lg:justify-end lg:space-x-3 lg:space-y-0 lg:space-x-reverse">
        {!isSettingsPage && loggedInUser?.id === user.id && (
          <Button
            buttonType="ghost"
            onClick={() => {
              logout();
            }}
            className="flex w-full flex-row items-center justify-center gap-2 pl-2"
          >
            <ArrowRightOnRectangle color="#ffffff" />
            <ThemedText>
              {intl.formatMessage(dropdownMessages.signout)}
            </ThemedText>
          </Button>
        )}
        {(loggedInUser?.id === user.id ||
          (user.id !== 1 && hasPermission(Permission.MANAGE_USERS))) &&
        !isSettingsPage ? (
          <Button
            buttonType="ghost"
            onClick={() => {
              router.push(
                loggedInUser?.id === user.id
                  ? `/profile/settings`
                  : `/users/${user.id}/settings`
              );
            }}
            className="flex w-full flex-row items-center justify-center gap-2 pl-2"
          >
            <Cog color="#ffffff" />
            <ThemedText>{intl.formatMessage(messages.settings)}</ThemedText>
          </Button>
        ) : (
          isSettingsPage && (
            <Button
              buttonType="ghost"
              onClick={() => {
                router.push(
                  loggedInUser?.id === user.id
                    ? `/profile`
                    : `/users/${user.id}`
                );
              }}
              className="flex w-full flex-row items-center justify-center gap-2 pl-2"
            >
              <User color="#ffffff" />
              <ThemedText>{intl.formatMessage(messages.profile)}</ThemedText>
            </Button>
          )
        )}
      </View>
    </View>
  );
};

export default ProfileHeader;
