import Alert from '@/components/Common/Alert';
import Modal from '@/components/Common/Modal';
import ThemedText from '@/components/Common/ThemedText';
import type { RequestOverrides } from '@/components/RequestModal/AdvancedRequester';
import AdvancedRequester from '@/components/RequestModal/AdvancedRequester';
import QuotaDisplay from '@/components/RequestModal/QuotaDisplay';
import useServerUrl from '@/hooks/useServerUrl';
import { useUser } from '@/hooks/useUser';
import { MediaStatus } from '@/jellyseerr/server/constants/media';
import type { MediaRequest } from '@/jellyseerr/server/entity/MediaRequest';
import type { NonFunctionProperties } from '@/jellyseerr/server/interfaces/api/common';
import type { QuotaResponse } from '@/jellyseerr/server/interfaces/api/userInterfaces';
import { Permission } from '@/jellyseerr/server/lib/permissions';
import type { MovieDetails } from '@/jellyseerr/server/models/Movie';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import globalMessages from '@/utils/globalMessages';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast/headless';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import useSWR, { mutate } from 'swr';

const messages = getJellyseerrMessages('components.RequestModal');

interface RequestModalProps {
  show: boolean;
  tmdbId: number;
  is4k?: boolean;
  editRequest?: NonFunctionProperties<MediaRequest>;
  onCancel?: () => void;
  onComplete?: (newStatus: MediaStatus) => void;
  onUpdating?: (isUpdating: boolean) => void;
}

