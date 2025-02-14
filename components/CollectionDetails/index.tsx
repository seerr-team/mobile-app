import ButtonWithDropdown from '@/components/Common/ButtonWithDropdown';
import CachedImage from '@/components/Common/CachedImage';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ThemedText from '@/components/Common/ThemedText';
import ErrorPage from '@/components/ErrorPage';
import RequestModal from '@/components/RequestModal';
import Slider from '@/components/Slider';
import StatusBadge from '@/components/StatusBadge';
import TitleCard from '@/components/TitleCard';
import useServerUrl from '@/hooks/useServerUrl';
import useSettings from '@/hooks/useSettings';
import { Permission, useUser } from '@/hooks/useUser';
import { MediaStatus } from '@/jellyseerr/server/constants/media';
import type { Collection } from '@/jellyseerr/server/models/Collection';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import globalMessages from '@/utils/globalMessages';
import { refreshIntervalHelper } from '@/utils/refreshIntervalHelper';
import { ArrowDownTray } from '@nandorojo/heroicons/24/outline';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams } from 'expo-router';
import { uniq } from 'lodash';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { ScrollView, View } from 'react-native';
import useSWR from 'swr';

const messages = getJellyseerrMessages('components.CollectionDetails');

interface CollectionDetailsProps {
  collection?: Collection;
}

