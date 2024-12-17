import { UserType } from '@/jellyseerr/server/constants/user';
import type { PermissionCheckOptions } from '@/jellyseerr/server/lib/permissions';
import { hasPermission, Permission } from '@/jellyseerr/server/lib/permissions';
import type { NotificationAgentKey } from '@/jellyseerr/server/lib/settings';
import type { RootState } from '@/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export { Permission, UserType };
export type { PermissionCheckOptions };

export interface User {
  id: number;
  warnings: string[];
  plexUsername?: string;
  jellyfinUsername?: string;
  username?: string;
  displayName: string;
  email: string;
  avatar: string;
  permissions: number;
  userType: number;
  createdAt: Date;
  updatedAt: Date;
  requestCount: number;
  settings?: UserSettings;
}

type NotificationAgentTypes = Record<NotificationAgentKey, number>;

export interface UserSettings {
  discordId?: string;
  discoverRegion?: string;
  streamingRegion?: string;
  originalLanguage?: string;
  locale?: string;
  notificationTypes: Partial<NotificationAgentTypes>;
  watchlistSyncMovies?: boolean;
  watchlistSyncTv?: boolean;
}

interface UserHookResponse {
  user?: User;
  loading: boolean;
  error: string;
  hasPermission: (
    permission: Permission | Permission[],
    options?: PermissionCheckOptions
  ) => boolean;
}

export const useUser = ({
  id,
  initialData,
}: { id?: number; initialData?: User } = {}): UserHookResponse => {
  const serverUrl = useSelector(
    (state: RootState) => state.appSettings.serverUrl
  );
  const [data, setData] = useState<User | undefined>(initialData);
  const [error, setError] = useState('');

  const fetchUser = async () => {
    try {
      const response = await fetch(
        id ? `${serverUrl}/api/v1/user/${id}` : `${serverUrl}/api/v1/auth/me`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setData(data);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id, serverUrl]);

  const checkPermission = (
    permission: Permission | Permission[],
    options?: PermissionCheckOptions
  ): boolean => {
    return hasPermission(permission, data?.permissions ?? 0, options);
  };

  return {
    user: data,
    loading: !data && !error,
    error,
    hasPermission: checkPermission,
  };
};
