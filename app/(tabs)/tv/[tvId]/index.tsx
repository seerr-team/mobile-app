import LoadingSpinner from '@/components/Common/LoadingSpinner';
import TvDetails from '@/components/TvDetails';
import useServerUrl from '@/hooks/useServerUrl';
import type { TvDetails as TvDetailsType } from '@/jellyseerr/server/models/Tv';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

export default function TvPage() {
  const searchParams = useLocalSearchParams();
  const serverUrl = useServerUrl();
  const [tv, setTv] = useState<TvDetailsType | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${serverUrl}/api/v1/tv/${searchParams.tvId}`);
      if (!res.ok) throw new Error();
      const tv: TvDetailsType = await res.json();
      setTv(tv);
    })();
  }, [searchParams.tvId, serverUrl]);

  if (!tv) {
    return <LoadingSpinner />;
  }

  return <TvDetails tv={tv} />;
}
