import ImdbLogo from '@/assets/services/imdb.png';
import RTAudFresh from '@/assets/services/rt_aud_fresh.png';
import RTAudRotten from '@/assets/services/rt_aud_rotten.png';
import RTFresh from '@/assets/services/rt_fresh.png';
import RTRotten from '@/assets/services/rt_rotten.png';
import TmdbLogo from '@/assets/services/tmdb_logo.png';
// import BlacklistModal from '@/components/BlacklistModal';
import Button from '@/components/Common/Button';
import CachedImage from '@/components/Common/CachedImage';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import type { PlayButtonLink } from '@/components/Common/PlayButton';
import PlayButton from '@/components/Common/PlayButton';
import Tag from '@/components/Common/Tag';
import Tooltip from '@/components/Common/Tooltip';
import ExternalLinkBlock from '@/components/ExternalLinkBlock';
// import IssueModal from '@/components/IssueModal';
// import ManageSlideOver from '@/components/ManageSlideOver';
import MediaSlider from '@/components/MediaSlider';
import PersonCard from '@/components/PersonCard';
// import RequestButton from '@/components/RequestButton';
import ErrorPage from '@/components/ErrorPage';
import Slider from '@/components/Slider';
import StatusBadge from '@/components/StatusBadge';
import useDeepLinks from '@/hooks/useDeepLinks';
import useLocale from '@/hooks/useLocale';
import useSettings from '@/hooks/useSettings';
import { Permission, useUser } from '@/hooks/useUser';
import { type RatingResponse } from '@/jellyseerr/server/api/ratings';
import { sortCrewPriority } from '@/utils/creditHelpers';
import { refreshIntervalHelper } from '@/utils/refreshIntervalHelper';
import {
  // ArrowRightCircle,
  Cloud,
  // Cog,
  // ExclamationTriangle,
  // EyeSlash,
  Film,
  Play,
  Server,
  Ticket,
} from '@nandorojo/heroicons/24/outline';
import {
  // ChevronDoubleDown,
  // ChevronDoubleUp,
  MinusCircle,
  Star,
} from '@nandorojo/heroicons/24/solid';
// import { IssueStatus } from '@/jellyseerr/server/constants/issue';
import { MediaStatus, MediaType } from '@/jellyseerr/server/constants/media';
import { MediaServerType } from '@/jellyseerr/server/constants/server';
import type { MovieDetails as MovieDetailsType } from '@/jellyseerr/server/models/Movie';
// import { countries } from 'country-flag-icons';
// import 'country-flag-icons/3x2/flags.css';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import type { TmdbRelease } from '@/jellyseerr/server/api/themoviedb/interfaces';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import globalMessages from '@/utils/globalMessages';
import { toast } from '@backpackapp-io/react-native-toast';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams } from 'expo-router';
import uniqBy from 'lodash.uniqby';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import useSWR from 'swr';

const messages = getJellyseerrMessages('components.MovieDetails');

interface MovieDetailsProps {
  movie?: MovieDetailsType;
}

