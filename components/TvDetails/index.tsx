import RTAudFresh from '@/assets/services/rt_aud_fresh.png';
import RTAudRotten from '@/assets/services/rt_aud_rotten.png';
import RTFresh from '@/assets/services/rt_fresh.png';
import RTRotten from '@/assets/services/rt_rotten.png';
import TmdbLogo from '@/assets/services/tmdb_logo.png';
// import Badge from '@/components/Common/Badge';
import Button from '@/components/Common/Button';
import CachedImage from '@/components/Common/CachedImage';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import type { PlayButtonLink } from '@/components/Common/PlayButton';
import PlayButton from '@/components/Common/PlayButton';
// import StatusBadgeMini from '@/components/Common/StatusBadgeMini';
import Tag from '@/components/Common/Tag';
import Tooltip from '@/components/Common/Tooltip';
import ExternalLinkBlock from '@/components/ExternalLinkBlock';
// import IssueModal from '@/components/IssueModal';
// import ManageSlideOver from '@/components/ManageSlideOver';
import MediaSlider from '@/components/MediaSlider';
import PersonCard from '@/components/PersonCard';
import RequestButton from '@/components/RequestButton';
import RequestModal from '@/components/RequestModal';
import Slider from '@/components/Slider';
import StatusBadge from '@/components/StatusBadge';
// import Season from '@/components/TvDetails/Season';
import ErrorPage from '@/components/ErrorPage';
import useDeepLinks from '@/hooks/useDeepLinks';
import useLocale from '@/hooks/useLocale';
import useSettings from '@/hooks/useSettings';
import { Permission, useUser } from '@/hooks/useUser';
import { sortCrewPriority } from '@/utils/creditHelpers';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import globalMessages from '@/utils/globalMessages';
import { refreshIntervalHelper } from '@/utils/refreshIntervalHelper';
// import { Disclosure, Transition } from '@headlessui/react';
import type { RTRating } from '@/jellyseerr/server/api/rating/rottentomatoes';
import { ANIME_KEYWORD_ID } from '@/jellyseerr/server/api/themoviedb/constants';
import {
  Film,
  // ArrowRightCircle,
  // Cog,
  // ExclamationTriangle,
  MinusCircle,
  Play,
  Star,
} from '@nandorojo/heroicons/24/outline';
// import { ChevronDown } from '@nandorojo/heroicons/24/solid';
// import { IssueStatus } from '@/jellyseerr/server/constants/issue';
import {
  MediaRequestStatus,
  MediaStatus,
  MediaType,
} from '@/jellyseerr/server/constants/media';
import { MediaServerType } from '@/jellyseerr/server/constants/server';
import type { Crew } from '@/jellyseerr/server/models/common';
import type { TvDetails as TvDetailsType } from '@/jellyseerr/server/models/Tv';
// import { countries } from 'country-flag-icons';
// import 'country-flag-icons/3x2/flags.css';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import { toast } from '@backpackapp-io/react-native-toast';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import useSWR from 'swr';

const messages = getJellyseerrMessages('components.TvDetails');

interface TvDetailsProps {
  tv?: TvDetailsType;
}

