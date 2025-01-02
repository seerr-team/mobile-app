import Badge from '@/components/Common/Badge';
import CachedImage from '@/components/Common/CachedImage';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
// import RequestModal from '@/components/RequestModal';
import ThemedText from '@/components/Common/ThemedText';
import StatusBadge from '@/components/StatusBadge';
import { refreshIntervalHelper } from '@/hooks/refreshIntervalHelper';
import useDeepLinks from '@/hooks/useDeepLinks';
import useServerUrl from '@/hooks/useServerUrl';
import { Permission, useUser } from '@/hooks/useUser';
import { MediaRequestStatus } from '@/jellyseerr/server/constants/media';
import type { MediaRequest } from '@/jellyseerr/server/entity/MediaRequest';
import type { NonFunctionProperties } from '@/jellyseerr/server/interfaces/api/common';
import type { MovieDetails } from '@/jellyseerr/server/models/Movie';
import type { TvDetails } from '@/jellyseerr/server/models/Tv';
import globalMessages from '@/utils/globalMessages';
import { Link } from 'expo-router';
import { useEffect } from 'react';
import { FormattedRelativeTime, useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';
import useSWR from 'swr';

const messages = getJellyseerrMessages('components.RequestCard');
const messagesRequestList = getJellyseerrMessages(
  'components.RequestList.RequestItem'
);

const isMovie = (movie: MovieDetails | TvDetails): movie is MovieDetails => {
  return (movie as MovieDetails).title !== undefined;
};

const RequestCardPlaceholder = () => {
  return (
    <View className="relative w-72 rounded-xl bg-gray-700 p-4 sm:w-96">
      <View className="w-20 sm:w-28">
        <View className="w-full" style={{ paddingBottom: '160%' }} />
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
      className={`relative flex ${canExpand ? 'w-full' : 'w-72 sm:w-96'} flex-row overflow-hidden rounded-xl bg-gray-700 p-4 text-gray-400 shadow ring-1 ring-red-500`}
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
  // const [showEditModal, setShowEditModal] = useState(false);
  const url =
    request.type === 'movie'
      ? `/api/v1/movie/${request.media.tmdbId}`
      : `/api/v1/tv/${request.media.tmdbId}`;

  const { data: title, error } = useSWR<MovieDetails | TvDetails>(
    serverUrl + url
  );
  const { data: requestData, error: requestError } = useSWR<
    NonFunctionProperties<MediaRequest>
  >(`${serverUrl}/api/v1/request/${request.id}`, {
    fallbackData: request,
    refreshInterval: refreshIntervalHelper(
      {
        downloadStatus: request.media.downloadStatus,
        downloadStatus4k: request.media.downloadStatus4k,
      },
      15000
    ),
  });

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
    return <RequestCardPlaceholder />;
  }

  if (!requestData && !requestError) {
    return <RequestCardError />;
  }

  if (!title || !requestData) {
    return <RequestCardError requestData={requestData} />;
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
          href={`/${requestData.type}/${requestData.media.tmdbId}?manage=1`}
        >
          {intl.formatMessage(globalMessages.failed)}
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
      {/* <RequestModal
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
      /> */}
      <View
        className={`relative overflow-hidden rounded-xl border border-gray-700 bg-gray-700 bg-cover bg-center pl-4 pr-1 pt-4 text-gray-400 shadow`}
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
            <View
              className="absolute inset-0"
              style={{
                // backgroundImage:
                //   'linear-gradient(135deg, rgba(17, 24, 39, 0.47) 0%, rgba(17, 24, 39, 1) 75%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            />
          </View>
        )}
        <View
          className={`flex ${canExpand ? 'w-full flex-row-reverse items-center gap-2' : 'w-72 flex-row sm:w-96'}`}
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
            <ThemedText
              // href={
              //   request.type === 'movie'
              //     ? `/movie/${requestData.media.tmdbId}`
              //     : `/tv/${requestData.media.tmdbId}`
              // }
              className={`overflow-hidden overflow-ellipsis whitespace-nowrap ${canExpand ? 'mb-1 text-2xl' : 'text-lg'} font-bold text-white hover:underline`}
              numberOfLines={1}
            >
              {isMovie(title) ? title.title : title.name}
            </ThemedText>
            {hasPermission(
              [Permission.MANAGE_REQUESTS, Permission.REQUEST_VIEW],
              { type: 'or' }
            ) && (
              <View className="card-field">
                <Link
                  href={`/users/${requestData.requestedBy.id}`}
                  className="group flex items-center"
                >
                  <Pressable>
                    <CachedImage
                      type="avatar"
                      src={requestData.requestedBy.avatar}
                      alt=""
                      className="avatar-sm object-cover"
                      style={{ width: 20, height: 20 }}
                    />
                    <ThemedText className="truncate font-semibold group-hover:text-white group-hover:underline">
                      {requestData.requestedBy.displayName}
                    </ThemedText>
                  </Pressable>
                </Link>
              </View>
            )}
            {!isMovie(title) && request.seasons.length > 0 && (
              <View className="my-0.5 flex flex-row items-center text-sm sm:my-1">
                <ThemedText className="mr-2 text-sm font-bold text-gray-400">
                  {intl.formatMessage(messages.seasons, {
                    seasonCount:
                      title.seasons.length === request.seasons.length
                        ? 0
                        : request.seasons.length,
                  })}
                </ThemedText>
                <View className="hide-scrollbar overflow-x-scroll">
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
          <Link
            href={
              request.type === 'movie'
                ? `/movie/${requestData.media.tmdbId}`
                : `/tv/${requestData.media.tmdbId}`
            }
            className="flex-shrink-0 scale-100"
          >
            <Pressable className="overflow-hidden rounded-md shadow-sm">
              <CachedImage
                type="tmdb"
                src={
                  title.posterPath
                    ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${title.posterPath}`
                    : '/images/overseerr_poster_not_found.png'
                }
                alt=""
                style={
                  canExpand
                    ? { width: 60, height: 90 }
                    : { width: 84, height: 128 }
                }
              />
            </Pressable>
          </Link>
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
                  value={Math.floor(
                    (new Date(requestData.createdAt).getTime() - Date.now()) /
                      1000
                  )}
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
                      value={Math.floor(
                        (new Date(requestData.createdAt).getTime() -
                          Date.now()) /
                          1000
                      )}
                      updateIntervalInSeconds={1}
                      numeric="auto"
                    />
                  ),
                  user: (
                    <View
                      // href={`/users/${requestData.requestedBy.id}`}
                      className="group flex translate-y-2 flex-row items-center gap-1.5 truncate pl-1"
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
      </View>
    </>
  );
};

export { RequestCardPlaceholder as Placeholder };

export default RequestCard;
