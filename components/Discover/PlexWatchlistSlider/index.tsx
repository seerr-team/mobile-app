import ThemedText from '@/components/Common/ThemedText';
import Slider from '@/components/Slider';
import TmdbTitleCard from '@/components/TitleCard/TmdbTitleCard';
import useServerUrl from '@/hooks/useServerUrl';
import { useUser } from '@/hooks/useUser';
import type { WatchlistItem } from '@/jellyseerr/server/interfaces/api/discoverInterfaces';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { VisibilitySensor } from '@futurejj/react-native-visibility-sensor';
import { ArrowRightCircle } from '@nandorojo/heroicons/24/outline';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Linking, Pressable, View } from 'react-native';
import useSWR from 'swr';

const messages = getJellyseerrMessages(
  'components.Discover.PlexWatchlistSlider'
);

const PlexWatchlistSlider = () => {
  const intl = useIntl();
  const serverUrl = useServerUrl();
  const { user } = useUser();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  const { data: watchlistItems, error: watchlistError } = useSWR<{
    page: number;
    totalPages: number;
    totalResults: number;
    results: WatchlistItem[];
  }>(
    isVisible || hasBeenVisible
      ? serverUrl + '/api/v1/discover/watchlist'
      : null,
    {
      revalidateOnMount: true,
    }
  );

  useEffect(() => {
    if (watchlistItems && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [watchlistItems, hasBeenVisible]);

  if (
    (watchlistItems &&
      watchlistItems.results.length === 0 &&
      !user?.settings?.watchlistSyncMovies &&
      !user?.settings?.watchlistSyncTv) ||
    watchlistError
  ) {
    return null;
  }

  return (
    <VisibilitySensor onChange={setIsVisible}>
      <View className="slider-header px-4">
        <Link href={'/discover/watchlist'} asChild>
          <Pressable>
            <View className="flex min-w-0 flex-row items-center gap-2">
              <ThemedText className="truncate text-2xl font-bold">
                {intl.formatMessage(messages.plexwatchlist)}
              </ThemedText>
              <ArrowRightCircle color="#ffffff" />
            </View>
          </Pressable>
        </Link>
      </View>
      <Slider
        sliderKey="watchlist"
        isLoading={!watchlistItems}
        isEmpty={!!watchlistItems && watchlistItems.results.length === 0}
        emptyMessage={intl.formatMessage(messages.emptywatchlist, {
          PlexWatchlistSupportLink: (msg: React.ReactNode) => (
            <Pressable
              onPress={() => {
                Linking.openURL(
                  'https://support.plex.tv/articles/universal-watchlist/'
                );
              }}
            >
              <ThemedText className="text-white transition duration-300 hover:underline">
                {msg}
              </ThemedText>
            </Pressable>
          ),
        })}
        items={watchlistItems?.results.map((item) => (
          <TmdbTitleCard
            id={item.tmdbId}
            key={`watchlist-slider-item-${item.ratingKey}`}
            tmdbId={item.tmdbId}
            type={item.mediaType}
            isAddedToWatchlist={true}
          />
        ))}
      />
    </VisibilitySensor>
  );
};

export default PlexWatchlistSlider;
