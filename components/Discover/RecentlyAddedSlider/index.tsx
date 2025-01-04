import ThemedText from '@/components/Common/ThemedText';
import Slider from '@/components/Slider';
import TmdbTitleCard from '@/components/TitleCard/TmdbTitleCard';
import useServerUrl from '@/hooks/useServerUrl';
import { Permission, useUser } from '@/hooks/useUser';
import type { MediaResultsResponse } from '@/jellyseerr/server/interfaces/api/mediaInterfaces';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { VisibilitySensor } from '@futurejj/react-native-visibility-sensor';
import { ArrowRightCircle } from '@nandorojo/heroicons/24/outline';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';
import useSWR from 'swr';

const messages = getJellyseerrMessages(
  'components.Discover.RecentlyAddedSlider'
);

export interface RecentlyAddedSliderProps {
  lastRefresh?: Date;
}

const RecentlyAddedSlider = ({ lastRefresh }: RecentlyAddedSliderProps) => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const { hasPermission } = useUser();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const {
    data: media,
    error: mediaError,
    mutate,
  } = useSWR<MediaResultsResponse>(
    isVisible || hasBeenVisible
      ? serverUrl + '/api/v1/media?filter=allavailable&take=20&sort=mediaAdded'
      : null,
    { revalidateOnMount: true }
  );

  useEffect(() => {
    if (media && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [media, hasBeenVisible]);

  useEffect(() => {
    mutate();
  }, [lastRefresh, mutate]);

  if (
    (media && !media.results.length && !mediaError) ||
    !hasPermission([Permission.MANAGE_REQUESTS, Permission.RECENT_VIEW], {
      type: 'or',
    })
  ) {
    return null;
  }

  return (
    <VisibilitySensor onChange={setIsVisible}>
      <View className="mb-4 mt-6 px-4">
        <Link href="/requests?filter=all" asChild>
          <Pressable>
            <View className="flex min-w-0 flex-row items-center gap-2">
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
    </VisibilitySensor>
  );
};

export default RecentlyAddedSlider;