const MovieDetails = ({ movie }: MovieDetailsProps) => {
  const serverUrl = useServerUrl();
  const settings = useSettings();
  const { user, hasPermission } = useUser();
  const searchParams = useLocalSearchParams();
  const intl = useIntl();
  const { locale } = useLocale();
  // const [showManager, setShowManager] = useState(
  //   router.query.manage == '1' ? true : false
  // );
  const minStudios = 3;
  const [showMoreStudios, setShowMoreStudios] = useState(false);
  // const [showIssueModal, setShowIssueModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [toggleWatchlist, setToggleWatchlist] = useState<boolean>(
    !movie?.onUserWatchlist
  );
  // const [isBlacklistUpdating, setIsBlacklistUpdating] =
  //   useState<boolean>(false);
  // const [showBlacklistModal, setShowBlacklistModal] = useState(false);

  const {
    data,
    error,
    // mutate: revalidate,
  } = useSWR<MovieDetailsType>(
    `${serverUrl}/api/v1/movie/${searchParams.movieId}`,
    {
      fallbackData: movie,
      refreshInterval: refreshIntervalHelper(
        {
          downloadStatus: movie?.mediaInfo?.downloadStatus,
          downloadStatus4k: movie?.mediaInfo?.downloadStatus4k,
        },
        15000
      ),
    }
  );

  const { data: ratingData } = useSWR<RatingResponse>(
    `${serverUrl}/api/v1/movie/${searchParams.movieId}/ratingscombined`
  );

  const sortedCrew = useMemo(
    () => sortCrewPriority(data?.credits.crew ?? []),
    [data]
  );

  // useEffect(() => {
  //   setShowManager(router.query.manage == '1' ? true : false);
  // }, [router.query.manage]);

  // const closeBlacklistModal = useCallback(
  //   () => setShowBlacklistModal(false),
  //   []
  // );

  const { mediaUrl: plexUrl, mediaUrl4k: plexUrl4k } = useDeepLinks({
    mediaUrl: data?.mediaInfo?.mediaUrl,
    mediaUrl4k: data?.mediaInfo?.mediaUrl4k,
    iOSPlexUrl: data?.mediaInfo?.iOSPlexUrl,
    iOSPlexUrl4k: data?.mediaInfo?.iOSPlexUrl4k,
  });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <ErrorPage statusCode={404} />;
  }

  const showAllStudios = data.productionCompanies.length <= minStudios + 1;
  const mediaLinks: PlayButtonLink[] = [];

  if (
    plexUrl &&
    hasPermission([Permission.REQUEST, Permission.REQUEST_MOVIE], {
      type: 'or',
    })
  ) {
    mediaLinks.push({
      text: getAvalaibleMediaServerName(),
      url: plexUrl,
      svg: <Play color="#ffffff" />,
    });
  }

  if (
    settings.currentSettings.movie4kEnabled &&
    plexUrl4k &&
    hasPermission([Permission.REQUEST_4K, Permission.REQUEST_4K_MOVIE], {
      type: 'or',
    })
  ) {
    mediaLinks.push({
      text: getAvalaible4kMediaServerName(),
      url: plexUrl4k,
      svg: <Play color="#ffffff" />,
    });
  }
  const trailerUrl = data.relatedVideos
    ?.filter((r) => r.type === 'Trailer')
    .sort((a, b) => a.size - b.size)
    .pop()?.url;

  if (trailerUrl) {
    mediaLinks.push({
      text: intl.formatMessage(messages.watchtrailer),
      url: trailerUrl,
      svg: <Film color="#ffffff" />,
    });
  }

  const discoverRegion = user?.settings?.discoverRegion
    ? user.settings.discoverRegion
    : settings.currentSettings.discoverRegion
      ? settings.currentSettings.discoverRegion
      : 'US';

  const releases: TmdbRelease['release_dates'] = data.releases.results.find(
    (r: TmdbRelease) => r.iso_3166_1 === discoverRegion
  )?.release_dates;

  // Release date types:
  // 1. Premiere
  // 2. Theatrical (limited)
  // 3. Theatrical
  // 4. Digital
  // 5. Physical
  // 6. TV
  const filteredReleases = uniqBy(
    releases?.filter((r) => r.type > 2 && r.type < 6),
    'type'
  );

  const movieAttributes: React.ReactNode[] = [];

  const certification = releases?.find((r) => r.certification)?.certification;
  if (certification) {
    movieAttributes.push(
      <ThemedText className="rounded-lg border border-gray-300 px-1 py-0 text-gray-300">
        {certification}
      </ThemedText>
    );
  }

  if (data.runtime) {
    movieAttributes.push(
      <ThemedText className="text-gray-300">
        {intl.formatMessage(messages.runtime, { minutes: data.runtime })}
      </ThemedText>
    );
  }

  if (data.genres.length) {
    movieAttributes.push(
      data.genres
        .map((g) => (
          <Link
            href={`(tabs)/discover_movies?genre=${g.id}`}
            key={`genre-${g.id}`}
            className="text-gray-300 hover:underline"
          >
            {g.name}
          </Link>
        ))
        .reduce((prev, curr) => (
          <ThemedText className="text-gray-300">
            {intl.formatMessage(globalMessages.delimitedlist, {
              a: prev,
              b: curr,
            })}
          </ThemedText>
        ))
    );
  }

  const streamingRegion = user?.settings?.streamingRegion
    ? user.settings.streamingRegion
    : settings.currentSettings.streamingRegion
      ? settings.currentSettings.streamingRegion
      : 'US';
  const streamingProviders =
    data?.watchProviders?.find(
      (provider) => provider.iso_3166_1 === streamingRegion
    )?.flatrate ?? [];

  function getAvalaibleMediaServerName() {
    if (settings.currentSettings.mediaServerType === MediaServerType.EMBY) {
      return intl.formatMessage(messages.play, { mediaServerName: 'Emby' });
    }

    if (settings.currentSettings.mediaServerType === MediaServerType.PLEX) {
      return intl.formatMessage(messages.play, { mediaServerName: 'Plex' });
    }

    return intl.formatMessage(messages.play, { mediaServerName: 'Jellyfin' });
  }

  function getAvalaible4kMediaServerName() {
    if (settings.currentSettings.mediaServerType === MediaServerType.EMBY) {
      return intl.formatMessage(messages.play, { mediaServerName: 'Emby' });
    }

    if (settings.currentSettings.mediaServerType === MediaServerType.PLEX) {
      return intl.formatMessage(messages.play4k, { mediaServerName: 'Plex' });
    }

    return intl.formatMessage(messages.play4k, { mediaServerName: 'Jellyfin' });
  }

  const onClickWatchlistBtn = async (): Promise<void> => {
    setIsUpdating(true);

    const res = await fetch(serverUrl + '/api/v1/watchlist', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tmdbId: movie?.id,
        mediaType: MediaType.MOVIE,
        title: movie?.title,
      }),
    });

    if (!res.ok) {
      toast.error(intl.formatMessage(messages.watchlistError));

      setIsUpdating(false);
      return;
    }

    const data = await res.json();

    if (data) {
      toast.success(
        <ThemedText>
          {intl.formatMessage(messages.watchlistSuccess, {
            title: movie?.title,
            strong: (msg: React.ReactNode) => (
              <ThemedText className="font-bold">{msg}</ThemedText>
            ),
          })}
        </ThemedText>
      );
    }

    setIsUpdating(false);
    setToggleWatchlist((prevState) => !prevState);
  };

  const onClickDeleteWatchlistBtn = async (): Promise<void> => {
    setIsUpdating(true);
    try {
      const res = await fetch(serverUrl + `/api/v1/watchlist/${movie?.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();

      if (res.status === 204) {
        toast(
          <ThemedText>
            {intl.formatMessage(messages.watchlistDeleted, {
              title: movie?.title,
              strong: (msg: React.ReactNode) => (
                <ThemedText className="font-bold">{msg}</ThemedText>
              ),
            })}
          </ThemedText>
        );
      }
    } catch {
      toast.error(intl.formatMessage(messages.watchlistError));
    } finally {
      setIsUpdating(false);
      setToggleWatchlist((prevState) => !prevState);
    }
  };

  // const onClickHideItemBtn = async (): Promise<void> => {
  //   setIsBlacklistUpdating(true);

  //   const res = await fetch(serverUrl + '/api/v1/blacklist', {
  //     method: 'POST',
  //     headers: {
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       tmdbId: movie?.id,
  //       mediaType: 'movie',
  //       title: movie?.title,
  //       user: user?.id,
  //     }),
  //   });

  //   if (res.status === 201) {
  //     toast.success(
  //       <ThemedText>
  //         {intl.formatMessage(globalMessages.blacklistSuccess, {
  //           title: movie?.title,
  //           strong: (msg: React.ReactNode) => <strong>{msg}</strong>,
  //         })}
  //       </ThemedText>
  //     );

  //     revalidate();
  //   } else if (res.status === 412) {
  //     toast(
  //       <ThemedText>
  //         {intl.formatMessage(globalMessages.blacklistDuplicateError, {
  //           title: movie?.title,
  //           strong: (msg: React.ReactNode) => <strong>{msg}</strong>,
  //         })}
  //       </ThemedText>
  //     );
  //   } else {
  //     toast.error(intl.formatMessage(globalMessages.blacklistError));
  //   }

  //   setIsBlacklistUpdating(false);
  //   closeBlacklistModal();
  // };

  // const showHideButton = hasPermission([Permission.MANAGE_BLACKLIST], {
  //   type: 'or',
  // });

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
            // Background Linear Gradient
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
      {/* <IssueModal
        onCancel={() => setShowIssueModal(false)}
        show={showIssueModal}
        mediaType="movie"
        tmdbId={data.id}
      /> */}
      {/* <ManageSlideOver
        data={data}
        mediaType="movie"
        onClose={() => {
          setShowManager(false);
          router.push({
            pathname: router.pathname,
            query: { movieId: searchParams.movieId },
          });
        }}
        revalidate={() => revalidate()}
        show={showManager}
      /> */}
      {/* <BlacklistModal
        tmdbId={data.id}
        type="movie"
        show={showBlacklistModal}
        onCancel={closeBlacklistModal}
        onComplete={onClickHideItemBtn}
        isUpdating={isBlacklistUpdating}
      /> */}
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
              fontSize="text-base"
              status={data.mediaInfo?.status}
              downloadItem={data.mediaInfo?.downloadStatus}
              title={data.title}
              inProgress={(data.mediaInfo?.downloadStatus ?? []).length > 0}
              tmdbId={data.mediaInfo?.tmdbId}
              mediaType="movie"
              plexUrl={plexUrl}
              serviceUrl={data.mediaInfo?.serviceUrl}
            />
            {settings.currentSettings.movie4kEnabled &&
              hasPermission(
                [
                  Permission.MANAGE_REQUESTS,
                  Permission.REQUEST_4K,
                  Permission.REQUEST_4K_MOVIE,
                ],
                {
                  type: 'or',
                }
              ) && (
                <StatusBadge
                  fontSize="text-base"
                  status={data.mediaInfo?.status4k}
                  downloadItem={data.mediaInfo?.downloadStatus4k}
                  title={data.title}
                  is4k
                  inProgress={
                    (data.mediaInfo?.downloadStatus4k ?? []).length > 0
                  }
                  tmdbId={data.mediaInfo?.tmdbId}
                  mediaType="movie"
                  plexUrl={plexUrl4k}
                  serviceUrl={data.mediaInfo?.serviceUrl4k}
                />
              )}
          </View>
          <ThemedText className="mt-2 text-center text-3xl">
            {data.title}{' '}
            {data.releaseDate && (
              <ThemedText className="media-year">
                ({data.releaseDate.slice(0, 4)})
              </ThemedText>
            )}
          </ThemedText>
          <View className="flex flex-row items-center justify-center">
            {movieAttributes.length > 0 &&
              movieAttributes.reduce((prev, curr) => (
                <>
                  {prev}
                  <ThemedText className="mx-1.5">|</ThemedText>
                  {curr}
                </>
              ))}
          </View>
        </View>
        <View className="media-actions flex flex-row justify-stretch gap-4">
          {/* {showHideButton &&
            data?.mediaInfo?.status !== MediaStatus.PROCESSING &&
            data?.mediaInfo?.status !== MediaStatus.AVAILABLE &&
            data?.mediaInfo?.status !== MediaStatus.PARTIALLY_AVAILABLE &&
            data?.mediaInfo?.status !== MediaStatus.PENDING &&
            data?.mediaInfo?.status !== MediaStatus.BLACKLISTED && (
              <Tooltip
                content={intl.formatMessage(globalMessages.addToBlacklist)}
              >
                <Button
                  buttonType={'ghost'}
                  className="z-40 mr-2"
                  onClick={() => setShowBlacklistModal(true)}
                >
                  <EyeSlash className={'h-3'} />
                </Button>
              </Tooltip>
            )} */}
          {data?.mediaInfo?.status !== MediaStatus.BLACKLISTED && (
            <>
              {toggleWatchlist ? (
                <Button
                  buttonType={'ghost'}
                  className="z-40 flex flex-row items-center gap-2"
                  onClick={onClickWatchlistBtn}
                >
                  {isUpdating ? (
                    <LoadingSpinner size={21} />
                  ) : (
                    <Star color="#fcd34d" />
                  )}
                  {/* <ThemedText>
                    {intl.formatMessage(messages.addtowatchlist)}
                  </ThemedText> */}
                </Button>
              ) : (
                <Button
                  buttonType={'ghost'}
                  className="z-40 flex flex-row items-center gap-2"
                  onClick={onClickDeleteWatchlistBtn}
                >
                  {isUpdating ? (
                    <LoadingSpinner size={21} />
                  ) : (
                    <MinusCircle color="#ffffff" />
                  )}
                  {/* <ThemedText>
                    {intl.formatMessage(messages.removefromwatchlist)}
                  </ThemedText> */}
                </Button>
              )}
            </>
          )}
          <PlayButton links={mediaLinks} />
          {/* <RequestButton
            mediaType="movie"
            media={data.mediaInfo}
            tmdbId={data.id}
            onUpdate={() => revalidate()}
          /> */}
          {/* {(data.mediaInfo?.status === MediaStatus.AVAILABLE ||
            (settings.currentSettings.movie4kEnabled &&
              hasPermission(
                [Permission.REQUEST_4K, Permission.REQUEST_4K_MOVIE],
                {
                  type: 'or',
                }
              ) &&
              data.mediaInfo?.status4k === MediaStatus.AVAILABLE)) &&
            hasPermission(
              [Permission.CREATE_ISSUES, Permission.MANAGE_ISSUES],
              {
                type: 'or',
              }
            ) && (
              <Tooltip content={intl.formatMessage(messages.reportissue)}>
                <Button
                  buttonType="warning"
                  onClick={() => setShowIssueModal(true)}
                  className="ml-2 first:ml-0"
                >
                  <ExclamationTriangle />
                </Button>
              </Tooltip>
            )} */}
          {/* {hasPermission(Permission.MANAGE_REQUESTS) &&
            data.mediaInfo &&
            (data.mediaInfo.jellyfinMediaId ||
              data.mediaInfo.jellyfinMediaId4k ||
              data.mediaInfo.status !== MediaStatus.UNKNOWN ||
              data.mediaInfo.status4k !== MediaStatus.UNKNOWN) && (
              <Tooltip content={intl.formatMessage(messages.managemovie)}>
                <Button
                  buttonType="ghost"
                  onClick={() => setShowManager(true)}
                  className="relative ml-2 first:ml-0"
                >
                  <Cog className="!mr-0" />
                  {hasPermission(
                    [Permission.MANAGE_ISSUES, Permission.VIEW_ISSUES],
                    {
                      type: 'or',
                    }
                  ) &&
                    (
                      data.mediaInfo?.issues.filter(
                        (issue) => issue.status === IssueStatus.OPEN
                      ) ?? []
                    ).length > 0 && (
                      <>
                        <View className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-600" />
                        <View className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-red-600" />
                      </>
                    )}
                </Button>
              </Tooltip>
            )} */}
        </View>
      </View>
      <View className="media-overview px-6">
        <View className="media-overview-left">
          {data.tagline && (
            <ThemedText className="mb-4 text-xl italic text-gray-400 lg:text-2xl">
              {data.tagline}
            </ThemedText>
          )}
          <ThemedText className="text-2xl ">
            {intl.formatMessage(messages.overview)}
          </ThemedText>
          <ThemedText className="pt-2 text-gray-400">
            {data.overview
              ? data.overview
              : intl.formatMessage(messages.overviewunavailable)}
          </ThemedText>
          {sortedCrew.length > 0 && (
            <>
              <View className="-m-3 mt-6 flex flex-row flex-wrap">
                {sortedCrew.slice(0, 6).map((person) => (
                  <View
                    key={`crew-${person.job}-${person.id}`}
                    className="w-1/2 flex-grow p-3"
                    style={{ flexGrow: 0.5 }}
                  >
                    <View className="flex flex-col">
                      <ThemedText className="font-bold text-gray-300">
                        {person.job}
                      </ThemedText>
                      <Link
                        href={`/person/${person.id}`}
                        className="text-gray-400"
                      >
                        {person.name}
                      </Link>
                    </View>
                  </View>
                ))}
              </View>
              {/* <View className="mt-4 flex flex-row justify-end">
                <Link
                  href={`(tabs)/movie/${data.id}/crew`}
                  asChild
                >
                  <Pressable className="flex flex-row items-center transition duration-300 hover:text-gray-100 gap-1.5">
                    <ThemedText className="text-gray-400">{intl.formatMessage(messages.viewfullcrew)}</ThemedText>
                    <ArrowRightCircle width={20} height={20} color="#9ca3af" />
                  </Pressable>
                </Link>
              </View> */}
            </>
          )}
          {data.keywords.length > 0 && (
            <View className="mt-6 flex flex-row flex-wrap gap-x-2">
              {data.keywords.map((keyword) => (
                <Link
                  href={`(tabs)/discover_movies?keywords=${keyword.id}`}
                  key={`keyword-id-${keyword.id}`}
                  asChild
                >
                  <Pressable className="mb-2 mr-2 inline-flex flex-row last:mr-0">
                    <Tag>{keyword.name}</Tag>
                  </Pressable>
                </Link>
              ))}
            </View>
          )}
        </View>
        <View className="mt-8 w-full lg:mt-0 lg:w-80">
          {data.collection && (
            <View className="mb-6">
              <Link href={`(tabs)/collection/${data.collection.id}`} asChild>
                <Pressable>
                  <View className="group relative z-0 cursor-pointer overflow-hidden rounded-lg border border-gray-700 bg-gray-800 bg-cover bg-center transition duration-300 hover:border-gray-500">
                    <View className="absolute inset-0 z-0 opacity-30">
                      <CachedImage
                        type="tmdb"
                        src={`https://image.tmdb.org/t/p/w1440_and_h320_multi_faces/${data.collection.backdropPath}`}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </View>
                    <View className="relative z-10 flex flex-row items-center justify-between p-4 text-gray-200 transition duration-300 group-hover:text-white">
                      <ThemedText className="text-lg">
                        {data.collection.name}
                      </ThemedText>
                      <Button
                        onClick={() => {}}
                        buttonType="ghost"
                        className="!bg-gray-700"
                      >
                        {intl.formatMessage(globalMessages.view)}
                      </Button>
                    </View>
                  </View>
                </Pressable>
              </Link>
            </View>
          )}
          <View className="rounded-lg border border-gray-700 bg-gray-900 text-sm font-bold text-gray-300 shadow">
            {(!!data.voteCount ||
              (ratingData?.rt?.criticsRating &&
                !!ratingData?.rt?.criticsScore) ||
              (ratingData?.rt?.audienceRating &&
                !!ratingData?.rt?.audienceScore) ||
              ratingData?.imdb?.criticsScore) && (
              <View className="flex flex-row items-center justify-center gap-4 space-x-5 border-b border-gray-700 px-4 py-2 font-medium">
                {ratingData?.rt?.criticsRating &&
                  !!ratingData?.rt?.criticsScore && (
                    <Tooltip
                      content={intl.formatMessage(messages.rtcriticsscore)}
                    >
                      <Pressable
                        className="flex flex-row items-center gap-1.5"
                        onPress={() => Linking.openURL(ratingData.rt.url)}
                      >
                        {ratingData.rt.criticsRating === 'Rotten' ? (
                          <Image
                            source={RTRotten}
                            style={{ width: 24, height: 24 }}
                            contentFit="contain"
                          />
                        ) : (
                          <Image
                            source={RTFresh}
                            style={{ width: 24, height: 24 }}
                            contentFit="contain"
                          />
                        )}
                        <ThemedText>{ratingData.rt.criticsScore}%</ThemedText>
                      </Pressable>
                    </Tooltip>
                  )}
                {ratingData?.rt?.audienceRating &&
                  !!ratingData?.rt?.audienceScore && (
                    <Tooltip
                      content={intl.formatMessage(messages.rtaudiencescore)}
                    >
                      <Pressable
                        className="flex flex-row items-center gap-1.5"
                        onPress={() => Linking.openURL(ratingData.rt.url)}
                      >
                        {ratingData.rt.audienceRating === 'Spilled' ? (
                          <Image
                            source={RTAudRotten}
                            style={{ width: 24, height: 24 }}
                            contentFit="contain"
                          />
                        ) : (
                          <Image
                            source={RTAudFresh}
                            style={{ width: 24, height: 24 }}
                            contentFit="contain"
                          />
                        )}
                        <ThemedText>{ratingData.rt.audienceScore}%</ThemedText>
                      </Pressable>
                    </Tooltip>
                  )}
                {ratingData?.imdb?.criticsScore && (
                  <Tooltip content={intl.formatMessage(messages.imdbuserscore)}>
                    <Pressable
                      className="flex flex-row items-center gap-1.5"
                      onPress={() => Linking.openURL(ratingData.imdb.url)}
                    >
                      <Image
                        source={ImdbLogo}
                        className="mr-1"
                        style={{ width: 24, height: 24 }}
                        contentFit="contain"
                      />
                      <ThemedText>{ratingData.imdb.criticsScore}</ThemedText>
                    </Pressable>
                  </Tooltip>
                )}
                {!!data.voteCount && (
                  <Tooltip content={intl.formatMessage(messages.tmdbuserscore)}>
                    <Pressable
                      className="flex flex-row items-center gap-1.5"
                      onPress={() =>
                        Linking.openURL(
                          `https://www.themoviedb.org/movie/${data.id}?language=${locale}`
                        )
                      }
                    >
                      <Image
                        source={TmdbLogo}
                        className="mr-1"
                        style={{ width: 24, height: 24 }}
                        contentFit="contain"
                      />
                      <ThemedText>
                        {Math.round(data.voteAverage * 10)}%
                      </ThemedText>
                    </Pressable>
                  </Tooltip>
                )}
              </View>
            )}
            {data.originalTitle &&
              data.originalLanguage !== locale.slice(0, 2) && (
                <View className="flex justify-between border-b border-gray-700 px-4 py-2">
                  <ThemedText>
                    {intl.formatMessage(messages.originaltitle)}
                  </ThemedText>
                  <ThemedText className="ml-2 text-right text-sm font-normal text-gray-400">
                    {data.originalTitle}
                  </ThemedText>
                </View>
              )}
            <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
              <ThemedText className="shrink">
                {intl.formatMessage(globalMessages.status)}
              </ThemedText>
              <ThemedText className="ml-2 shrink text-right text-sm font-normal text-gray-400">
                {data.status}
              </ThemedText>
            </View>
            {filteredReleases && filteredReleases.length > 0 ? (
              <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
                <ThemedText className="shrink">
                  {intl.formatMessage(messages.releasedate, {
                    releaseCount: filteredReleases.length,
                  })}
                </ThemedText>
                <View className="ml-2">
                  {filteredReleases.map((r, i) => (
                    <View
                      key={`release-${r.type}-${r.release_date}`}
                      className="flex shrink flex-row items-end justify-end"
                    >
                      {r.type === 3 ? (
                        // Theatrical
                        <Ticket width={16} height={16} color="#9ca3af" />
                      ) : r.type === 4 ? (
                        // Digital
                        <Cloud width={16} height={16} color="#9ca3af" />
                      ) : (
                        // Physical
                        <Server width={16} height={16} color="#9ca3af" />
                      )}
                      <ThemedText className="ml-1.5 text-right text-sm font-normal text-gray-400">
                        {intl.formatDate(r.release_date, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          timeZone: 'UTC',
                        })}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              data.releaseDate && (
                <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
                  <ThemedText className="shrink">
                    {intl.formatMessage(messages.releasedate, {
                      releaseCount: 1,
                    })}
                  </ThemedText>
                  <ThemedText className="ml-2 shrink text-right text-sm font-normal text-gray-400">
                    {intl.formatDate(data.releaseDate, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </ThemedText>
                </View>
              )
            )}
            {data.revenue > 0 && (
              <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
                <ThemedText className="shrink">
                  {intl.formatMessage(messages.revenue)}
                </ThemedText>
                <ThemedText className="ml-2 shrink text-right text-sm font-normal text-gray-400">
                  {intl.formatNumber(data.revenue, {
                    currency: 'USD',
                    style: 'currency',
                  })}
                </ThemedText>
              </View>
            )}
            {data.budget > 0 && (
              <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
                <ThemedText className="shrink">
                  {intl.formatMessage(messages.budget)}
                </ThemedText>
                <ThemedText className="ml-2 shrink text-right text-sm font-normal text-gray-400">
                  {intl.formatNumber(data.budget, {
                    currency: 'USD',
                    style: 'currency',
                  })}
                </ThemedText>
              </View>
            )}
            {data.originalLanguage && (
              <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
                <ThemedText className="shrink">
                  {intl.formatMessage(messages.originallanguage)}
                </ThemedText>
                <ThemedText className="ml-2 shrink text-right text-sm font-normal text-gray-400">
                  <Link
                    href={`(tabs)/discover_movies/language/${data.originalLanguage}`}
                  >
                    {/* {intl.formatDisplayName(data.originalLanguage, {
                      type: 'language',
                      fallback: 'none',
                    }) ??
                      data.spokenLanguages.find(
                        (lng) => lng.iso_639_1 === data.originalLanguage
                      )?.name} */}
                    {
                      data.spokenLanguages.find(
                        (lng) => lng.iso_639_1 === data.originalLanguage
                      )?.name
                    }
                  </Link>
                </ThemedText>
              </View>
            )}
            {data.productionCountries.length > 0 && (
              <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
                <ThemedText className="shrink">
                  {intl.formatMessage(messages.productioncountries, {
                    countryCount: data.productionCountries.length,
                  })}
                </ThemedText>
                <View className="ml-2">
                  {data.productionCountries.map((c) => {
                    return (
                      <View
                        className="flex flex-row items-end justify-end text-gray-400"
                        key={`prodcountry-${c.iso_3166_1}`}
                      >
                        {/* {countries.includes(c.iso_3166_1) && (
                          <ThemedText
                            className={`mr-1.5 text-xs leading-5 flag:${c.iso_3166_1}`}
                          />
                        )} */}
                        <ThemedText className="text-right text-sm font-normal text-gray-400">
                          {/* {intl.formatDisplayName(c.iso_3166_1, {
                            type: 'region',
                            fallback: 'none',
                          }) ?? c.name} */}
                          {c.name}
                        </ThemedText>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
            {data.productionCompanies.length > 0 && (
              <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
                <ThemedText className="shrink">
                  {intl.formatMessage(messages.studio, {
                    studioCount: data.productionCompanies.length,
                  })}
                </ThemedText>
                <View className="ml-2">
                  {data.productionCompanies
                    .slice(
                      0,
                      showAllStudios || showMoreStudios
                        ? data.productionCompanies.length
                        : minStudios
                    )
                    .map((s) => {
                      return (
                        <Link
                          href={`(tabs)/discover_movies/studio/${s.id}`}
                          key={`studio-${s.id}`}
                          className="text-right text-sm font-normal text-gray-400"
                        >
                          {s.name}
                        </Link>
                      );
                    })}
                  {!showAllStudios && (
                    <ThemedText className="text-right text-sm font-normal text-gray-400">
                      ...
                    </ThemedText>
                  )}
                  {/* {!showAllStudios && (
                    <Button
                      onClick={() => {
                        setShowMoreStudios(!showMoreStudios);
                      }}
                    >
                      <ThemedText className="flex flex-row items-center">
                        {intl.formatMessage(
                          !showMoreStudios
                            ? messages.showmore
                            : messages.showless
                        )}
                        {!showMoreStudios ? (
                          <ChevronDoubleDown className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDoubleUp className="ml-1 h-4 w-4" />
                        )}
                      </ThemedText>
                    </Button>
                  )} */}
                </View>
              </View>
            )}
            {!!streamingProviders.length && (
              <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
                <ThemedText className="shrink">
                  {intl.formatMessage(messages.streamingproviders)}
                </ThemedText>
                <ThemedText className="ml-2 shrink text-right text-sm font-normal text-gray-400">
                  {streamingProviders.map((p) => {
                    return (
                      <ThemedText className="block" key={`provider-${p.id}`}>
                        {p.name}
                      </ThemedText>
                    );
                  })}
                </ThemedText>
              </View>
            )}
            <View className="flex flex-row justify-between px-4 py-2">
              <ExternalLinkBlock
                mediaType="movie"
                tmdbId={data.id}
                tvdbId={data.externalIds.tvdbId}
                imdbId={data.externalIds.imdbId}
                rtUrl={ratingData?.rt?.url}
                mediaUrl={
                  data.mediaInfo?.mediaUrl ?? data.mediaInfo?.mediaUrl4k
                }
              />
            </View>
          </View>
        </View>
      </View>
      {data.credits.cast.length > 0 && (
        <>
          <View className="slider-header px-2">
            {/* <Link href={`(tabs)movieId/${data.id}/cast`} asChild>
              <Pressable> */}
            <View className="flex min-w-0 flex-row items-center gap-2">
              <ThemedText className="truncate text-2xl font-bold">
                {intl.formatMessage(messages.cast)}
              </ThemedText>
              {/* <ArrowRightCircle color="#ffffff" /> */}
            </View>
            {/* </Pressable>
            </Link> */}
          </View>
          <Slider
            sliderKey="cast"
            isLoading={false}
            isEmpty={false}
            items={data.credits.cast.slice(0, 20).map((person) => (
              <PersonCard
                key={`cast-item-${person.id}`}
                personId={person.id}
                name={person.name}
                subName={person.character}
                profilePath={person.profilePath}
              />
            ))}
          />
        </>
      )}
      <MediaSlider
        sliderKey="recommendations"
        title={intl.formatMessage(messages.recommendations)}
        url={`/api/v1/movie/${searchParams.movieId}/recommendations`}
        linkUrl={`(tabs)/movie/${data.id}/recommendations`}
        // hideWhenEmpty
      />
      <MediaSlider
        sliderKey="similar"
        title={intl.formatMessage(messages.similar)}
        url={`/api/v1/movie/${searchParams.movieId}/similar`}
        linkUrl={`(tabs)/movie/${data.id}/similar`}
        // hideWhenEmpty
      />
    </ScrollView>
  );
};

export default MovieDetails;
