import DiscordLogo from '@app/assets/extlogos/discord.png';
import PushbulletLogo from '@app/assets/extlogos/pushbullet.png';
import PushoverLogo from '@app/assets/extlogos/pushover.png';
import TelegramLogo from '@app/assets/extlogos/telegram.png';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import type { SettingsRoute } from '@app/components/Common/SettingsTabs';
import SettingsTabs from '@app/components/Common/SettingsTabs';
import ThemedText from '@app/components/Common/ThemedText';
import Error from '@app/components/ErrorPage';
import useServerUrl from '@app/hooks/useServerUrl';
import { useUser } from '@app/hooks/useUser';
import getSeerrMessages from '@app/utils/getSeerrMessages';
import { Envelope } from '@nandorojo/heroicons/24/solid';
import type { UserSettingsNotificationsResponse } from '@server/interfaces/api/userSettingsInterfaces';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import useSWR from 'swr';
import UserNotificationsDiscord from './UserNotificationsDiscord';
import UserNotificationsEmail from './UserNotificationsEmail';
import UserNotificationsPushbullet from './UserNotificationsPushbullet';
import UserNotificationsPushover from './UserNotificationsPushover';
import UserNotificationsTelegram from './UserNotificationsTelegram';

const messages = getSeerrMessages(
  'components.UserProfile.UserSettings.UserNotificationSettings'
);

const UserNotificationSettings = () => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  // const { user } = useUser({ id: Number(router.query.userId) });
  const { user } = useUser();
  const { data, error } = useSWR<UserSettingsNotificationsResponse>(
    user ? `${serverUrl}/api/v1/user/${user?.id}/settings/notifications` : null
  );
  const [currentRoute, setCurrentRoute] = useState<string>();

  const settingsRoutes: SettingsRoute[] = [
    {
      key: 'email',
      text: intl.formatMessage(messages.email),
      content: (
        <View className="flex flex-row items-center gap-2">
          <Envelope color="#ffffff" width={16} height={16} />
          <ThemedText>{intl.formatMessage(messages.email)}</ThemedText>
        </View>
      ),
      hidden: !data?.emailEnabled,
      component: UserNotificationsEmail,
    },
    // {
    //   key: 'webpush',
    //   text: intl.formatMessage(messages.webpush),
    //   content: (
    //     <View className="flex flex-row gap-2 items-center">
    //       <Cloud color="#ffffff" width={16} height={16} />
    //       <ThemedText>{intl.formatMessage(messages.webpush)}</ThemedText>
    //     </View>
    //   ),
    //   hidden: !data?.webPushEnabled,
    // },
    {
      key: 'discord',
      text: 'Discord',
      content: (
        <View className="flex flex-row items-center gap-2">
          <Image source={DiscordLogo} style={{ width: 16, height: 16 }} />
          <ThemedText>Discord</ThemedText>
        </View>
      ),
      hidden: !data?.discordEnabled,
      component: UserNotificationsDiscord,
    },
    {
      key: 'pushbullet',
      text: 'Pushbullet',
      content: (
        <View className="flex flex-row items-center gap-2">
          <Image source={PushbulletLogo} style={{ width: 16, height: 16 }} />
          <ThemedText>Pushbullet</ThemedText>
        </View>
      ),
      component: UserNotificationsPushbullet,
    },
    {
      key: 'pushover',
      text: 'Pushover',
      content: (
        <View className="flex flex-row items-center gap-2">
          <Image source={PushoverLogo} style={{ width: 16, height: 16 }} />
          <ThemedText>Pushover</ThemedText>
        </View>
      ),
      component: UserNotificationsPushover,
    },
    {
      key: 'telegram',
      text: 'Telegram',
      content: (
        <View className="flex flex-row items-center gap-2">
          <Image source={TelegramLogo} style={{ width: 16, height: 16 }} />
          <ThemedText>Telegram</ThemedText>
        </View>
      ),
      // hidden: !data?.telegramEnabled || !data?.telegramBotUsername,
      component: UserNotificationsTelegram,
    },
  ];

  // settingsRoutes.forEach((settingsRoute) => {
  //   settingsRoute.route = router.asPath.includes('/profile')
  //     ? `/profile${settingsRoute.route}`
  //     : `/users/${user?.id}${settingsRoute.route}`;
  // });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <Error statusCode={500} />;
  }

  const CurrentRoute =
    settingsRoutes.find((route) => route.key === currentRoute) ||
    settingsRoutes[0];

  return (
    <View className="px-4">
      <View className="mb-6">
        <ThemedText className="heading">
          {intl.formatMessage(messages.notificationsettings)}
        </ThemedText>
      </View>
      <SettingsTabs
        tabType="button"
        settingsRoutes={settingsRoutes}
        onChange={(route) => setCurrentRoute(route.key)}
      />
      <View className="section mb-0 mt-2">
        {CurrentRoute.component && <CurrentRoute.component />}
      </View>
    </View>
  );
};

export default UserNotificationSettings;
