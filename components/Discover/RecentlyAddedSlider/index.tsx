import ThemedText from '@/components/Common/ThemedText';
import Slider from '@/components/Slider';
import TmdbTitleCard from '@/components/TitleCard/TmdbTitleCard';
import { Permission, useUser } from '@/hooks/useUser';
import type { MediaResultsResponse } from '@/jellyseerr/server/interfaces/api/mediaInterfaces';
import type { RootState } from '@/store';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { ArrowRightCircle } from '@nandorojo/heroicons/24/outline';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';
import { useSelector } from 'react-redux';

const messages = getJellyseerrMessages(
  'components.Discover.RecentlyAddedSlider'
);

const RecentlyAddedSlider = () => {
  const serverUrl = useSelector(
    (state: RootState) => state.appSettings.serverUrl
  );
  const intl = useIntl();
  const { hasPermission } = useUser();
  const [media, setMedia] = useState<MediaResultsResponse | null>(null);
  const [mediaError, setMediaError] = useState<Error | null>(null);

  async function fetchMedia() {
    try {
      const response = await fetch(
        serverUrl + '/api/v1/media?filter=allavailable&take=20&sort=mediaAdded'
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: MediaResultsResponse = await response.json();
      setMedia(data);
    } catch (error) {
      setMediaError(error as Error);
    }
  }

  useEffect(() => {
    fetchMedia();
  }, []);

  if (
    (media && !media.results.length && !mediaError) ||
    !hasPermission([Permission.MANAGE_REQUESTS, Permission.RECENT_VIEW], {
      type: 'or',
    })
  ) {
    return null;
  }

  return (
    <>
      <View className="slider-header px-4">
        <Link href="/requests?filter=all" className="slider-title">
          <Pressable>
            <View className="flex min-w-0 flex-row items-center gap-2 pr-16">
              <ThemedText className="truncate text-2xl font-bold">
                {intl.formatMessage(messages.recentlyAdded)}
              </ThemedText>
              <ArrowRightCircle color="#ffffff" />
            </View>
          </Pressable>
        </Link>
      </View>
      <Slider
        sliderKey="media"
        isLoading={!media}
        items={(media?.results ?? []).map((item) => (
          <TmdbTitleCard
            key={`media-slider-item-${item.id}`}
            id={item.id}
            tmdbId={item.tmdbId}
            tvdbId={item.tvdbId}
            type={item.mediaType}
          />
        ))}
      />
    </>
  );
};

export default RecentlyAddedSlider;
