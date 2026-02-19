import ThemedText from '@/components/Common/ThemedText';
import { useUser } from '@/hooks/useUser';
import type { Permission } from '@/seerr/server/lib/permissions';
import { hasPermission } from '@/seerr/server/lib/permissions';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

export interface SettingsRoute {
  text: string;
  content?: React.ReactNode;
  component?: React.ComponentType;
  key: string;
  requiredPermission?: Permission | Permission[];
  permissionType?: { type: 'and' | 'or' };
  hidden?: boolean;
}

type SettingsLinkProps = {
  tabType: 'default' | 'button';
  active: boolean;
  onClick: () => void;
  hidden?: boolean;
  children: React.ReactNode;
};

const SettingsLink = ({
  children,
  tabType,
  active,
  onClick,
  hidden = false,
}: SettingsLinkProps) => {
  if (hidden) {
    return null;
  }

  let linkClasses =
    'px-2 py-4 ml-8 text-sm font-medium leading-5 transition duration-300 border-b-2 border-transparent whitespace-nowrap first:ml-0';
  let activeLinkColor =
    'text-sm font-medium leading-5 text-indigo-500 border-indigo-600';
  let inactiveLinkColor =
    'text-sm font-medium leading-5  text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-400 focus:text-gray-300 focus:border-gray-400';

  if (tabType === 'button') {
    linkClasses =
      'px-3 py-2 text-sm font-medium transition duration-300 rounded-md whitespace-nowrap mx-2 my-1';
    activeLinkColor = 'text-sm font-medium bg-indigo-700';
    inactiveLinkColor =
      'text-sm font-medium bg-gray-800 hover:bg-gray-700 focus:bg-gray-700';
  }

  return (
    <Pressable
      onPress={() => onClick()}
      className={`${linkClasses} ${
        active ? activeLinkColor : inactiveLinkColor
      }`}
    >
      {typeof children === 'string' ? (
        <ThemedText
          onPress={() => onClick()}
          className={active ? activeLinkColor : inactiveLinkColor}
        >
          {children}
        </ThemedText>
      ) : (
        children
      )}
    </Pressable>
  );
};

const SettingsTabs = ({
  tabType = 'default',
  settingsRoutes,
  onChange,
}: {
  tabType?: 'default' | 'button';
  settingsRoutes: SettingsRoute[];
  onChange?: (route: SettingsRoute) => void;
}) => {
  const { user: currentUser } = useUser();
  const [activeTab, setActiveTab] = useState(settingsRoutes[0]?.key || '');

  return (
    <>
      {tabType === 'button' ? (
        <View>
          <View
            className="-mx-2 -my-1 flex flex-row flex-wrap"
            aria-label="Tabs"
          >
            {settingsRoutes.map((route, index) => (
              <SettingsLink
                tabType={tabType}
                active={activeTab === route.key}
                onClick={() => {
                  setActiveTab(route.key);
                  onChange?.(route);
                }}
                hidden={route.hidden ?? false}
                key={`button-settings-link-${index}`}
              >
                {route.content ? route.content : route.text}
              </SettingsLink>
            ))}
          </View>
        </View>
      ) : (
        <View className="hide-scrollbar overflow-x-scroll border-b border-gray-600">
          <View className="flex flex-row" data-testid="settings-nav-desktop">
            {settingsRoutes
              .filter(
                (route) =>
                  !route.hidden &&
                  (route.requiredPermission
                    ? hasPermission(
                        route.requiredPermission,
                        currentUser?.permissions ?? 0,
                        route.permissionType
                      )
                    : true)
              )
              .map((route, index) => (
                <SettingsLink
                  tabType={tabType}
                  active={activeTab === route.key}
                  onClick={() => {
                    setActiveTab(route.key);
                    onChange?.(route);
                  }}
                  key={`standard-settings-link-${index}`}
                >
                  {route.text}
                </SettingsLink>
              ))}
          </View>
        </View>
      )}
    </>
  );
};

export default SettingsTabs;