const MovieRequestModal = ({
  show,
  onCancel,
  onComplete,
  tmdbId,
  onUpdating,
  editRequest,
  is4k = false,
}: RequestModalProps) => {
  const serverUrl = useServerUrl();
  const [isUpdating, setIsUpdating] = useState(false);
  const [requestOverrides, setRequestOverrides] =
    useState<RequestOverrides | null>(null);
  const { data, error } = useSWR<MovieDetails>(
    `${serverUrl}/api/v1/movie/${tmdbId}`,
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
      const response = await axios.post<MediaRequest>(
        serverUrl + '/api/v1/request',
        {
          mediaId: data?.id,
          mediaType: 'movie',
          is4k,
          ...overrideParams,
        }
      );
      mutate(
        serverUrl + '/api/v1/request?filter=all&take=10&sort=modified&skip=0'
      );
      mutate(serverUrl + '/api/v1/request/count');

      if (response.data) {
        if (onComplete) {
          onComplete(
            hasPermission(
              is4k ? Permission.AUTO_APPROVE_4K : Permission.AUTO_APPROVE
            ) ||
              hasPermission(
                is4k
                  ? Permission.AUTO_APPROVE_4K_MOVIE
                  : Permission.AUTO_APPROVE_MOVIE
              )
              ? MediaStatus.PROCESSING
              : MediaStatus.PENDING
          );
        }
        toast.success(
          <ThemedText>
            {intl.formatMessage(messages.requestSuccess, {
              title: data?.title,
              strong: (msg: React.ReactNode) => (
                <ThemedText className="font-bold">{msg}</ThemedText>
              ),
            })}
          </ThemedText>
        );
      }
    } catch {
      toast.error(intl.formatMessage(messages.requesterror));
    } finally {
      setIsUpdating(false);
    }
  }, [
    requestOverrides,
    serverUrl,
    data?.id,
    data?.title,
    is4k,
    onComplete,
    intl,
    hasPermission,
  ]);

  const cancelRequest = async () => {
    setIsUpdating(true);

    try {
      const response = await axios.delete<MediaRequest>(
        `${serverUrl}/api/v1/request/${editRequest?.id}`
      );
      mutate(
        serverUrl + '/api/v1/request?filter=all&take=10&sort=modified&skip=0'
      );
      mutate(serverUrl + '/api/v1/request/count');

      if (response.status === 204) {
        if (onComplete) {
          onComplete(MediaStatus.UNKNOWN);
        }
        toast.success(
          <ThemedText>
            {intl.formatMessage(messages.requestCancel, {
              title: data?.title,
              strong: (msg: React.ReactNode) => (
                <ThemedText className="font-bold">{msg}</ThemedText>
              ),
            })}
          </ThemedText>
        );
      }
    } catch {
      setIsUpdating(false);
    }
  };

  const updateRequest = async (alsoApproveRequest = false) => {
    setIsUpdating(true);

    try {
      await axios.put(`${serverUrl}/api/v1/request/${editRequest?.id}`, {
        mediaType: 'movie',
        serverId: requestOverrides?.server,
        profileId: requestOverrides?.profile,
        rootFolder: requestOverrides?.folder,
        userId: requestOverrides?.user?.id,
        tags: requestOverrides?.tags,
      });

      if (alsoApproveRequest) {
        await axios.post(
          `${serverUrl}/api/v1/request/${editRequest?.id}/approve`
        );
      }
      mutate(
        serverUrl + '/api/v1/request?filter=all&take=10&sort=modified&skip=0'
      );
      mutate(serverUrl + '/api/v1/request/count');

      toast.success(
        <ThemedText>
          {intl.formatMessage(
            alsoApproveRequest
              ? messages.requestApproved
              : messages.requestedited,
            {
              title: data?.title,
              strong: (msg: React.ReactNode) => (
                <ThemedText className="font-bold">{msg}</ThemedText>
              ),
            }
          )}
        </ThemedText>
      );

      if (onComplete) {
        onComplete(MediaStatus.PENDING);
      }
    } catch {
      toast.error(
        <ThemedText>{intl.formatMessage(messages.errorediting)}</ThemedText>
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (editRequest) {
    const isOwner = editRequest.requestedBy.id === user?.id;

    return (
      <Modal
        show={show}
        loading={!data && !error}
        backgroundClickable
        onCancel={onCancel}
        title={intl.formatMessage(
          is4k ? messages.pending4krequest : messages.pendingrequest
        )}
        subTitle={data?.title}
        onOk={() =>
          hasPermission(Permission.MANAGE_REQUESTS)
            ? updateRequest(true)
            : hasPermission(Permission.REQUEST_ADVANCED)
              ? updateRequest()
              : cancelRequest()
        }
        okDisabled={isUpdating}
        okText={
          hasPermission(Permission.MANAGE_REQUESTS)
            ? intl.formatMessage(messages.approve)
            : hasPermission(Permission.REQUEST_ADVANCED)
              ? intl.formatMessage(messages.edit)
              : intl.formatMessage(messages.cancel)
        }
        okButtonType={
          hasPermission(Permission.MANAGE_REQUESTS)
            ? 'success'
            : hasPermission(Permission.REQUEST_ADVANCED)
              ? 'primary'
              : 'danger'
        }
        onSecondary={
          isOwner &&
          hasPermission(
            [Permission.REQUEST_ADVANCED, Permission.MANAGE_REQUESTS],
            { type: 'or' }
          )
            ? () => cancelRequest()
            : undefined
        }
        secondaryDisabled={isUpdating}
        secondaryText={
          isOwner &&
          hasPermission(
            [Permission.REQUEST_ADVANCED, Permission.MANAGE_REQUESTS],
            { type: 'or' }
          )
            ? intl.formatMessage(messages.cancel)
            : undefined
        }
        secondaryButtonType="danger"
        cancelText={intl.formatMessage(globalMessages.close)}
        backdrop={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${data?.backdropPath}`}
      >
        <ThemedText>
          {isOwner
            ? intl.formatMessage(messages.pendingapproval)
            : intl.formatMessage(messages.requestfrom, {
                username: editRequest.requestedBy.displayName,
              })}
        </ThemedText>
        {(hasPermission(Permission.REQUEST_ADVANCED) ||
          hasPermission(Permission.MANAGE_REQUESTS)) && (
          <AdvancedRequester
            type="movie"
            is4k={is4k}
            requestUser={editRequest.requestedBy}
            defaultOverrides={{
              folder: editRequest.rootFolder,
              profile: editRequest.profileId,
              server: editRequest.serverId,
              tags: editRequest.tags,
            }}
            onChange={(overrides) => {
              setRequestOverrides(overrides);
            }}
          />
        )}
      </Modal>
    );
  }

  const hasAutoApprove = hasPermission(
    [
      Permission.MANAGE_REQUESTS,
      is4k ? Permission.AUTO_APPROVE_4K : Permission.AUTO_APPROVE,
      is4k ? Permission.AUTO_APPROVE_4K_MOVIE : Permission.AUTO_APPROVE_MOVIE,
    ],
    { type: 'or' }
  );

  return (
    <Modal
      show={show}
      loading={(!data && !error) || !quota}
      backgroundClickable
      onCancel={onCancel}
      onOk={sendRequest}
      okDisabled={isUpdating || quota?.movie.restricted}
      title={intl.formatMessage(
        is4k ? messages.requestmovie4ktitle : messages.requestmovietitle
      )}
      subTitle={data?.title}
      okText={
        isUpdating
          ? intl.formatMessage(globalMessages.requesting)
          : intl.formatMessage(
              is4k ? globalMessages.request4k : globalMessages.request
            )
      }
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
          userOverride={
            requestOverrides?.user && requestOverrides.user.id !== user?.id
              ? requestOverrides?.user?.id
              : undefined
          }
        />
      )}
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

export default MovieRequestModal;
