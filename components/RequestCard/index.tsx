import Badge from '@/components/Common/Badge';
import CachedImage from '@/components/Common/CachedImage';
import FormattedRelativeTime from '@/components/Common/FormattedRelativeTime';
import ThemedText from '@/components/Common/ThemedText';
import RequestModal from '@/components/RequestModal';
import StatusBadge from '@/components/StatusBadge';
import useDeepLinks from '@/hooks/useDeepLinks';
import useServerUrl from '@/hooks/useServerUrl';
import { Permission, useUser } from '@/hooks/useUser';
import {
  MediaRequestStatus,
  MediaStatus,
} from '@/seerr/server/constants/media';
import type { MediaRequest } from '@/seerr/server/entity/MediaRequest';
import type { NonFunctionProperties } from '@/seerr/server/interfaces/api/common';
import type { MovieDetails } from '@/seerr/server/models/Movie';
import type { TvDetails } from '@/seerr/server/models/Tv';
import getSeerrMessages from '@/utils/getSeerrMessages';
import globalMessages from '@/utils/globalMessages';
import { refreshIntervalHelper } from '@/utils/refreshIntervalHelper';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Platform, Pressable, View } from 'react-native';
import useSWR from 'swr';

const messages = getSeerrMessages('components.RequestCard');
const messagesRequestList = getSeerrMessages(
  'components.RequestList.RequestItem'
);

const isMovie = (movie: MovieDetails | TvDetails): movie is MovieDetails => {
  return (movie as MovieDetails).title !== undefined;
};

const RequestCardPlaceholder = ({ canExpend }: { canExpend?: boolean }) => {
  return (
    <View
      className={`relative ${canExpend ? 'w-full' : 'w-80 sm:w-96'} rounded-xl bg-gray-700 p-4`}
    >
      <View className="w-20 sm:w-28">
        <View
          className="w-full"
          style={{ paddingBottom: canExpend ? '260%' : '160%' }}
        />
      </View>
    </View>
  );
};

interface RequestCardErrorProps {
  requestData?: NonFunctionProperties<MediaRequest> | null;
  canExpand?: boolean;
}

