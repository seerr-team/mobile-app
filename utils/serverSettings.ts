import type {
  PublicSettingsResponse,
  StatusResponse,
} from '@/jellyseerr/server/interfaces/api/settingsInterfaces';
import axiosInstance from './axios';

export const minimumServerVersion = '2.4.0';

export enum ConnectionErrorType {
  SERVER_NOT_REACHABLE = 'SERVER_NOT_REACHABLE',
  SERVER_NOT_JELLYSEERR = 'SERVER_NOT_JELLYSEERR',
  SERVER_NOT_INITIALIZED = 'SERVER_NOT_INITIALIZED',
  SERVER_NOT_UPTODATE = 'SERVER_NOT_UPTODATE',
}

export async function getServerSettings(
  serverUrl: string
): Promise<PublicSettingsResponse> {
  let data: PublicSettingsResponse;

  try {
    if (serverUrl.endsWith('/')) {
      serverUrl = serverUrl.slice(0, -1);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await axiosInstance.get<PublicSettingsResponse>(
      `${serverUrl}/api/v1/settings/public`,
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    data = response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError(error)) {
      if (
        error.code === 'ERR_CANCELED' ||
        error.code === 'ECONNABORTED' ||
        !error.response
      ) {
        throw new Error(ConnectionErrorType.SERVER_NOT_REACHABLE);
      }
      if (error.response.status !== 200) {
        throw new Error(ConnectionErrorType.SERVER_NOT_JELLYSEERR);
      }
    }
    throw new Error(ConnectionErrorType.SERVER_NOT_REACHABLE);
  }

  if (typeof data?.mediaServerType !== 'number') {
    throw new Error(ConnectionErrorType.SERVER_NOT_JELLYSEERR);
  }
  if (!data?.initialized) {
    throw new Error(ConnectionErrorType.SERVER_NOT_INITIALIZED);
  }
  if (!(await isServerUpToDate(serverUrl))) {
    throw new Error(ConnectionErrorType.SERVER_NOT_UPTODATE);
  }

  return data;
}

export async function isServerUpToDate(serverUrl: string): Promise<boolean> {
  if (serverUrl.endsWith('/')) {
    serverUrl = serverUrl.slice(0, -1);
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  let data: StatusResponse;
  try {
    const response = await axiosInstance.get<StatusResponse>(
      `${serverUrl}/api/v1/status`,
      {
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    data = response.data;
  } catch (error) {
    if (
      axiosInstance.isAxiosError(error) &&
      (error.code === 'ERR_CANCELED' ||
        error.code === 'ECONNABORTED' ||
        !error.response)
    ) {
      throw new Error(ConnectionErrorType.SERVER_NOT_REACHABLE);
    }
    throw new Error(ConnectionErrorType.SERVER_NOT_REACHABLE);
  }

  if (data.version === 'develop-local') return true;

  const [major, minor, patch] = data.version.split('.').map(Number);
  const [minMajor, minMinor, minPatch] = minimumServerVersion
    .split('.')
    .map(Number);
  if (major < minMajor) return false;
  if (major === minMajor && minor < minMinor) return false;
  if (major === minMajor && minor === minMinor && patch < minPatch)
    return false;
  return true;
}
