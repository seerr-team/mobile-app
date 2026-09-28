import type {
  PublicSettingsResponse,
  StatusResponse,
} from '@server/interfaces/api/settingsInterfaces';
import axios, { type AxiosError, isAxiosError } from 'axios';

export const minimumServerVersion = '2.4.0';

export enum ConnectionErrorType {
  SERVER_NOT_REACHABLE = 'SERVER_NOT_REACHABLE',
  SERVER_NOT_INITIALIZED = 'SERVER_NOT_INITIALIZED',
  SERVER_NOT_SEERR = 'SERVER_NOT_SEERR',
  SERVER_NOT_UPTODATE = 'SERVER_NOT_UPTODATE',
}

export class ServerConnectionError extends Error {
  type: ConnectionErrorType;
  constructor(type: ConnectionErrorType, message?: string) {
    super(message);
    this.name = 'ServerConnectionError';
    this.type = type;
    this.message = message || type;
  }
}

function formatAxiosError(error: AxiosError): string {
  const parts = [];
  if (error.code) parts.push(`[${error.code}]`);
  if (error.response) parts.push(`[${error.response.status}]`);
  if (error.message) parts.push(error.message);
  return parts.join(' ');
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

    const response = await axios.get<PublicSettingsResponse>(
      `${serverUrl}/api/v1/settings/public`,
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    data = response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (
        error.code === 'ERR_CANCELED' ||
        error.code === 'ECONNABORTED' ||
        !error.response
      ) {
        throw new ServerConnectionError(
          ConnectionErrorType.SERVER_NOT_REACHABLE,
          formatAxiosError(error)
        );
      }
      if (error.response.status !== 200) {
        throw new ServerConnectionError(
          ConnectionErrorType.SERVER_NOT_SEERR,
          formatAxiosError(error)
        );
      }
    }
    throw new ServerConnectionError(
      ConnectionErrorType.SERVER_NOT_REACHABLE,
      error?.message
    );
  }

  if (typeof data?.mediaServerType !== 'number') {
    throw new ServerConnectionError(ConnectionErrorType.SERVER_NOT_SEERR);
  }
  if (!data?.initialized) {
    throw new ServerConnectionError(ConnectionErrorType.SERVER_NOT_INITIALIZED);
  }
  if (!(await isServerUpToDate(serverUrl))) {
    throw new ServerConnectionError(ConnectionErrorType.SERVER_NOT_UPTODATE);
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
    const response = await axios.get<StatusResponse>(
      `${serverUrl}/api/v1/status`,
      {
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    data = response.data;
  } catch (error) {
    if (
      isAxiosError(error) &&
      (error.code === 'ERR_CANCELED' ||
        error.code === 'ECONNABORTED' ||
        !error.response)
    ) {
      throw new ServerConnectionError(
        ConnectionErrorType.SERVER_NOT_REACHABLE,
        formatAxiosError(error)
      );
    }
    throw new ServerConnectionError(
      ConnectionErrorType.SERVER_NOT_REACHABLE,
      error?.message
    );
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