const TvDetails = ({ tv }: TvDetailsProps) => {
  const serverUrl = useServerUrl();
  const settings = useSettings();
  const { user, hasPermission } = useUser();
  const searchParams = useLocalSearchParams();
  const intl = useIntl();
  const { locale } = useLocale();
  const [showRequestModal, setShowRequestModal] = useState(false);
  // const [showManager, setShowManager] = useState(
  //   router.query.manage === '1' ? true : false
  // );
  // const [showIssueModal, setShowIssueModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [toggleWatchlist, setToggleWatchlist] = useState<boolean>(
    !tv?.onUserWatchlist
  );
  // const [isBlacklistUpdating, setIsBlacklistUpdating] =
  //   useState<boolean>(false);
  // const [showBlacklistModal, setShowBlacklistModal] = useState(false);

  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<TvDetailsType>(`${serverUrl}/api/v1/tv/${searchParams.tvId}`, {
    fallbackData: tv,
    refreshInterval: refreshIntervalHelper(
      {
        downloadStatus: tv?.mediaInfo?.downloadStatus,
        downloadStatus4k: tv?.mediaInfo?.downloadStatus4k,
      },
      15000
    ),
  });

  const { data: ratingData } = useSWR<RTRating>(
    `${serverUrl}/api/v1/tv/${searchParams.tvId}/ratings`
  );

  const sortedCrew = useMemo(
    () => sortCrewPriority(data?.credits.crew ?? []),
    [data]
  );

  // useEffect(() => {
  //   setShowManager(router.query.manage == '1' ? true : false);
  // }, [router.query.manage]);

  const { mediaUrl: plexUrl, mediaUrl4k: plexUrl4k } = useDeepLinks({
    mediaUrl: data?.mediaInfo?.mediaUrl,
    mediaUrl4k: data?.mediaInfo?.mediaUrl4k,
    iOSPlexUrl: data?.mediaInfo?.iOSPlexUrl,
    iOSPlexUrl4k: data?.mediaInfo?.iOSPlexUrl4k,
  });

  if (!data && !error) {
    return (
      <View className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </View>
    );
  }

  if (!data) {
    return <ErrorPage statusCode={404} />;
  }

  const mediaLinks: PlayButtonLink[] = [];

  if (
    plexUrl &&
    hasPermission([Permission.REQUEST, Permission.REQUEST_TV], {
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
    settings.currentSettings.series4kEnabled &&
    plexUrl4k &&
    hasPermission([Permission.REQUEST_4K, Permission.REQUEST_4K_TV], {
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
  const seriesAttributes: React.ReactNode[] = [];

  const contentRating = data.contentRatings.results.find(
    (r) => r.iso_3166_1 === discoverRegion
  )?.rating;
  if (contentRating) {
    seriesAttributes.push(
      <ThemedText className="rounded-lg border border-gray-300 px-1 py-0 text-gray-300">
        {contentRating}
      </ThemedText>
    );
  }

  // Does NOT include "Specials"
  const seasonCount = data.seasons.filter(
    (season) => season.seasonNumber !== 0 && season.episodeCount !== 0
  ).length;

  if (seasonCount) {
    seriesAttributes.push(
      <ThemedText className="text-gray-300">
        {intl.formatMessage(messages.seasons, { seasonCount: seasonCount })}
      </ThemedText>
    );
  }

  if (data.genres.length) {
    seriesAttributes.push(
      data.genres
        .map((g) => (
          <Link
            href={`(tabs)/discover_tv?genre=${g.id}`}
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

  const getAllRequestedSeasons = (is4k: boolean): number[] => {
    const requestedSeasons = (data?.mediaInfo?.requests ?? [])
      .filter(
        (request) =>
          request.is4k === is4k &&
          request.status !== MediaRequestStatus.DECLINED
      )
      .reduce((requestedSeasons, request) => {
        return [
          ...requestedSeasons,
          ...request.seasons.map((sr) => sr.seasonNumber),
        ];
      }, [] as number[]);

    const availableSeasons = (data?.mediaInfo?.seasons ?? [])
      .filter(
        (season) =>
          (season[is4k ? 'status4k' : 'status'] === MediaStatus.AVAILABLE ||
            season[is4k ? 'status4k' : 'status'] ===
              MediaStatus.PARTIALLY_AVAILABLE ||
            season[is4k ? 'status4k' : 'status'] === MediaStatus.PROCESSING) &&
          !requestedSeasons.includes(season.seasonNumber)
      )
      .map((season) => season.seasonNumber);

    return [...requestedSeasons, ...availableSeasons];
  };

  const showHasSpecials = data.seasons.some(
    (season) =>
      season.seasonNumber === 0 &&
      settings.currentSettings.enableSpecialEpisodes
  );

  const isComplete =
    (showHasSpecials ? seasonCount + 1 : seasonCount) <=
    getAllRequestedSeasons(false).length;

  const is4kComplete =
    (showHasSpecials ? seasonCount + 1 : seasonCount) <=
    getAllRequestedSeasons(true).length;

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

    return intl.formatMessage(messages.play, { mediaServerName: 'Jellyfin' });
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
        tmdbId: tv?.id,
        mediaType: MediaType.TV,
        title: tv?.name,
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
            title: tv?.name,
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

    const res = await fetch(serverUrl + '/api/v1/watchlist/' + tv?.id, {
      method: 'DELETE',
    });

    if (!res.ok) {
      toast.error(intl.formatMessage(messages.watchlistError));

      setIsUpdating(false);
      return;
    }

    if (res.status === 204) {
      toast(
        <ThemedText>
          {intl.formatMessage(messages.watchlistDeleted, {
            title: tv?.name,
            strong: (msg: React.ReactNode) => (
              <ThemedText className="font-bold">{msg}</ThemedText>
            ),
          })}
        </ThemedText>
      );
      setIsUpdating(false);
      setToggleWatchlist((prevState) => !prevState);
    }
  };

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
      {/* <BlacklistModal
        tmdbId={data.id}
        type="tv"
        show={showBlacklistModal}
        onCancel={closeBlacklistModal}
        onComplete={onClickHideItemBtn}
        isUpdating={isBlacklistUpdating}
      /> */}
      {/* <IssueModal
        onCancel={() => setShowIssueModal(false)}
        show={showIssueModal}
        mediaType="tv"
        tmdbId={data.id}
      /> */}
      <RequestModal
        tmdbId={data.id}
        show={showRequestModal}
        type="tv"
        onComplete={() => {
          revalidate();
          setShowRequestModal(false);
        }}
        onCancel={() => setShowRequestModal(false)}
      />
      {/* <ManageSlideOver
        data={data}
        mediaType="tv"
        onClose={() => {
          setShowManager(false);
          router.push({
            pathname: router.pathname,
            query: { tvId: router.query.tvId },
          });
        }}
        revalidate={() => revalidate()}
        show={showManager}
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
              status={data.mediaInfo?.status}
              downloadItem={data.mediaInfo?.downloadStatus}
              title={data.name}
              inProgress={(data.mediaInfo?.downloadStatus ?? []).length > 0}
              tmdbId={data.mediaInfo?.tmdbId}
              mediaType="tv"
              plexUrl={plexUrl}
              serviceUrl={data.mediaInfo?.serviceUrl}
            />
            {settings.currentSettings.series4kEnabled &&
              hasPermission(
                [
                  Permission.MANAGE_REQUESTS,
                  Permission.REQUEST_4K,
                  Permission.REQUEST_4K_TV,
                ],
                {
                  type: 'or',
                }
              ) && (
                <StatusBadge
                  status={data.mediaInfo?.status4k}
                  downloadItem={data.mediaInfo?.downloadStatus4k}
                  title={data.name}
                  is4k
                  inProgress={
                    (data.mediaInfo?.downloadStatus4k ?? []).length > 0
                  }
                  tmdbId={data.mediaInfo?.tmdbId}
                  mediaType="tv"
                  plexUrl={plexUrl4k}
                  serviceUrl={data.mediaInfo?.serviceUrl4k}
                />
              )}
          </View>
          <ThemedText className="mt-2 text-center text-3xl">
            {data.name}{' '}
            {data.firstAirDate && (
              <ThemedText className="media-year">
                ({data.firstAirDate.slice(0, 4)})
              </ThemedText>
            )}
          </ThemedText>
          <View className="flex flex-row flex-wrap items-center justify-center">
            {seriesAttributes.length > 0 &&
              seriesAttributes.reduce((prev, curr) => (
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
                  buttonSize={'md'}
                  onClick={() => setShowBlacklistModal(true)}
                >
                  <EyeSlashIcon className={'h-3'} />
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
                </Button>
              )}
            </>
          )}
          <PlayButton links={mediaLinks} />
          <RequestButton
            mediaType="tv"
            onUpdate={() => revalidate()}
            tmdbId={data?.id}
            media={data?.mediaInfo}
            isShowComplete={isComplete}
            is4kShowComplete={is4kComplete}
          />
          {/* {(data.mediaInfo?.status === MediaStatus.AVAILABLE ||
            data.mediaInfo?.status === MediaStatus.PARTIALLY_AVAILABLE ||
            (settings.currentSettings.series4kEnabled &&
              hasPermission([Permission.REQUEST_4K, Permission.REQUEST_4K_TV], {
                type: 'or',
              }) &&
              (data.mediaInfo?.status4k === MediaStatus.AVAILABLE ||
                data?.mediaInfo?.status4k ===
                  MediaStatus.PARTIALLY_AVAILABLE))) &&
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
          {/* {hasPermission(Permission.MANAGE_REQUESTS) && data.mediaInfo && (
            <Tooltip content={intl.formatMessage(messages.manageseries)}>
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
                      <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-600" />
                      <div className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-red-600" />
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
                {(data.createdBy.length > 0
                  ? [
                      ...data.createdBy.map(
                        (person): Partial<Crew> => ({
                          id: person.id,
                          job: 'Creator',
                          name: person.name,
                        })
                      ),
                      ...sortedCrew,
                    ]
                  : sortedCrew
                )
                  .slice(0, 6)
                  .map((person) => (
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
              {/* <div className="mt-4 flex justify-end">
                <Link
                  href={`/tv/${data.id}/crew`}
                  className="flex items-center text-gray-400 transition duration-300 hover:text-gray-100"
                >
                  <span>{intl.formatMessage(messages.viewfullcrew)}</span>
                  <ArrowRightCircle className="ml-1.5 inline-block h-5 w-5" />
                </Link>
              </div> */}
            </>
          )}
          {data.keywords.length > 0 && (
            <View className="mt-6 flex flex-row flex-wrap gap-x-2">
              {data.keywords.map((keyword) => (
                <Link
                  href={`(tabs)/discover_tv?keywords=${keyword.id}`}
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
          {/* <ThemedText className="py-4">{intl.formatMessage(messages.seasonstitle)}</ThemedText>
          <View className="flex w-full flex-col space-y-2">
            {data.seasons
              .slice()
              .reverse()
              .filter(
                (season) =>
                  settings.currentSettings.enableSpecialEpisodes ||
                  season.seasonNumber !== 0
              )
              .map((season) => {
                const show4k =
                  settings.currentSettings.series4kEnabled &&
                  hasPermission(
                    [
                      Permission.MANAGE_REQUESTS,
                      Permission.REQUEST_4K,
                      Permission.REQUEST_4K_TV,
                    ],
                    {
                      type: 'or',
                    }
                  );
                const mSeason = (data.mediaInfo?.seasons ?? []).find(
                  (s) =>
                    season.seasonNumber === s.seasonNumber &&
                    s.status !== MediaStatus.UNKNOWN
                );
                const mSeason4k = (data.mediaInfo?.seasons ?? []).find(
                  (s) =>
                    season.seasonNumber === s.seasonNumber &&
                    s.status4k !== MediaStatus.UNKNOWN
                );
                const request = (data.mediaInfo?.requests ?? []).find(
                  (r) =>
                    !!r.seasons.find(
                      (s) => s.seasonNumber === season.seasonNumber
                    ) && !r.is4k
                );
                const request4k = (data.mediaInfo?.requests ?? []).find(
                  (r) =>
                    !!r.seasons.find(
                      (s) => s.seasonNumber === season.seasonNumber
                    ) && r.is4k
                );

                if (season.episodeCount === 0) {
                  return null;
                }

                return (
                  <Disclosure key={`season-discoslure-${season.seasonNumber}`}>
                    {({ open }) => (
                      <>
                        <Disclosure.Button
                          className={`mt-2 flex w-full items-center justify-between space-x-2 border-gray-700 bg-gray-800 px-4 py-2 text-gray-200 ${
                            open
                              ? 'rounded-t-md border-t border-l border-r'
                              : 'rounded-md border'
                          }`}
                        >
                          <div className="flex flex-1 items-center space-x-2 text-lg">
                            <span>
                              {season.seasonNumber === 0
                                ? intl.formatMessage(globalMessages.specials)
                                : intl.formatMessage(messages.seasonnumber, {
                                    seasonNumber: season.seasonNumber,
                                  })}
                            </span>
                            <Badge badgeType="dark">
                              {intl.formatMessage(messages.episodeCount, {
                                episodeCount: season.episodeCount,
                              })}
                            </Badge>
                          </div>
                          {((!mSeason &&
                            request?.status === MediaRequestStatus.APPROVED) ||
                            mSeason?.status === MediaStatus.PROCESSING) && (
                            <>
                              <div className="hidden md:flex">
                                <Badge badgeType="primary">
                                  {intl.formatMessage(globalMessages.requested)}
                                </Badge>
                              </div>
                              <div className="flex md:hidden">
                                <StatusBadgeMini
                                  status={MediaStatus.PROCESSING}
                                />
                              </div>
                            </>
                          )}
                          {((!mSeason &&
                            request?.status === MediaRequestStatus.PENDING) ||
                            mSeason?.status === MediaStatus.PENDING) && (
                            <>
                              <div className="hidden md:flex">
                                <Badge badgeType="warning">
                                  {intl.formatMessage(globalMessages.pending)}
                                </Badge>
                              </div>
                              <div className="flex md:hidden">
                                <StatusBadgeMini status={MediaStatus.PENDING} />
                              </div>
                            </>
                          )}
                          {mSeason?.status ===
                            MediaStatus.PARTIALLY_AVAILABLE && (
                            <>
                              <div className="hidden md:flex">
                                <Badge badgeType="success">
                                  {intl.formatMessage(
                                    globalMessages.partiallyavailable
                                  )}
                                </Badge>
                              </div>
                              <div className="flex md:hidden">
                                <StatusBadgeMini
                                  status={MediaStatus.PARTIALLY_AVAILABLE}
                                />
                              </div>
                            </>
                          )}
                          {mSeason?.status === MediaStatus.AVAILABLE && (
                            <>
                              <div className="hidden md:flex">
                                <Badge badgeType="success">
                                  {intl.formatMessage(globalMessages.available)}
                                </Badge>
                              </div>
                              <div className="flex md:hidden">
                                <StatusBadgeMini
                                  status={MediaStatus.AVAILABLE}
                                />
                              </div>
                            </>
                          )}
                          {((!mSeason4k &&
                            request4k?.status ===
                              MediaRequestStatus.APPROVED) ||
                            mSeason4k?.status4k === MediaStatus.PROCESSING) &&
                            show4k && (
                              <>
                                <div className="hidden md:flex">
                                  <Badge badgeType="primary">
                                    {intl.formatMessage(messages.status4k, {
                                      status: intl.formatMessage(
                                        globalMessages.requested
                                      ),
                                    })}
                                  </Badge>
                                </div>
                                <div className="flex md:hidden">
                                  <StatusBadgeMini
                                    status={MediaStatus.PROCESSING}
                                    is4k={true}
                                  />
                                </div>
                              </>
                            )}
                          {((!mSeason4k &&
                            request4k?.status === MediaRequestStatus.PENDING) ||
                            mSeason?.status4k === MediaStatus.PENDING) &&
                            show4k && (
                              <>
                                <div className="hidden md:flex">
                                  <Badge badgeType="warning">
                                    {intl.formatMessage(messages.status4k, {
                                      status: intl.formatMessage(
                                        globalMessages.pending
                                      ),
                                    })}
                                  </Badge>
                                </div>
                                <div className="flex md:hidden">
                                  <StatusBadgeMini
                                    status={MediaStatus.PENDING}
                                    is4k={true}
                                  />
                                </div>
                              </>
                            )}
                          {mSeason4k?.status4k ===
                            MediaStatus.PARTIALLY_AVAILABLE &&
                            show4k && (
                              <>
                                <div className="hidden md:flex">
                                  <Badge badgeType="success">
                                    {intl.formatMessage(messages.status4k, {
                                      status: intl.formatMessage(
                                        globalMessages.partiallyavailable
                                      ),
                                    })}
                                  </Badge>
                                </div>
                                <div className="flex md:hidden">
                                  <StatusBadgeMini
                                    status={MediaStatus.PARTIALLY_AVAILABLE}
                                    is4k={true}
                                  />
                                </div>
                              </>
                            )}
                          {mSeason4k?.status4k === MediaStatus.AVAILABLE &&
                            show4k && (
                              <>
                                <div className="hidden md:flex">
                                  <Badge badgeType="success">
                                    {intl.formatMessage(messages.status4k, {
                                      status: intl.formatMessage(
                                        globalMessages.available
                                      ),
                                    })}
                                  </Badge>
                                </div>
                                <div className="flex md:hidden">
                                  <StatusBadgeMini
                                    status={MediaStatus.AVAILABLE}
                                    is4k={true}
                                  />
                                </div>
                              </>
                            )}
                          <ChevronDown
                            className={`${
                              open ? 'rotate-180' : ''
                            } h-6 w-6 text-gray-500`}
                          />
                        </Disclosure.Button>
                        <Transition
                          show={open}
                          enter="transition-opacity duration-100 ease-out"
                          enterFrom="opacity-0"
                          enterTo="opacity-100"
                          leave="transition-opacity duration-75 ease-out"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                          // Not sure why this transition is adding a margin without this here
                          style={{ margin: '0px' }}
                        >
                          <Disclosure.Panel className="w-full rounded-b-md border-b border-l border-r border-gray-700 px-4 pb-2">
                            <Season
                              tvId={data.id}
                              seasonNumber={season.seasonNumber}
                            />
                          </Disclosure.Panel>
                        </Transition>
                      </>
                    )}
                  </Disclosure>
                );
              })}
          </View> */}
        </View>
        <View className="mt-8 w-full lg:mt-0 lg:w-80">
          <View className="rounded-lg border border-gray-700 bg-gray-900 text-sm font-bold text-gray-300 shadow">
            {(!!data.voteCount ||
              (ratingData?.criticsRating && !!ratingData?.criticsScore) ||
              (ratingData?.audienceRating && !!ratingData?.audienceScore)) && (
              <View className="flex flex-row items-center justify-center gap-4 space-x-5 border-b border-gray-700 px-4 py-2 font-medium">
                {ratingData?.criticsRating && !!ratingData?.criticsScore && (
                  <Tooltip
                    content={intl.formatMessage(messages.rtcriticsscore)}
                  >
                    <Pressable
                      className="flex flex-row items-center gap-1.5"
                      onPress={() => Linking.openURL(ratingData.url)}
                    >
                      {ratingData.criticsRating === 'Rotten' ? (
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
                      <ThemedText>{ratingData.criticsScore}%</ThemedText>
                    </Pressable>
                  </Tooltip>
                )}
                {ratingData?.audienceRating && !!ratingData?.audienceScore && (
                  <Tooltip
                    content={intl.formatMessage(messages.rtaudiencescore)}
                  >
                    <Pressable
                      className="flex flex-row items-center gap-1.5"
                      onPress={() => Linking.openURL(ratingData.url)}
                    >
                      {ratingData.audienceRating === 'Spilled' ? (
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
                      <ThemedText>{ratingData.audienceScore}%</ThemedText>
                    </Pressable>
                  </Tooltip>
                )}
                {!!data.voteCount && (
                  <Tooltip content={intl.formatMessage(messages.tmdbuserscore)}>
                    <Pressable
                      className="flex flex-row items-center gap-1.5"
                      onPress={() =>
                        Linking.openURL(
                          `https://www.themoviedb.org/tv/${data.id}?language=${locale}`
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
            {data.originalName &&
              data.originalLanguage !== locale.slice(0, 2) && (
                <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
                  <ThemedText className="shrink">
                    {intl.formatMessage(messages.originaltitle)}
                  </ThemedText>
                  <ThemedText className="ml-2 shrink text-right text-sm font-normal text-gray-400">
                    {data.originalName}
                  </ThemedText>
                </View>
              )}
            {data.keywords.some(
              (keyword) => keyword.id === ANIME_KEYWORD_ID
            ) && (
              <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
                <ThemedText className="shrink">
                  {intl.formatMessage(messages.showtype)}
                </ThemedText>
                <ThemedText className="ml-2 shrink text-right text-sm font-normal text-gray-400">
                  {intl.formatMessage(messages.anime)}
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
            {data.firstAirDate && (
              <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
                <ThemedText className="shrink">
                  {intl.formatMessage(messages.firstAirDate)}
                </ThemedText>
                <ThemedText className="ml-2 shrink text-right text-sm font-normal text-gray-400">
                  {intl.formatDate(data.firstAirDate, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'UTC',
                  })}
                </ThemedText>
              </View>
            )}
            {data.nextEpisodeToAir &&
              data.nextEpisodeToAir.airDate &&
              data.nextEpisodeToAir.airDate !== data.firstAirDate && (
                <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
                  <ThemedText className="shrink">
                    {intl.formatMessage(messages.nextAirDate)}
                  </ThemedText>
                  <ThemedText className="ml-2 shrink text-right text-sm font-normal text-gray-400">
                    {intl.formatDate(data.nextEpisodeToAir.airDate, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </ThemedText>
                </View>
              )}
            {data.episodeRunTime.length > 0 && (
              <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
                <ThemedText className="shrink">
                  {intl.formatMessage(messages.episodeRuntime)}
                </ThemedText>
                <ThemedText className="ml-2 shrink text-right text-sm font-normal text-gray-400">
                  {intl.formatMessage(messages.episodeRuntimeMinutes, {
                    runtime: data.episodeRunTime[0],
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
                    href={`(tabs)/discover_tv/language/${data.originalLanguage}`}
                    className="block"
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
            {data.networks.length > 0 && (
              <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
                <ThemedText className="shrink">
                  {intl.formatMessage(messages.network, {
                    networkCount: data.networks.length,
                  })}
                </ThemedText>
                <ThemedText className="ml-2 shrink text-right text-sm font-normal text-gray-400">
                  {data.networks.map((n) => (
                    <Link
                      className="block"
                      href={`(tabs)/discover_tv/network/${n.id}`}
                      key={`network-${n.id}`}
                    >
                      {n.name}
                    </Link>
                  ))}
                </ThemedText>
              </View>
            )}
            {!!streamingProviders.length && (
              <View className="flex flex-row justify-between border-b border-gray-700 px-4 py-2">
                <ThemedText className="shrink">
                  {intl.formatMessage(messages.streamingproviders)}
                </ThemedText>
                <View className="ml-2 flex shrink flex-row flex-wrap justify-end gap-2 text-right text-sm font-normal text-gray-400">
                  {streamingProviders.map((p) => {
                    return (
                      <CachedImage
                        type="tmdb"
                        key={`streaming-provider-${p.id}`}
                        src={'https://image.tmdb.org/t/p/w45/' + p.logoPath}
                        alt={p.name}
                        style={{ width: 32, height: 32, borderRadius: 6 }}
                      />
                    );
                  })}
                </View>
              </View>
            )}
            <View className="flex flex-row justify-between px-4 py-2">
              <ExternalLinkBlock
                mediaType="tv"
                tmdbId={data.id}
                tvdbId={data.externalIds.tvdbId}
                imdbId={data.externalIds.imdbId}
                rtUrl={ratingData?.url}
                mediaUrl={plexUrl ?? plexUrl4k}
              />
            </View>
          </View>
        </View>
      </View>
      {data.credits.cast.length > 0 && (
        <>
          <View className="slider-header px-2">
            <View className="flex min-w-0 flex-row items-center gap-2">
              <ThemedText className="truncate text-2xl font-bold">
                {intl.formatMessage(messages.cast)}
              </ThemedText>
              {/* <ArrowRightCircle /> */}
            </View>
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
        url={`/api/v1/tv/${searchParams.tvId}/recommendations`}
        linkUrl={`(tabs)/tv/${data.id}/recommendations`}
        // hideWhenEmpty
      />
      <MediaSlider
        sliderKey="similar"
        title={intl.formatMessage(messages.similar)}
        url={`/api/v1/tv/${searchParams.tvId}/similar`}
        linkUrl={`(tabs)/tv/${data.id}/similar`}
        // hideWhenEmpty
      />
    </ScrollView>
  );
};

export default TvDetails;
