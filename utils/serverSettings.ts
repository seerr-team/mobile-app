import type { PublicSettingsResponse } from "@/jellyseerr/server/interfaces/api/settingsInterfaces";

export async function getServerSettings(serverUrl: string): Promise<PublicSettingsResponse | null> {
  try {
    if (serverUrl.endsWith('/')) {
      serverUrl = serverUrl.slice(0, -1);
    }
    const abortController = new AbortController();
    setTimeout(() => abortController.abort(), 5000);
    const res = await fetch(`${serverUrl}/api/v1/settings/public`, {
      signal: abortController.signal,
    });
    if (!res.ok) throw new Error('Server not reachable');
    const data = await res.json();
    return data;
  }
  catch (e) {}
  return null;
}

export async function isServerReachable(serverUrl: string) {
  return (await getServerSettings(serverUrl)) !== null;
}