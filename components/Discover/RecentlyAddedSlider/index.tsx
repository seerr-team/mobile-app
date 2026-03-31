import ThemedText from '@app/components/Common/ThemedText';
import Slider from '@app/components/Slider';
import TmdbTitleCard from '@app/components/TitleCard/TmdbTitleCard';
import useServerUrl from '@app/hooks/useServerUrl';
import { Permission, useUser } from '@app/hooks/useUser';
import getSeerrMessages from '@app/utils/getSeerrMessages';
import { VisibilitySensor } from '@futurejj/react-native-visibility-sensor';
import type { MediaResultsResponse } from '@server/interfaces/api/mediaInterfaces';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import useSWR from 'swr';

const messages = getSeerrMessages('components.Discover.RecentlyAddedSlider');

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
        <View className="flex min-w-0 flex-row items-center gap-2">
          <ThemedText className="truncate text-2xl font-bold text-white group-focus:text-gray-400">
            {intl.formatMessage(messages.recentlyAdded)}
          </ThemedText>
          {/* <ArrowRightCircle color="#ffffff" /> */}
        </View>
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
