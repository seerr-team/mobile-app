import Alert from '@/components/Common/Alert';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import type { SettingsRoute } from '@/components/Common/SettingsTabs';
import SettingsTabs from '@/components/Common/SettingsTabs';
import ErrorPage from '@/components/ErrorPage';
import ProfileHeader from '@/components/UserProfile/ProfileHeader';
import useSettings from '@/hooks/useSettings';
import { useUser } from '@/hooks/useUser';
import { hasPermission, Permission } from '@/seerr/server/lib/permissions';
import getSeerrMessages from '@/utils/getSeerrMessages';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { ScrollView, View } from 'react-native';
import UserGeneralSettings from './UserGeneralSettings';
import UserLinkedAccountsSettings from './UserLinkedAccountsSettings';
import UserNotificationSettings from './UserNotificationSettings';
import UserPasswordChange from './UserPasswordChange';

const messages = getSeerrMessages('components.UserProfile.UserSettings');

const UserSettings = () => {
  const settings = useSettings();
  const { user: currentUser } = useUser();
  // const { user, error } = useUser({ id: Number(router.query.userId) });
  const { user, error } = useUser();
  const intl = useIntl();
  const [currentRoute, setCurrentRoute] = useState<string>();

  if (!user && !error) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <ErrorPage statusCode={500} />;
  }

  const settingsRoutes: SettingsRoute[] = [
    {
      key: 'general',
      text: intl.formatMessage(messages.menuGeneralSettings),
      component: UserGeneralSettings,
    },
    {
      key: 'password',
      text: intl.formatMessage(messages.menuChangePass),
      hidden:
        (!settings.currentSettings.localLogin &&
          !hasPermission(Permission.ADMIN, currentUser?.permissions ?? 0)) ||
        (currentUser?.id !== 1 &&
          currentUser?.id !== user?.id &&
          hasPermission(Permission.ADMIN, user?.permissions ?? 0)),
      component: UserPasswordChange,
    },
    {
      key: 'linked-accounts',
      text: intl.formatMessage(messages.menuLinkedAccounts),
      component: UserLinkedAccountsSettings,
    },
    {
      key: 'notifications',
      text: intl.formatMessage(messages.menuNotifications),
      component: UserNotificationSettings,
    },
    // {
    //   text: intl.formatMessage(messages.menuPermissions),
    //   key: 'permissions',
    // },
  ];

  if (currentUser?.id !== 1 && user.id === 1) {
    return (
      <>
        <ProfileHeader user={user} isSettingsPage />
        <View className="mt-6">
          <Alert
            title={intl.formatMessage(messages.unauthorizedDescription)}
            type="error"
          />
        </View>
      </>
    );
  }

  const CurrentRoute =
    settingsRoutes.find((route) => route.key === currentRoute) ||
    settingsRoutes[0];

  return (
    <ScrollView>
      <ProfileHeader user={user} isSettingsPage />
      <View className="mt-6 px-4">
        <SettingsTabs
          settingsRoutes={settingsRoutes}
          onChange={(route) => setCurrentRoute(route.key)}
        />
      </View>
      <View className="mt-10 text-white">
        {CurrentRoute.component && <CurrentRoute.component />}
      </View>
    </ScrollView>
  );
};

export default UserSettings;
