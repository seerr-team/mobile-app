import Alert from '@app/components/Common/Alert';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import type { SettingsRoute } from '@app/components/Common/SettingsTabs';
import SettingsTabs from '@app/components/Common/SettingsTabs';
import ErrorPage from '@app/components/ErrorPage';
import ProfileHeader from '@app/components/UserProfile/ProfileHeader';
import useSettings from '@app/hooks/useSettings';
import { useUser } from '@app/hooks/useUser';
import getSeerrMessages from '@app/utils/getSeerrMessages';
import { hasPermission, Permission } from '@server/lib/permissions';
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
