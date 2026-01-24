import ThemedText from '@/components/Common/ThemedText';
import { genreColorMap } from '@/components/Discover/constants';
import GenreCard from '@/components/GenreCard';
import Slider from '@/components/Slider';
import useServerUrl from '@/hooks/useServerUrl';
import type { GenreSliderItem } from '@/seerr/server/interfaces/api/discoverInterfaces';
import getSeerrMessages from '@/utils/getSeerrMessages';
import { VisibilitySensor } from '@futurejj/react-native-visibility-sensor';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import useSWR from 'swr';

const messages = getSeerrMessages('components.Discover.MovieGenreSlider');

const MovieGenreSlider = () => {
  const intl = useIntl();
  const serverUrl = useServerUrl();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  const { data, error } = useSWR<GenreSliderItem[]>(
    isVisible || hasBeenVisible
      ? serverUrl + `/api/v1/discover/genreslider/movie`
      : null,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (data && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [data, hasBeenVisible]);

  return (
    <VisibilitySensor onChange={setIsVisible}>
      <View className="slider-header px-4">
        <View className="flex min-w-0 flex-row items-center gap-2">
          <ThemedText className="truncate text-2xl font-bold">
            {intl.formatMessage(messages.moviegenres)}
          </ThemedText>
          {/* <ArrowRightCircle color="#ffffff" /> */}
        </View>
      </View>
      <Slider
        sliderKey="movie-genres"
        isLoading={!data && !error}
        isEmpty={false}
        items={(data ?? []).map((genre, index) => (
          <GenreCard
            key={`genre-${genre.id}-${index}`}
            name={genre.name}
            image={`https://image.tmdb.org/t/p/w1280_filter(duotone,${
              genreColorMap[genre.id] ?? genreColorMap[0]
            })${genre.backdrops[4]}`}
            url={`/discover_movies?genre=${genre.id}`}
          />
        ))}
        placeholder={<GenreCard.Placeholder />}
        emptyMessage=""
      />
    </VisibilitySensor>
  );
};

export default React.memo(MovieGenreSlider);
