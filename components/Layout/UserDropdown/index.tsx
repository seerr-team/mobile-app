import CachedImage from '@/components/Common/CachedImage';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import { useUser } from '@/hooks/useUser';
import getSeerrMessages from '@/utils/getSeerrMessages';
import { ArrowRightOnRectangle, Clock } from '@nandorojo/heroicons/24/outline';
import { Cog, User } from '@nandorojo/heroicons/24/solid';
import axios from 'axios';
import { BlurView } from 'expo-blur';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Modal, Platform, Pressable, View } from 'react-native';
import { mutate } from 'swr';

const messages = getSeerrMessages('components.Layout.UserDropdown');

const UserDropdown = () => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const { user, revalidate } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const logout = async () => {
    const response = await axios.post(serverUrl + '/api/v1/auth/logout');

    if (response.data?.status === 'ok') {
      mutate((_) => true, undefined, { revalidate: false });
      await mutate(`${serverUrl}/api/v1/auth/me`, null, false);
      await revalidate();
    }
  };

  return (
    <View className="relative">
      <View className="flex flex-1 items-center justify-center">
        <Pressable
          className="flex items-center justify-center overflow-hidden rounded-full border border-gray-700 bg-gray-700 hover:border-gray-500 focus:border-indigo-500 focus:outline-none"
          onPress={() => {
            if (Platform.isTV) {
              router.push('/profile');
            } else {
              setIsOpen(true);
            }
          }}
        >
          <CachedImage
            type="avatar"
            style={{ width: 36, height: 36 }}
            src={user ? user.avatar : ''}
            contentFit="cover"
            placeholder={null}
            alt=""
          />
        </Pressable>
      </View>
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex flex-1">
          <Pressable
            className="absolute inset-0"
            android_disableSound
            onPress={() => setIsOpen(false)}
          />
        </View>
        <View className="absolute right-6 top-20 z-50 w-72 origin-top-right shadow-lg">
          <BlurView
            className="absolute h-full w-full overflow-hidden rounded-md"
            intensity={20}
            tint="regular"
            experimentalBlurMethod="dimezisBlurView"
          />
          <View className="overflow-hidden rounded-md border border-gray-600 bg-gray-800/60">
            <View className="flex flex-row items-center justify-start gap-4 p-6">
              <View className="overflow-hidden rounded-full">
                <CachedImage
                  type="avatar"
                  style={{ width: 40, height: 40 }}
                  src={user ? user.avatar : ''}
                  contentFit="cover"
                  placeholder={null}
                  alt=""
                />
              </View>
              <View className="flex min-w-0 flex-col overflow-hidden">
                <ThemedText className="truncate text-2xl font-semibold text-gray-200">
                  {user?.displayName}
                </ThemedText>
                {user?.displayName?.toLowerCase() !== user?.email && (
                  <ThemedText className="truncate text-gray-400">
                    {user?.email}
                  </ThemedText>
                )}
              </View>
            </View>
            <View className="flex flex-col border-t border-gray-600 py-2">
              <Link href="/profile" asChild>
                <Pressable onPress={() => setIsOpen(false)}>
                  <View className="flex flex-row items-center gap-2 px-4 py-2">
                    <User
                      className="mr-2"
                      width={20}
                      height={20}
                      color="#e5e7eb"
                    />
                    <ThemedText>
                      {intl.formatMessage(messages.myprofile)}
                    </ThemedText>
                  </View>
                </Pressable>
              </Link>
              <Link href="/requests?filter=all" asChild>
                <Pressable onPress={() => setIsOpen(false)}>
                  <View className="flex flex-row items-center gap-2 px-4 py-2">
                    <Clock
                      className="mr-2"
                      width={20}
                      height={20}
                      color="#e5e7eb"
                    />
                    <ThemedText>
                      {intl.formatMessage(messages.requests)}
                    </ThemedText>
                  </View>
                </Pressable>
              </Link>
              <Link href="/profile/settings" asChild>
                <Pressable onPress={() => setIsOpen(false)}>
                  <View className="flex flex-row items-center gap-2 px-4 py-2">
                    <Cog
                      className="mr-2"
                      width={20}
                      height={20}
                      color="#e5e7eb"
                    />
                    <ThemedText>
                      {intl.formatMessage(messages.settings)}
                    </ThemedText>
                  </View>
                </Pressable>
              </Link>
              <Pressable
                onPress={() => {
                  setIsOpen(false);
                  logout();
                }}
              >
                <View className="flex flex-row items-center gap-2 px-4 py-2">
                  <ArrowRightOnRectangle
                    width={20}
                    height={20}
                    color="#e5e7eb"
                  />
                  <ThemedText>
                    {intl.formatMessage(messages.signout)}
                  </ThemedText>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserDropdown;
