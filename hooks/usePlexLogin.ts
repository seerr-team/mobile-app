import PlexOAuth from '@/utils/plex';
import { useState } from 'react';

const plexOAuth = new PlexOAuth();

function usePlexLogin({
  onAuthToken,
  onError,
}: {
  onAuthToken: (authToken: string) => void;
  onError?: (err: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    try {
      const authToken = await plexOAuth.login(); // handles WebBrowser internally
      setLoading(false);
      onAuthToken(authToken);
    } catch (err) {
      if (onError && err instanceof Error) {
        onError(err.message);
      } else if (onError) {
        onError('An unknown error occurred.');
      }
      setLoading(false);
    }
  };

  return { loading, login };
}

export default usePlexLogin;
