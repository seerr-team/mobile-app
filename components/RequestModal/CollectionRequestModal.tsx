import Alert from '@/components/Common/Alert';
import Badge from '@/components/Common/Badge';
import CachedImage from '@/components/Common/CachedImage';
import Modal from '@/components/Common/Modal';
import ThemedText from '@/components/Common/ThemedText';
import type { RequestOverrides } from '@/components/RequestModal/AdvancedRequester';
import AdvancedRequester from '@/components/RequestModal/AdvancedRequester';
import QuotaDisplay from '@/components/RequestModal/QuotaDisplay';
import useServerUrl from '@/hooks/useServerUrl';
import { useUser } from '@/hooks/useUser';
import {
  MediaRequestStatus,
  MediaStatus,
} from '@/jellyseerr/server/constants/media';
import type { MediaRequest } from '@/jellyseerr/server/entity/MediaRequest';
import type { QuotaResponse } from '@/jellyseerr/server/interfaces/api/userInterfaces';
import { Permission } from '@/jellyseerr/server/lib/permissions';
import type { Collection } from '@/jellyseerr/server/models/Collection';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import globalMessages from '@/utils/globalMessages';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast/headless';
import { useIntl } from 'react-intl';
import { Switch, View } from 'react-native';
import useSWR from 'swr';

const messages = getJellyseerrMessages('components.RequestModal');

interface RequestModalProps {
  show: boolean;
  tmdbId: number;
  is4k?: boolean;
  onCancel?: () => void;
  onComplete?: (newStatus: MediaStatus) => void;
  onUpdating?: (isUpdating: boolean) => void;
}