const RequestCardError = ({
  requestData,
  canExpand,
}: RequestCardErrorProps) => {
  const { hasPermission } = useUser();
  const intl = useIntl();

  const { mediaUrl: plexUrl, mediaUrl4k: plexUrl4k } = useDeepLinks({
    mediaUrl: requestData?.media?.mediaUrl,
    mediaUrl4k: requestData?.media?.mediaUrl4k,
    iOSPlexUrl: requestData?.media?.iOSPlexUrl,
    iOSPlexUrl4k: requestData?.media?.iOSPlexUrl4k,
  });

  return (
    <View
      className={`relative flex ${canExpand ? 'w-full' : 'w-80 sm:w-96'} flex-row overflow-hidden rounded-xl bg-gray-700 p-4 text-gray-400 shadow ring-1 ring-red-500`}
      data-testid="request-card"
    >
      <View className="w-20 sm:w-28">
        <View className="w-full" style={{ paddingBottom: '160%' }}>
          <View className="absolute inset-0 z-10 flex min-w-0 flex-1 flex-col p-4">
            <View
              className="whitespace-normal text-base font-bold text-white sm:text-lg"
              data-testid="request-card-title"
            >
              <ThemedText>
                {intl.formatMessage(messages.mediaerror, {
                  mediaType: intl.formatMessage(
                    requestData?.type
                      ? requestData?.type === 'movie'
                        ? globalMessages.movie
                        : globalMessages.tvshow
                      : globalMessages.request
                  ),
                })}
              </ThemedText>
            </View>
            {requestData && (
              <>
                {hasPermission(
                  [Permission.MANAGE_REQUESTS, Permission.REQUEST_VIEW],
                  { type: 'or' }
                ) && (
                  <View className="card-field !hidden sm:!block">
                    <Link href={`/users/${requestData.requestedBy.id}`} asChild>
                      <Pressable className="group flex flex-row items-center">
                        <CachedImage
                          type="avatar"
                          src={requestData.requestedBy.avatar}
                          alt=""
                          className="avatar-sm object-cover"
                          style={{ width: 20, height: 20 }}
                        />
                        <ThemedText className="truncate group-hover:underline">
                          {requestData.requestedBy.displayName}
                        </ThemedText>
                      </Pressable>
                    </Link>
                  </View>
                )}
                <View className="mt-2 flex flex-row items-center text-sm sm:mt-1">
                  {requestData.status === MediaRequestStatus.DECLINED ||
                  requestData.status === MediaRequestStatus.FAILED ? (
                    <Badge badgeType="danger">
                      {requestData.status === MediaRequestStatus.DECLINED
                        ? intl.formatMessage(globalMessages.declined)
                        : intl.formatMessage(globalMessages.failed)}
                    </Badge>
                  ) : (
                    <StatusBadge
                      status={
                        requestData.media[
                          requestData.is4k ? 'status4k' : 'status'
                        ]
                      }
                      downloadItem={
                        requestData.media[
                          requestData.is4k
                            ? 'downloadStatus4k'
                            : 'downloadStatus'
                        ]
                      }
                      title={intl.formatMessage(messages.unknowntitle)}
                      inProgress={
                        (
                          requestData.media[
                            requestData.is4k
                              ? 'downloadStatus4k'
                              : 'downloadStatus'
                          ] ?? []
                        ).length > 0
                      }
                      is4k={requestData.is4k}
                      mediaType={requestData.type}
                      plexUrl={requestData.is4k ? plexUrl4k : plexUrl}
                      serviceUrl={
                        requestData.is4k
                          ? requestData.media.serviceUrl4k
                          : requestData.media.serviceUrl
                      }
                    />
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

interface RequestCardProps {
  request: NonFunctionProperties<MediaRequest>;
  onTitleData?: (requestId: number, title: MovieDetails | TvDetails) => void;
  canExpand?: boolean;
}

const RequestCard = ({ request, onTitleData, canExpand }: RequestCardProps) => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const { hasPermission } = useUser();
  const [showEditModal, setShowEditModal] = useState(false);
  const url =
    request.type === 'movie'
      ? `/api/v1/movie/${request.media.tmdbId}`
      : `/api/v1/tv/${request.media.tmdbId}`;

  const { data: title, error } = useSWR<MovieDetails | TvDetails>(
    serverUrl + url
  );
  const {
    data: requestData,
    error: requestError,
    mutate: revalidate,
  } = useSWR<NonFunctionProperties<MediaRequest>>(
    `${serverUrl}/api/v1/request/${request.id}`,
    {
      fallbackData: request,
      refreshInterval: refreshIntervalHelper(
        {
          downloadStatus: request.media.downloadStatus,
          downloadStatus4k: request.media.downloadStatus4k,
        },
        15000
      ),
    }
  );

  const { mediaUrl: plexUrl, mediaUrl4k: plexUrl4k } = useDeepLinks({
    mediaUrl: requestData?.media?.mediaUrl,
    mediaUrl4k: requestData?.media?.mediaUrl4k,
    iOSPlexUrl: requestData?.media?.iOSPlexUrl,
    iOSPlexUrl4k: requestData?.media?.iOSPlexUrl4k,
  });

  useEffect(() => {
    if (title && onTitleData) {
      onTitleData(request.id, title);
    }
  }, [title, onTitleData, request]);

  if (!title && !error) {
    return <RequestCardPlaceholder canExpend={canExpand} />;
  }

  if (!requestData && !requestError) {
    return <RequestCardError canExpand={canExpand} />;
  }

  if (!title || !requestData) {
    return <RequestCardError canExpand={canExpand} requestData={requestData} />;
  }

  const AvailabilityBadge = () => (
    <View className="mt-2 flex flex-row items-center text-sm sm:mt-1">
      {requestData.status === MediaRequestStatus.DECLINED ? (
        <Badge badgeType="danger">
          {intl.formatMessage(globalMessages.declined)}
        </Badge>
      ) : requestData.status === MediaRequestStatus.FAILED ? (
        <Badge
          badgeType="danger"
          href={
            !Platform.isTV
              ? `/${requestData.type}/${requestData.media.tmdbId}?manage=1`
              : undefined
          }
        >
          {intl.formatMessage(globalMessages.failed)}
        </Badge>
      ) : requestData.status === MediaRequestStatus.PENDING &&
        requestData.media[requestData.is4k ? 'status4k' : 'status'] ===
          MediaStatus.DELETED ? (
        <Badge
          badgeType="warning"
          href={
            !Platform.isTV
              ? `/${requestData.type}/${requestData.media.tmdbId}?manage=1`
              : undefined
          }
        >
          {intl.formatMessage(globalMessages.pending)}
        </Badge>
      ) : (
        <StatusBadge
          status={requestData.media[requestData.is4k ? 'status4k' : 'status']}
          downloadItem={
            requestData.media[
              requestData.is4k ? 'downloadStatus4k' : 'downloadStatus'
            ]
          }
          title={isMovie(title) ? title.title : title.name}
          inProgress={
            (
              requestData.media[
                requestData.is4k ? 'downloadStatus4k' : 'downloadStatus'
              ] ?? []
            ).length > 0
          }
          is4k={requestData.is4k}
          tmdbId={requestData.media.tmdbId}
          mediaType={requestData.type}
          plexUrl={requestData.is4k ? plexUrl4k : plexUrl}
          serviceUrl={
            requestData.is4k
              ? requestData.media.serviceUrl4k
              : requestData.media.serviceUrl
          }
        />
      )}
    </View>
  );

  return (
    <>
      <RequestModal
        show={showEditModal}
        tmdbId={request.media.tmdbId}
        type={request.type}
        is4k={request.is4k}
        editRequest={request}
        onCancel={() => setShowEditModal(false)}
        onComplete={() => {
          revalidate();
          setShowEditModal(false);
        }}
      />
      <Link
        href={
          request.type === 'movie'
            ? `/movie/${requestData.media.tmdbId}`
            : `/tv/${requestData.media.tmdbId}`
        }
        asChild
      >
        <Pressable
          className={`relative overflow-hidden rounded-xl border border-gray-700 bg-gray-700 bg-cover bg-center py-1 pl-4 pr-1 text-gray-400 shadow focus:border-indigo-500 ${canExpand ? 'w-full sm:flex sm:flex-row' : 'w-80 sm:w-96'}`}
          data-testid="request-card"
        >
          {title.backdropPath && (
            <View className="absolute inset-0 z-0">
              <CachedImage
                type="tmdb"
                alt=""
                src={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${title.backdropPath}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <LinearGradient
                colors={['rgba(31, 41, 55, 0.47)', 'rgba(31, 41, 55, 1)']}
                start={[0, 0]}
                end={[1, 0]}
                locations={[0, 1]}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: '100%',
                }}
              />
            </View>
          )}
          <View
            className={`flex ${canExpand ? 'w-full flex-row-reverse items-center gap-2 sm:w-7/12 2xl:w-2/3' : 'w-72 flex-row sm:w-96'}`}
          >
            <View
              className="relative z-10 flex min-w-0 flex-1 flex-col pr-3"
              data-testid="request-card-title"
            >
              <View
                className={`${canExpand ? 'flex' : 'hidden sm:flex'} font-medium text-white`}
              >
                <ThemedText>
                  {(isMovie(title)
                    ? title.releaseDate
                    : title.firstAirDate
                  )?.slice(0, 4)}
                </ThemedText>
              </View>
              <Link
                href={
                  request.type === 'movie'
                    ? `/movie/${requestData.media.tmdbId}`
                    : `/tv/${requestData.media.tmdbId}`
                }
                className={`overflow-hidden overflow-ellipsis whitespace-nowrap ${canExpand ? 'mb-1 text-2xl' : 'text-lg'} font-bold text-white hover:underline`}
                numberOfLines={1}
              >
                {isMovie(title) ? title.title : title.name}
              </Link>
              {hasPermission(
                [Permission.MANAGE_REQUESTS, Permission.REQUEST_VIEW],
                { type: 'or' }
              ) && (
                <View className="flex flex-row items-center truncate py-0.5 text-sm sm:py-1">
                  {/* <Link href={`/users/${requestData.requestedBy.id}`}> */}
                  <View className="group flex flex-row items-center gap-2">
                    <CachedImage
                      type="avatar"
                      src={requestData.requestedBy.avatar}
                      alt=""
                      className="avatar-sm object-cover"
                      style={{ width: 20, height: 20, borderRadius: 10 }}
                    />
                    <ThemedText className="truncate font-semibold text-gray-300">
                      {requestData.requestedBy.displayName}
                    </ThemedText>
                  </View>
                  {/* </Link> */}
                </View>
              )}
              {!isMovie(title) && request.seasons.length > 0 && (
                <View className="my-0.5 flex flex-row items-center text-sm sm:my-1">
                  <ThemedText className="mr-2 text-sm font-bold text-gray-400">
                    {intl.formatMessage(messages.seasons, {
                      seasonCount: request.seasons.length,
                    })}
                  </ThemedText>
                  <View className="hide-scrollbar flex flex-row overflow-x-scroll">
                    {request.seasons.map((season) => (
                      <View key={`season-${season.id}`} className="mr-2">
                        <Badge>
                          {season.seasonNumber === 0
                            ? intl.formatMessage(globalMessages.specials)
                            : season.seasonNumber}
                        </Badge>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {!canExpand && <AvailabilityBadge />}
            </View>
            <View className="flex-shrink-0 scale-100">
              <View className="overflow-hidden rounded-md shadow-sm">
                {/* <Link
              href={
                request.type === 'movie'
                  ? `/movie/${requestData.media.tmdbId}`
                  : `/tv/${requestData.media.tmdbId}`
              }
              className="flex-shrink-0 scale-100"
            >
              <Pressable className="overflow-hidden rounded-md shadow-sm"> */}
                <CachedImage
                  type="tmdb"
                  src={
                    title.posterPath
                      ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${title.posterPath}`
                      : '/images/seerr_poster_not_found.png'
                  }
                  alt=""
                  style={
                    canExpand
                      ? { width: 60, height: 90 }
                      : { width: 80, height: 120 }
                  }
                />
                {/* </Pressable>
            </Link> */}
              </View>
            </View>
          </View>
          {canExpand && (
            <View className="pb-4 pt-2">
              <View className="my-0.5 flex flex-row items-center sm:my-1">
                <ThemedText className="mr-4 mt-2 font-bold text-gray-400 sm:mt-1">
                  {intl.formatMessage(globalMessages.status)}
                </ThemedText>
                <AvailabilityBadge />
              </View>
              <View className="my-0.5 flex flex-row items-center sm:my-1">
                <ThemedText className="mr-4 mt-2 font-bold text-gray-400 sm:mt-1">
                  {intl.formatMessage(messagesRequestList.requested)}
                </ThemedText>
                <ThemedText className="mt-2 text-gray-300 sm:mt-1">
                  <FormattedRelativeTime
                    value={new Date(requestData.createdAt)}
                    updateIntervalInSeconds={1}
                    numeric="auto"
                  />
                </ThemedText>
              </View>
              <View className="my-0.5 flex flex-row items-center sm:my-1">
                <ThemedText className="mr-4 mt-2 font-bold text-gray-400 sm:mt-1">
                  {intl.formatMessage(messagesRequestList.modified)}
                </ThemedText>
                <ThemedText className="text-gray-300">
                  {intl.formatMessage(messagesRequestList.modifieduserdate, {
                    date: (
                      <FormattedRelativeTime
                        key={`modified-${requestData.id}`}
                        value={new Date(requestData.createdAt)}
                        updateIntervalInSeconds={1}
                        numeric="auto"
                      />
                    ),
                    user: (
                      <View
                        // href={`/users/${requestData.requestedBy.id}`}
                        className="group flex translate-y-1.5 flex-row items-center gap-1.5 truncate pl-1"
                      >
                        <View className="avatar-sm overflow-hidden rounded-full">
                          <CachedImage
                            type="avatar"
                            src={requestData.requestedBy.avatar}
                            alt=""
                            style={{ width: 20, height: 20 }}
                          />
                        </View>
                        <ThemedText className="truncate font-bold text-gray-300 group-hover:underline">
                          {requestData.requestedBy.displayName}
                        </ThemedText>
                      </View>
                    ),
                  })}
                </ThemedText>
              </View>
            </View>
          )}
        </Pressable>
      </Link>
    </>
  );
};

export { RequestCardPlaceholder as Placeholder };

export default RequestCard;
