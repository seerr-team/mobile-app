import Badge from '@/components/Common/Badge';
import Tooltip from '@/components/Common/Tooltip';
// import DownloadBlock from '@/components/DownloadBlock';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ThemedText from '@/components/Common/ThemedText';
import useSettings from '@/hooks/useSettings';
import { Permission, useUser } from '@/hooks/useUser';
import { MediaStatus } from '@/seerr/server/constants/media';
import { MediaServerType } from '@/seerr/server/constants/server';
import type { DownloadingItem } from '@/seerr/server/lib/downloadtracker';
import getSeerrMessages from '@/utils/getSeerrMessages';
import globalMessages from '@/utils/globalMessages';
import { useIntl } from 'react-intl';
import { View } from 'react-native';

const messages = getSeerrMessages('components.StatusBadge');

interface StatusBadgeProps {
  status?: MediaStatus;
  downloadItem?: DownloadingItem[];
  is4k?: boolean;
  inProgress?: boolean;
  plexUrl?: string;
  serviceUrl?: string;
  tmdbId?: number;
  mediaType?: 'movie' | 'tv';
  title?: string | string[];
  fontSize?: string;
}

const StatusBadge = ({
  status,
  downloadItem = [],
  is4k = false,
  inProgress = false,
  plexUrl,
  serviceUrl,
  tmdbId,
  mediaType,
  title,
  fontSize = 'text-xs',
}: StatusBadgeProps) => {
  const intl = useIntl();
  const { hasPermission } = useUser();
  const settings = useSettings();

  let mediaLink: string | undefined;
  let mediaLinkDescription: string | undefined;

  const calculateDownloadProgress = (media: DownloadingItem) => {
    return Math.round(((media?.size - media?.sizeLeft) / media?.size) * 100);
  };

  if (
    mediaType &&
    plexUrl &&
    hasPermission(
      is4k
        ? [
            Permission.REQUEST_4K,
            mediaType === 'movie'
              ? Permission.REQUEST_4K_MOVIE
              : Permission.REQUEST_4K_TV,
          ]
        : [
            Permission.REQUEST,
            mediaType === 'movie'
              ? Permission.REQUEST_MOVIE
              : Permission.REQUEST_TV,
          ],
      {
        type: 'or',
      }
    ) &&
    (!is4k ||
      (mediaType === 'movie'
        ? settings.currentSettings.movie4kEnabled
        : settings.currentSettings.series4kEnabled))
  ) {
    mediaLink = plexUrl;
    mediaLinkDescription = intl.formatMessage(messages.playonplex, {
      mediaServerName:
        settings.currentSettings.mediaServerType === MediaServerType.EMBY
          ? 'Emby'
          : settings.currentSettings.mediaServerType === MediaServerType.PLEX
            ? 'Plex'
            : 'Jellyfin',
    });
  } else if (hasPermission(Permission.MANAGE_REQUESTS)) {
    if (mediaType && tmdbId) {
      mediaLink = `/${mediaType}/${tmdbId}?manage=1`;
      mediaLinkDescription = intl.formatMessage(messages.managemedia, {
        mediaType: intl.formatMessage(
          mediaType === 'movie' ? globalMessages.movie : globalMessages.tvshow
        ),
      });
    } else if (hasPermission(Permission.ADMIN) && serviceUrl) {
      mediaLink = serviceUrl;
      mediaLinkDescription = intl.formatMessage(messages.openinarr, {
        arr: mediaType === 'movie' ? 'Radarr' : 'Sonarr',
      });
    }
  }

  const tooltipContent = <ThemedText>TODO</ThemedText>;
  // const tooltipContent =
  //   mediaType === 'tv' &&
  //   downloadItem.length > 1 &&
  //   downloadItem.every(
  //     (item) =>
  //       item.downloadId && item.downloadId === downloadItem[0].downloadId
  //   ) ? (
  //     <DownloadBlock
  //       downloadItem={downloadItem[0]}
  //       title={Array.isArray(title) ? title[0] : title}
  //       is4k={is4k}
  //     />
  //   ) : (
  //     <ul>
  //       {downloadItem.map((status, index) => (
  //         <li
  //           key={`dl-status-${status.externalId}-${index}`}
  //           className="border-b border-gray-700 last:border-b-0"
  //         >
  //           <DownloadBlock
  //             downloadItem={status}
  //             title={Array.isArray(title) ? title[index] : title}
  //             is4k={is4k}
  //           />
  //         </li>
  //       ))}
  //     </ul>
  //   );

  const badgeDownloadProgress = (
    <View
      className={`
      absolute left-0 top-0 z-10 flex h-full flex-row bg-opacity-80 ${
        status === MediaStatus.DELETED
          ? 'bg-red-600'
          : status === MediaStatus.PROCESSING
            ? 'bg-indigo-500'
            : 'bg-green-500'
      } transition-all duration-200 ease-in-out
    `}
      style={{
        width: `${
          downloadItem ? calculateDownloadProgress(downloadItem[0]) : 0
        }%`,
      }}
    />
  );

  switch (status) {
    case MediaStatus.AVAILABLE:
      return (
        <Tooltip
          content={inProgress ? tooltipContent : mediaLinkDescription}
          className={`${
            inProgress && 'hidden max-h-96 w-96 overflow-y-auto sm:block'
          }`}
          tooltipConfig={{
            ...(inProgress && { interactive: true, delayHide: 100 }),
          }}
        >
          <Badge
            badgeType="success"
            href={mediaLink}
            className={`${
              inProgress &&
              'relative !bg-gray-700 !bg-opacity-80 !px-0 hover:!bg-gray-700'
            } overflow-hidden pb-0.5`}
            element={View}
          >
            {inProgress && badgeDownloadProgress}
            <View
              className={`relative z-20 flex flex-row items-center ${
                inProgress && 'px-2'
              }`}
            >
              <ThemedText className={fontSize}>
                {intl.formatMessage(
                  is4k ? messages.status4k : messages.status,
                  {
                    status: inProgress
                      ? intl.formatMessage(globalMessages.processing)
                      : intl.formatMessage(globalMessages.available),
                  }
                )}
              </ThemedText>
              {inProgress && (
                <>
                  {mediaType === 'tv' &&
                    downloadItem[0].episode &&
                    (downloadItem.length > 1 &&
                    downloadItem.every(
                      (item) =>
                        item.downloadId &&
                        item.downloadId === downloadItem[0].downloadId
                    ) ? (
                      <ThemedText className="text-xs">
                        {intl.formatMessage(messages.seasonnumber, {
                          seasonNumber: downloadItem[0].episode.seasonNumber,
                        })}
                      </ThemedText>
                    ) : (
                      <ThemedText className="text-xs">
                        {intl.formatMessage(messages.seasonepisodenumber, {
                          seasonNumber: downloadItem[0].episode.seasonNumber,
                          episodeNumber: downloadItem[0].episode.episodeNumber,
                        })}
                      </ThemedText>
                    ))}
                  <View className="ml-1">
                    <LoadingSpinner size={12} />
                  </View>
                </>
              )}
            </View>
          </Badge>
        </Tooltip>
      );

    case MediaStatus.PARTIALLY_AVAILABLE:
      return (
        <Tooltip
          content={inProgress ? tooltipContent : mediaLinkDescription}
          className={`${
            inProgress && 'hidden max-h-96 w-96 overflow-y-auto sm:block'
          }`}
          tooltipConfig={{
            ...(inProgress && { interactive: true, delayHide: 100 }),
          }}
        >
          <Badge
            badgeType="success"
            href={mediaLink}
            className={`${
              inProgress &&
              'relative !bg-gray-700 !bg-opacity-80 !px-0 hover:!bg-gray-700'
            } overflow-hidden pb-0.5`}
            element={View}
          >
            {inProgress && badgeDownloadProgress}
            <View
              className={`relative z-20 flex flex-row items-center ${
                inProgress && 'px-2'
              }`}
            >
              <ThemedText className="text-xs">
                {intl.formatMessage(
                  is4k ? messages.status4k : messages.status,
                  {
                    status: inProgress
                      ? intl.formatMessage(globalMessages.processing)
                      : intl.formatMessage(globalMessages.partiallyavailable),
                  }
                )}
              </ThemedText>
              {inProgress && (
                <>
                  {mediaType === 'tv' &&
                    downloadItem[0].episode &&
                    (downloadItem.length > 1 &&
                    downloadItem.every(
                      (item) =>
                        item.downloadId &&
                        item.downloadId === downloadItem[0].downloadId
                    ) ? (
                      <ThemedText className="text-xs">
                        {intl.formatMessage(messages.seasonnumber, {
                          seasonNumber: downloadItem[0].episode.seasonNumber,
                        })}
                      </ThemedText>
                    ) : (
                      <ThemedText className="text-xs">
                        {intl.formatMessage(messages.seasonepisodenumber, {
                          seasonNumber: downloadItem[0].episode.seasonNumber,
                          episodeNumber: downloadItem[0].episode.episodeNumber,
                        })}
                      </ThemedText>
                    ))}
                  <View className="ml-1">
                    <LoadingSpinner size={12} />
                  </View>
                </>
              )}
            </View>
          </Badge>
        </Tooltip>
      );

    case MediaStatus.PROCESSING:
      return (
        <Tooltip
          content={inProgress ? tooltipContent : mediaLinkDescription}
          className={`${
            inProgress && 'hidden max-h-96 w-96 overflow-y-auto sm:block'
          }`}
          tooltipConfig={{
            ...(inProgress && { interactive: true, delayHide: 100 }),
          }}
        >
          <Badge
            badgeType="primary"
            href={mediaLink}
            className={`${
              inProgress &&
              'relative !bg-gray-700 !bg-opacity-80 !px-0 hover:!bg-gray-700'
            } overflow-hidden pb-0.5`}
            element={View}
          >
            {inProgress && badgeDownloadProgress}
            <View
              className={`relative z-20 flex flex-row items-center ${
                inProgress && 'px-2'
              }`}
            >
              <ThemedText className="text-xs">
                {intl.formatMessage(
                  is4k ? messages.status4k : messages.status,
                  {
                    status: inProgress
                      ? intl.formatMessage(globalMessages.processing)
                      : intl.formatMessage(globalMessages.requested),
                  }
                )}
              </ThemedText>
              {inProgress && (
                <>
                  {mediaType === 'tv' &&
                    downloadItem[0].episode &&
                    (downloadItem.length > 1 &&
                    downloadItem.every(
                      (item) =>
                        item.downloadId &&
                        item.downloadId === downloadItem[0].downloadId
                    ) ? (
                      <ThemedText className="text-xs">
                        {intl.formatMessage(messages.seasonnumber, {
                          seasonNumber: downloadItem[0].episode.seasonNumber,
                        })}
                      </ThemedText>
                    ) : (
                      <ThemedText className="text-xs">
                        {intl.formatMessage(messages.seasonepisodenumber, {
                          seasonNumber: downloadItem[0].episode.seasonNumber,
                          episodeNumber: downloadItem[0].episode.episodeNumber,
                        })}
                      </ThemedText>
                    ))}
                  <View className="ml-1">
                    <LoadingSpinner size={12} />
                  </View>
                </>
              )}
            </View>
          </Badge>
        </Tooltip>
      );

    case MediaStatus.PENDING:
      return (
        <Tooltip content={mediaLinkDescription}>
          <Badge badgeType="warning" href={mediaLink}>
            {intl.formatMessage(is4k ? messages.status4k : messages.status, {
              status: intl.formatMessage(globalMessages.pending),
            })}
          </Badge>
        </Tooltip>
      );

    case MediaStatus.BLACKLISTED:
      return (
        <Tooltip content={mediaLinkDescription}>
          <Badge badgeType="danger" href={mediaLink}>
            {intl.formatMessage(is4k ? messages.status4k : messages.status, {
              status: intl.formatMessage(globalMessages.blacklisted),
            })}
          </Badge>
        </Tooltip>
      );

    case MediaStatus.DELETED:
      return (
        <Tooltip
          content={inProgress ? tooltipContent : mediaLinkDescription}
          className={`${
            inProgress && 'hidden max-h-96 w-96 overflow-y-auto sm:block'
          }`}
          tooltipConfig={{
            ...(inProgress && { interactive: true, delayHide: 100 }),
          }}
        >
          <Badge
            badgeType="danger"
            href={mediaLink}
            className={`${
              inProgress &&
              'relative !bg-gray-700 !bg-opacity-80 !px-0 hover:!bg-gray-700'
            } overflow-hidden`}
            element={View}
          >
            {inProgress && badgeDownloadProgress}
            <View
              className={`relative z-20 flex flex-row items-center ${
                inProgress && 'px-2'
              }`}
            >
              <ThemedText className="text-xs">
                {intl.formatMessage(
                  is4k ? messages.status4k : messages.status,
                  {
                    status: inProgress
                      ? intl.formatMessage(globalMessages.processing)
                      : intl.formatMessage(globalMessages.deleted),
                  }
                )}
              </ThemedText>
              {inProgress && (
                <>
                  {mediaType === 'tv' &&
                    downloadItem[0].episode &&
                    (downloadItem.length > 1 &&
                    downloadItem.every(
                      (item) =>
                        item.downloadId &&
                        item.downloadId === downloadItem[0].downloadId
                    ) ? (
                      <ThemedText className="text-xs">
                        {intl.formatMessage(messages.seasonnumber, {
                          seasonNumber: downloadItem[0].episode.seasonNumber,
                        })}
                      </ThemedText>
                    ) : (
                      <ThemedText className="text-xs">
                        {intl.formatMessage(messages.seasonepisodenumber, {
                          seasonNumber: downloadItem[0].episode.seasonNumber,
                          episodeNumber: downloadItem[0].episode.episodeNumber,
                        })}
                      </ThemedText>
                    ))}
                  <View className="ml-1">
                    <LoadingSpinner size={12} />
                  </View>
                </>
              )}
            </View>
          </Badge>
        </Tooltip>
      );

    default:
      return null;
  }
};

export default StatusBadge;
