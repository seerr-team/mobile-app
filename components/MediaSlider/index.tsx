import ThemedText from '@/components/Common/ThemedText';
import ShowMoreCard from '@/components/MediaSlider/ShowMoreCard';
import PersonCard from '@/components/PersonCard';
import Slider from '@/components/Slider';
import TitleCard from '@/components/TitleCard';
import useServerUrl from '@/hooks/useServerUrl';
import useSettings from '@/hooks/useSettings';
import { useUser } from '@/hooks/useUser';
import { MediaStatus } from '@/seerr/server/constants/media';
import { Permission } from '@/seerr/server/lib/permissions';
import type {
  MovieResult,
  PersonResult,
  TvResult,
} from '@/seerr/server/models/Search';
import { VisibilitySensor } from '@futurejj/react-native-visibility-sensor';
import { ArrowRightCircle } from '@nandorojo/heroicons/24/outline';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import useSWRInfinite from 'swr/infinite';

interface MixedResult {
  page: number;
  totalResults: number;
  totalPages: number;
  results: (TvResult | MovieResult | PersonResult)[];
}

interface MediaSliderProps {
  title: string;
  url: string;
  linkUrl?: string;
  sliderKey: string;
  hideWhenEmpty?: boolean;
  extraParams?: string;
  lastRefresh?: Date;
  onNewTitles?: (titleCount: number) => void;
}

const MediaSlider = ({
  title,
  url,
  linkUrl,
  extraParams,
  sliderKey,
  hideWhenEmpty = false,
  lastRefresh,
  onNewTitles,
}: MediaSliderProps) => {
  const settings = useSettings();
  const serverUrl = useServerUrl();
  const { hasPermission } = useUser();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  const { data, error, mutate } = useSWRInfinite<MixedResult>(
    (pageIndex: number, previousPageData: MixedResult | null) => {
      if (!isVisible && !hasBeenVisible && !hideWhenEmpty) {
        return null;
      }
      if (previousPageData && pageIndex + 1 > previousPageData.totalPages) {
        return null;
      }

      return `${serverUrl}${url}?page=${pageIndex + 1}${
        extraParams ? `&${extraParams}` : ''
      }`;
    },
    {
      initialSize: 2,
      revalidateFirstPage: false,
    }
  );

  useEffect(() => {
    if (data && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [data, hasBeenVisible]);

  useEffect(() => {
    mutate();
  }, [lastRefresh, mutate]);

  let titles = (data ?? []).reduce(
    (a, v) => [...a, ...v.results],
    [] as (MovieResult | TvResult | PersonResult)[]
  );

  if (settings.currentSettings.hideAvailable) {
    titles = titles.filter(
      (i) =>
        (i.mediaType === 'movie' || i.mediaType === 'tv') &&
        i.mediaInfo?.status !== MediaStatus.AVAILABLE &&
        i.mediaInfo?.status !== MediaStatus.PARTIALLY_AVAILABLE
    );
  }

  if (settings.currentSettings.hideBlocklisted) {
    titles = titles.filter(
      (i) =>
        (i.mediaType === 'movie' || i.mediaType === 'tv') &&
        i.mediaInfo?.status !== MediaStatus.BLOCKLISTED
    );
  }

  if (hideWhenEmpty && (data?.[0].results ?? []).length === 0) {
    return null;
  }

  const blocklistVisibility = hasPermission(
    [Permission.MANAGE_BLOCKLIST, Permission.VIEW_BLOCKLIST],
    { type: 'or' }
  );

  const finalTitles = titles
    .slice(0, 20)
    .filter((title) => {
      if (!blocklistVisibility)
        return (
          (title as TvResult | MovieResult).mediaInfo?.status !==
          MediaStatus.BLOCKLISTED
        );
      return title;
    })
    .map((title) => {
      switch (title.mediaType) {
        case 'movie':
          return (
            <TitleCard
              key={title.id}
              id={title.id}
              isAddedToWatchlist={title.mediaInfo?.watchlists?.length ?? 0}
              image={title.posterPath}
              status={title.mediaInfo?.status}
              summary={title.overview}
              title={title.title}
              userScore={title.voteAverage}
              year={title.releaseDate}
              mediaType={title.mediaType}
              inProgress={(title.mediaInfo?.downloadStatus ?? []).length > 0}
            />
          );
        case 'tv':
          return (
            <TitleCard
              key={title.id}
              id={title.id}
              isAddedToWatchlist={title.mediaInfo?.watchlists?.length ?? 0}
              image={title.posterPath}
              status={title.mediaInfo?.status}
              summary={title.overview}
              title={title.name}
              userScore={title.voteAverage}
              year={title.firstAirDate}
              mediaType={title.mediaType}
              inProgress={(title.mediaInfo?.downloadStatus ?? []).length > 0}
            />
          );
        case 'person':
          return (
            <PersonCard
              personId={title.id}
              name={title.name}
              profilePath={title.profilePath}
            />
          );
      }
    });

  if (linkUrl && titles.length > 20) {
    finalTitles.push(
      <ShowMoreCard
        url={linkUrl}
        posters={titles
          .slice(20, 24)
          .map((title) =>
            title.mediaType !== 'person' ? title.posterPath : undefined
          )}
      />
    );
  }

  return (
    <VisibilitySensor onChange={setIsVisible}>
      <View className="mb-4 mt-6 px-4">
        {linkUrl ? (
          <Link href={linkUrl} asChild>
            <Pressable className="group">
              <View className="flex min-w-0 flex-row items-center gap-2">
                <ThemedText className="truncate text-2xl font-bold text-white group-focus:text-gray-400">
                  {title}
                </ThemedText>
                <ArrowRightCircle color="#ffffff" />
              </View>
            </Pressable>
          </Link>
        ) : (
          <View>
            <ThemedText>{title}</ThemedText>
          </View>
        )}
      </View>
      <Slider
        sliderKey={sliderKey}
        isLoading={!data && !error}
        isEmpty={false}
        items={finalTitles}
      />
    </VisibilitySensor>
  );
};

export default MediaSlider;
