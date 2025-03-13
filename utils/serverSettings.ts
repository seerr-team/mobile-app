import type {
  PublicSettingsResponse,
  StatusResponse,
} from '@/jellyseerr/server/interfaces/api/settingsInterfaces';

export const minimumServerVersion = '2.4.0';

export enum ConnectionErrorType {
  SERVER_NOT_REACHABLE = 'SERVER_NOT_REACHABLE',
  SERVER_NOT_INITIALIZED = 'SERVER_NOT_INITIALIZED',
  SERVER_NOT_JELLYSEERR = 'SERVER_NOT_JELLYSEERR',
  SERVER_NOT_UPTODATE = 'SERVER_NOT_UPTODATE',
}

export async function getServerSettings(
  serverUrl: string
): Promise<PublicSettingsResponse> {
  let res: Response;

  try {
    if (serverUrl.endsWith('/')) {
      serverUrl = serverUrl.slice(0, -1);
    }
    const abortController = new AbortController();
    setTimeout(() => abortController.abort(), 5000);
    res = await fetch(`${serverUrl}/api/v1/settings/public`, {
      signal: abortController.signal,
    });
  } catch {
    throw new Error(ConnectionErrorType.SERVER_NOT_REACHABLE);
  }

  if (!res.ok) throw new Error(ConnectionErrorType.SERVER_NOT_REACHABLE);
  if (res.status !== 200)
    throw new Error(ConnectionErrorType.SERVER_NOT_JELLYSEERR);

  let data: PublicSettingsResponse;
  try {
    data = await res.json();
  } catch {
    throw new Error(ConnectionErrorType.SERVER_NOT_JELLYSEERR);
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
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), 5000);
  const res = await fetch(`${serverUrl}/api/v1/status`, {
    signal: abortController.signal,
  });
  if (!res.ok) throw new Error(ConnectionErrorType.SERVER_NOT_REACHABLE);
  const data: StatusResponse = await res.json();

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