const CollectionRequestModal = ({
  show,
  onCancel,
  onComplete,
  tmdbId,
  onUpdating,
  is4k = false,
}: RequestModalProps) => {
  const serverUrl = useServerUrl();
  const [isUpdating, setIsUpdating] = useState(false);
  const [requestOverrides, setRequestOverrides] =
    useState<RequestOverrides | null>(null);
  const [selectedParts, setSelectedParts] = useState<number[]>([]);
  const { data, error } = useSWR<Collection>(
    `${serverUrl}/api/v1/collection/${tmdbId}`,
    {
      revalidateOnMount: true,
    }
  );
  const intl = useIntl();
  const { user, hasPermission } = useUser();
  const { data: quota } = useSWR<QuotaResponse>(
    user &&
      (!requestOverrides?.user?.id || hasPermission(Permission.MANAGE_USERS))
      ? `${serverUrl}/api/v1/user/${requestOverrides?.user?.id ?? user.id}/quota`
      : null
  );

  const currentlyRemaining =
    (quota?.movie.remaining ?? 0) - selectedParts.length;

  const getAllParts = (): number[] => {
    return (data?.parts ?? [])
      .filter((part) => part.mediaInfo?.status !== MediaStatus.BLACKLISTED)
      .map((part) => part.id);
  };

  const getAllRequestedParts = (): number[] => {
    const requestedParts = (data?.parts ?? []).reduce(
      (requestedParts, part) => {
        return [
          ...requestedParts,
          ...(part.mediaInfo?.requests ?? [])
            .filter(
              (request) =>
                request.is4k === is4k &&
                request.status !== MediaRequestStatus.DECLINED &&
                request.status !== MediaRequestStatus.COMPLETED
            )
            .map((part) => part.id),
        ];
      },
      [] as number[]
    );

    const availableParts = (data?.parts ?? [])
      .filter(
        (part) =>
          part.mediaInfo &&
          (part.mediaInfo[is4k ? 'status4k' : 'status'] ===
            MediaStatus.AVAILABLE ||
            part.mediaInfo[is4k ? 'status4k' : 'status'] ===
              MediaStatus.PROCESSING) &&
          !requestedParts.includes(part.id)
      )
      .map((part) => part.id);

    return [...requestedParts, ...availableParts];
  };

  const isSelectedPart = (tmdbId: number): boolean =>
    selectedParts.includes(tmdbId);

  const togglePart = (tmdbId: number): void => {
    // If this part already has a pending request, don't allow it to be toggled
    if (getAllRequestedParts().includes(tmdbId)) {
      return;
    }

    // If there are no more remaining requests available, block toggle
    if (
      quota?.movie.limit &&
      currentlyRemaining <= 0 &&
      !isSelectedPart(tmdbId)
    ) {
      return;
    }

    if (selectedParts.includes(tmdbId)) {
      setSelectedParts((parts) => parts.filter((partId) => partId !== tmdbId));
    } else {
      setSelectedParts((parts) => [...parts, tmdbId]);
    }
  };

  const unrequestedParts = getAllParts().filter(
    (tmdbId) => !getAllRequestedParts().includes(tmdbId)
  );

  const toggleAllParts = (): void => {
    // If the user has a quota and not enough requests for all parts, block toggleAllParts
    if (
      quota?.movie.limit &&
      (quota?.movie.remaining ?? 0) < unrequestedParts.length
    ) {
      return;
    }

    if (
      data &&
      selectedParts.length >= 0 &&
      selectedParts.length < unrequestedParts.length
    ) {
      setSelectedParts(unrequestedParts);
    } else {
      setSelectedParts([]);
    }
  };

  const isAllParts = (): boolean => {
    if (!data) {
      return false;
    }

    return (
      selectedParts.length ===
      getAllParts().filter((part) => !getAllRequestedParts().includes(part))
        .length
    );
  };

  const getPartRequest = (tmdbId: number): MediaRequest | undefined => {
    const part = (data?.parts ?? []).find((part) => part.id === tmdbId);

    return (part?.mediaInfo?.requests ?? []).find(
      (request) =>
        request.is4k === is4k &&
        request.status !== MediaRequestStatus.DECLINED &&
        request.status !== MediaRequestStatus.COMPLETED
    );
  };

  useEffect(() => {
    if (onUpdating) {
      onUpdating(isUpdating);
    }
  }, [isUpdating, onUpdating]);

  const sendRequest = useCallback(async () => {
    setIsUpdating(true);

    try {
      let overrideParams = {};
      if (requestOverrides) {
        overrideParams = {
          serverId: requestOverrides.server,
          profileId: requestOverrides.profile,
          rootFolder: requestOverrides.folder,
          userId: requestOverrides.user?.id,
          tags: requestOverrides.tags,
        };
      }

      await Promise.all(
        (
          data?.parts.filter((part) => selectedParts.includes(part.id)) ?? []
        ).map(async (part) => {
          await axios.post<MediaRequest>(serverUrl + '/api/v1/request', {
            mediaId: part.id,
            mediaType: 'movie',
            is4k,
            ...overrideParams,
          });
        })
      );

      if (onComplete) {
        onComplete(
          selectedParts.length === (data?.parts ?? []).length
            ? MediaStatus.UNKNOWN
            : MediaStatus.PARTIALLY_AVAILABLE
        );
      }

      toast.success(
        <ThemedText>
          {intl.formatMessage(messages.requestSuccess, {
            title: data?.name,
            strong: (msg: React.ReactNode) => <strong>{msg}</strong>,
          })}
        </ThemedText>
      );
    } catch {
      toast.error(intl.formatMessage(messages.requesterror));
    } finally {
      setIsUpdating(false);
    }
  }, [requestOverrides, data, onComplete, intl, selectedParts, is4k]);

  const hasAutoApprove = hasPermission(
    [
      Permission.MANAGE_REQUESTS,
      is4k ? Permission.AUTO_APPROVE_4K : Permission.AUTO_APPROVE,
      is4k ? Permission.AUTO_APPROVE_4K_MOVIE : Permission.AUTO_APPROVE_MOVIE,
    ],
    { type: 'or' }
  );

  const blacklistVisibility = hasPermission(
    [Permission.MANAGE_BLACKLIST, Permission.VIEW_BLACKLIST],
    { type: 'or' }
  );

  return (
    <Modal
      show={show}
      loading={(!data && !error) || !quota}
      backgroundClickable
      onCancel={onCancel}
      onOk={sendRequest}
      title={intl.formatMessage(
        is4k
          ? messages.requestcollection4ktitle
          : messages.requestcollectiontitle
      )}
      subTitle={data?.name}
      okText={
        isUpdating
          ? intl.formatMessage(globalMessages.requesting)
          : selectedParts.length === 0
            ? intl.formatMessage(messages.selectmovies)
            : intl.formatMessage(
                is4k ? messages.requestmovies4k : messages.requestmovies,
                {
                  count: selectedParts.length,
                }
              )
      }
      okDisabled={selectedParts.length === 0}
      okButtonType={'primary'}
      backdrop={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${data?.backdropPath}`}
    >
      {hasAutoApprove && !quota?.movie.restricted && (
        <View className="mt-6">
          <Alert
            title={intl.formatMessage(messages.requestadmin)}
            type="info"
          />
        </View>
      )}
      {(quota?.movie.limit ?? 0) > 0 && (
        <QuotaDisplay
          mediaType="movie"
          quota={quota?.movie}
          remaining={currentlyRemaining}
          userOverride={
            requestOverrides?.user && requestOverrides.user.id !== user?.id
              ? requestOverrides?.user?.id
              : undefined
          }
        />
      )}
      <View className="flex flex-col">
        <View className="-mx-4 sm:mx-0">
          <View className="inline-block min-w-full py-2 align-middle">
            <View className="overflow-hidden border border-gray-700 backdrop-blur sm:rounded-lg">
              <View className="min-w-full">
                <View className="flex flex-row">
                  <View className={`w-16 bg-gray-700/80 py-3`}>
                    <Switch
                      value={isAllParts()}
                      onValueChange={() => toggleAllParts()}
                      trackColor={{ false: '#1f2937', true: '#6366f1' }}
                      thumbColor="#ffffff"
                    />
                  </View>
                  <View className="flex flex-1 justify-center bg-gray-700/80 px-1 py-4 md:px-6">
                    <ThemedText className="text-left text-sm font-medium uppercase leading-4 tracking-wider text-gray-200">
                      {intl.formatMessage(globalMessages.movie)}
                    </ThemedText>
                  </View>
                  <View className="flex flex-1 justify-center bg-gray-700/80 px-1 py-4 md:px-6">
                    <ThemedText className="text-left text-sm font-medium uppercase leading-4 tracking-wider text-gray-200">
                      {intl.formatMessage(globalMessages.status)}
                    </ThemedText>
                  </View>
                </View>
                <View className="divide-y divide-gray-700">
                  {data?.parts
                    .filter((part) => {
                      if (!blacklistVisibility)
                        return (
                          part.mediaInfo?.status !== MediaStatus.BLACKLISTED
                        );
                      return part;
                    })
                    .map((part) => {
                      const partRequest = getPartRequest(part.id);
                      const partMedia =
                        part.mediaInfo &&
                        part.mediaInfo[is4k ? 'status4k' : 'status'] !==
                          MediaStatus.UNKNOWN &&
                        part.mediaInfo[is4k ? 'status4k' : 'status'] !==
                          MediaStatus.DELETED
                          ? part.mediaInfo
                          : undefined;

                      return (
                        <View key={`part-${part.id}`} className="flex flex-row">
                          <View className="flex w-16 justify-center py-3">
                            <Switch
                              value={
                                (!!partMedia &&
                                  partMedia.status !==
                                    MediaStatus.BLACKLISTED) ||
                                isSelectedPart(part.id)
                              }
                              onValueChange={() => togglePart(part.id)}
                              trackColor={{ false: '#374151', true: '#6366f1' }}
                              thumbColor="#ffffff"
                              disabled={
                                !!(
                                  partRequest ||
                                  (quota?.movie.limit &&
                                    currentlyRemaining <= 0 &&
                                    !isSelectedPart(part.id))
                                )
                              }
                            />
                          </View>
                          <View
                            className={`flex flex-1 flex-row px-1 py-4 ${
                              partMedia?.status === MediaStatus.BLACKLISTED &&
                              'pointer-events-none opacity-50'
                            }`}
                          >
                            <View className="relative h-auto w-10 flex-shrink-0 overflow-hidden rounded-md">
                              <CachedImage
                                type="tmdb"
                                src={
                                  part.posterPath
                                    ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${part.posterPath}`
                                    : '/images/jellyseerr_poster_not_found.png'
                                }
                                alt=""
                                style={{
                                  // width: '100%',
                                  // height: 'auto',
                                  width: 40,
                                  height: 60,
                                  objectFit: 'cover',
                                }}
                                // width={600}
                                // height={900}
                              />
                            </View>
                            <View className="flex flex-col justify-center pl-2">
                              <ThemedText className="text-xs font-medium">
                                {part.releaseDate?.slice(0, 4)}
                              </ThemedText>
                              <ThemedText className="text-base font-bold">
                                {part.title}
                              </ThemedText>
                            </View>
                          </View>
                          <View className="flex flex-1 justify-center px-2 py-4">
                            <View className="flex flex-row justify-start">
                              {!partMedia && !partRequest && (
                                <Badge>
                                  {intl.formatMessage(
                                    globalMessages.notrequested
                                  )}
                                </Badge>
                              )}
                              {!partMedia &&
                                partRequest?.status ===
                                  MediaRequestStatus.PENDING && (
                                  <Badge badgeType="warning">
                                    {intl.formatMessage(globalMessages.pending)}
                                  </Badge>
                                )}
                              {((!partMedia &&
                                partRequest?.status ===
                                  MediaRequestStatus.APPROVED) ||
                                partMedia?.[is4k ? 'status4k' : 'status'] ===
                                  MediaStatus.PROCESSING) && (
                                <Badge badgeType="primary">
                                  {intl.formatMessage(globalMessages.requested)}
                                </Badge>
                              )}
                              {partMedia?.[is4k ? 'status4k' : 'status'] ===
                                MediaStatus.AVAILABLE && (
                                <Badge badgeType="success">
                                  {intl.formatMessage(globalMessages.available)}
                                </Badge>
                              )}
                              {partMedia?.status ===
                                MediaStatus.BLACKLISTED && (
                                <Badge badgeType="danger">
                                  {intl.formatMessage(
                                    globalMessages.blacklisted
                                  )}
                                </Badge>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
      {(hasPermission(Permission.REQUEST_ADVANCED) ||
        hasPermission(Permission.MANAGE_REQUESTS)) && (
        <AdvancedRequester
          type="movie"
          is4k={is4k}
          onChange={(overrides) => {
            setRequestOverrides(overrides);
          }}
        />
      )}
    </Modal>
  );
};

export default CollectionRequestModal;