const CollectionDetails = ({ collection }: CollectionDetailsProps) => {
  const serverUrl = useServerUrl();
  const searchParams = useLocalSearchParams();
  const intl = useIntl();
  const settings = useSettings();
  const { hasPermission } = useUser();
  const [requestModal, setRequestModal] = useState(false);
  const [is4k, setIs4k] = useState(false);

  const returnCollectionDownloadItems = (data: Collection | undefined) => {
    const [downloadStatus, downloadStatus4k] = [
      data?.parts.flatMap((item) =>
        item.mediaInfo?.downloadStatus ? item.mediaInfo?.downloadStatus : []
      ),
      data?.parts.flatMap((item) =>
        item.mediaInfo?.downloadStatus4k ? item.mediaInfo?.downloadStatus4k : []
      ),
    ];

    return { downloadStatus, downloadStatus4k };
  };

  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<Collection>(
    `${serverUrl}/api/v1/collection/${searchParams.collectionId}`,
    {
      fallbackData: collection,
      revalidateOnMount: true,
      refreshInterval: refreshIntervalHelper(
        returnCollectionDownloadItems(collection),
        15000
      ),
    }
  );

  const { data: genres } = useSWR<{ id: number; name: string }[]>(
    `${serverUrl}/api/v1/genres/movie`
  );

  const [downloadStatus, downloadStatus4k] = useMemo(() => {
    const downloadItems = returnCollectionDownloadItems(data);
    return [downloadItems.downloadStatus, downloadItems.downloadStatus4k];
  }, [data]);

  const [titles, titles4k] = useMemo(() => {
    return [
      data?.parts
        .filter((media) => (media.mediaInfo?.downloadStatus ?? []).length > 0)
        .map((title) => title.title),
      data?.parts
        .filter((media) => (media.mediaInfo?.downloadStatus4k ?? []).length > 0)
        .map((title) => title.title),
    ];
  }, [data?.parts]);

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <ErrorPage statusCode={404} />;
  }

  let collectionStatus = MediaStatus.UNKNOWN;
  let collectionStatus4k = MediaStatus.UNKNOWN;

  if (
    data.parts.every(
      (part) =>
        part.mediaInfo && part.mediaInfo.status === MediaStatus.AVAILABLE
    )
  ) {
    collectionStatus = MediaStatus.AVAILABLE;
  } else if (
    data.parts.some(
      (part) =>
        part.mediaInfo && part.mediaInfo.status === MediaStatus.AVAILABLE
    )
  ) {
    collectionStatus = MediaStatus.PARTIALLY_AVAILABLE;
  }

  if (
    data.parts.every(
      (part) =>
        part.mediaInfo && part.mediaInfo.status4k === MediaStatus.AVAILABLE
    )
  ) {
    collectionStatus4k = MediaStatus.AVAILABLE;
  } else if (
    data.parts.some(
      (part) =>
        part.mediaInfo && part.mediaInfo.status4k === MediaStatus.AVAILABLE
    )
  ) {
    collectionStatus4k = MediaStatus.PARTIALLY_AVAILABLE;
  }

  const hasRequestable =
    hasPermission([Permission.REQUEST, Permission.REQUEST_MOVIE], {
      type: 'or',
    }) &&
    data.parts.filter(
      (part) => !part.mediaInfo || part.mediaInfo.status === MediaStatus.UNKNOWN
    ).length > 0;

  const hasRequestable4k =
    settings.currentSettings.movie4kEnabled &&
    hasPermission([Permission.REQUEST_4K, Permission.REQUEST_4K_MOVIE], {
      type: 'or',
    }) &&
    data.parts.filter(
      (part) =>
        !part.mediaInfo || part.mediaInfo.status4k === MediaStatus.UNKNOWN
    ).length > 0;

  const collectionAttributes: React.ReactNode[] = [];

  collectionAttributes.push(
    intl.formatMessage(messages.numberofmovies, {
      count: data.parts.length,
    })
  );

  if (genres && data.parts.some((part) => part.genreIds.length)) {
    collectionAttributes.push(
      uniq(
        data.parts.reduce(
          (genresList: number[], curr) => genresList.concat(curr.genreIds),
          []
        )
      )
        .map((genreId) => (
          <Link
            href={`/discover/movies/genre/${genreId}`}
            key={`genre-${genreId}`}
            className="hover:underline"
          >
            {genres.find((g) => g.id === genreId)?.name}
          </Link>
        ))
        .reduce((prev, curr) => (
          <>
            {intl.formatMessage(globalMessages.delimitedlist, {
              a: prev,
              b: curr,
            })}
          </>
        ))
    );
  }

  const blacklistVisibility = hasPermission(
    [Permission.MANAGE_BLACKLIST, Permission.VIEW_BLACKLIST],
    { type: 'or' }
  );

  return (
    <ScrollView className="mt-16" contentContainerClassName="pb-6">
      {data.backdropPath && (
        <View className="absolute inset-0 -z-10 h-full w-full">
          <CachedImage
            type="tmdb"
            alt=""
            src={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${data.backdropPath}`}
            style={{ width: '100%', height: 400 }}
            contentFit="cover"
          />
          {/* <View
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(17, 24, 39, 0.47) 0%, rgba(17, 24, 39, 1) 100%)',
            }}
          /> */}
          <LinearGradient
            colors={['rgba(17, 24, 39, 0.47)', 'rgba(17, 24, 39, 1)']}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 400,
            }}
          />
        </View>
      )}
      <RequestModal
        tmdbId={data.id}
        show={requestModal}
        type="collection"
        is4k={is4k}
        onComplete={() => {
          revalidate();
          setRequestModal(false);
        }}
        onCancel={() => setRequestModal(false)}
      />
      <View className="mt-4 flex flex-col items-center pt-2 xl:flex-row xl:items-end">
        <View className="overflow-hidden rounded shadow md:rounded-lg md:shadow-2xl xl:mr-4">
          <CachedImage
            type="tmdb"
            src={
              data.posterPath
                ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.posterPath}`
                : '/images/overseerr_poster_not_found.png'
            }
            alt=""
            style={{ width: 150, height: 225 }}
          />
        </View>
        <View className="mt-4 flex flex-1 flex-col text-center text-white xl:mr-4 xl:mt-0 xl:text-left">
          <View className="mb-2 flex flex-col items-center space-x-2">
            <StatusBadge
              status={collectionStatus}
              downloadItem={downloadStatus}
              title={titles}
              inProgress={data.parts.some(
                (part) => (part.mediaInfo?.downloadStatus ?? []).length > 0
              )}
            />
            {settings.currentSettings.movie4kEnabled &&
              hasPermission(
                [Permission.REQUEST_4K, Permission.REQUEST_4K_MOVIE],
                {
                  type: 'or',
                }
              ) && (
                <StatusBadge
                  status={collectionStatus4k}
                  downloadItem={downloadStatus4k}
                  title={titles4k}
                  is4k
                  inProgress={data.parts.some(
                    (part) =>
                      (part.mediaInfo?.downloadStatus4k ?? []).length > 0
                  )}
                />
              )}
          </View>
          <ThemedText className="mt-2 text-center text-3xl">
            {data.name}
          </ThemedText>
          <View className="flex flex-row items-center justify-center">
            {collectionAttributes.length > 0 &&
              collectionAttributes
                .map((t, k) => <ThemedText key={k}>{t}</ThemedText>)
                .reduce((prev, curr) => (
                  <>
                    {prev}
                    <ThemedText className="mx-1.5">|</ThemedText>
                    {curr}
                  </>
                ))}
          </View>
        </View>
        <View className="media-actions flex flex-row justify-stretch gap-4">
          {(hasRequestable || hasRequestable4k) && (
            <ButtonWithDropdown
              buttonType="primary"
              onPress={() => {
                setRequestModal(true);
                setIs4k(!hasRequestable);
              }}
              text={
                <>
                  <ArrowDownTray color="#ffffff" />
                  <ThemedText>
                    {intl.formatMessage(
                      hasRequestable
                        ? messages.requestcollection
                        : messages.requestcollection4k
                    )}
                  </ThemedText>
                </>
              }
            >
              {hasRequestable && hasRequestable4k && (
                <ButtonWithDropdown.Item
                  buttonType="primary"
                  onPress={() => {
                    setRequestModal(true);
                    setIs4k(true);
                  }}
                >
                  <ArrowDownTray />
                  <ThemedText>
                    {intl.formatMessage(messages.requestcollection4k)}
                  </ThemedText>
                </ButtonWithDropdown.Item>
              )}
            </ButtonWithDropdown>
          )}
        </View>
      </View>
      {data.overview && (
        <View className="media-overview px-4">
          <View className="flex-1">
            <ThemedText className="text-2xl">
              {intl.formatMessage(messages.overview)}
            </ThemedText>
            <ThemedText className="pt-2 text-gray-400">
              {data.overview}
            </ThemedText>
          </View>
        </View>
      )}
      <ThemedText className="my-6 px-4 text-2xl">
        {intl.formatMessage(globalMessages.movies)}
      </ThemedText>
      <View className="px-2">
        <Slider
          sliderKey="collection-movies"
          isLoading={false}
          isEmpty={data.parts.length === 0}
          items={data.parts
            .filter((title) => {
              if (!blacklistVisibility)
                return title.mediaInfo?.status !== MediaStatus.BLACKLISTED;
              return title;
            })
            .map((title) => (
              <TitleCard
                key={`collection-movie-${title.id}`}
                id={title.id}
                isAddedToWatchlist={title.mediaInfo?.watchlists?.length ?? 0}
                image={title.posterPath}
                status={title.mediaInfo?.status}
                summary={title.overview}
                title={title.title}
                userScore={title.voteAverage}
                year={title.releaseDate}
                mediaType={title.mediaType}
              />
            ))}
        />
      </View>
    </ScrollView>
  );
};

export default CollectionDetails;
