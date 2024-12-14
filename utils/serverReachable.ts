export default async function isServerReachable(serverUrl: string) {
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
    return data.initialized === true;
  }
  catch (e) {
    console.error(e);
  }
  return false;
}