import CachedImage from '@/components/Common/CachedImage';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import { useUser } from '@/hooks/useUser';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { ArrowRightOnRectangle, Clock } from '@nandorojo/heroicons/24/outline';
import { User } from '@nandorojo/heroicons/24/solid';
import { BlurView } from 'expo-blur';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Modal, Pressable, View } from 'react-native';
// import { useDispatch } from 'react-redux';

const messages = getJellyseerrMessages('components.Layout.UserDropdown');

const UserDropdown = () => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  // const dispatch = useDispatch();

  const logout = async () => {
    const res = await fetch(serverUrl + '/api/v1/auth/logout', {
      method: 'POST',
    });
    if (!res.ok) throw new Error();
    // const data = await res.json();

    // if (data?.status === 'ok') {
    //   dispatch(logoutUser());
    // }
    router.replace('/login');
  };

  return (
    <View className="relative">
      <View className="flex flex-1 items-center justify-center">
        <Pressable
          className="flex items-center justify-center overflow-hidden rounded-full border border-gray-700 bg-gray-700 hover:border-gray-500 focus:border-gray-500 focus:outline-none"
          onPress={() => setIsOpen(true)}
        >
          <CachedImage
            type="avatar"
            style={{ width: 40, height: 40 }}
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
              <Link href="(tabs)/profile" asChild>
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
              <Link href="(tabs)/requests?filter=all" asChild>
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
              {/* <Link href="(tabs)/profile/settings" asChild>
                <Pressable onPress={() => setIsOpen(false)}>
                <View className="flex flex-row items-center px-4 py-2 gap-2">
                  <Cog className="mr-2" width={20} height={20} color="#e5e7eb" />
                  <ThemedText>{intl.formatMessage(messages.settings)}</ThemedText>
                </View>
              </Pressable>
            </Link> */}
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
