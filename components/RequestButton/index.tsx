import ButtonWithDropdown from '@/components/Common/ButtonWithDropdown';
import ThemedText from '@/components/Common/ThemedText';
import RequestModal from '@/components/RequestModal';
import useServerUrl from '@/hooks/useServerUrl';
import useSettings from '@/hooks/useSettings';
import { Permission, useUser } from '@/hooks/useUser';
import {
  MediaRequestStatus,
  MediaStatus,
} from '@/jellyseerr/server/constants/media';
import type Media from '@/jellyseerr/server/entity/Media';
import type { MediaRequest } from '@/jellyseerr/server/entity/MediaRequest';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import globalMessages from '@/utils/globalMessages';
import { ArrowDownTray } from '@nandorojo/heroicons/24/outline';
import { Check, InformationCircle, XMark } from '@nandorojo/heroicons/24/solid';
import axios from 'axios';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import { mutate } from 'swr';

const messages = getJellyseerrMessages('components.RequestButton');

interface ButtonOption {
  id: string;
  text: string;
  action: () => void;
  svg?: React.ReactNode;
}

interface RequestButtonProps {
  mediaType: 'movie' | 'tv';
  onUpdate: () => void;
  tmdbId: number;
  media?: Media;
  isShowComplete?: boolean;
  is4kShowComplete?: boolean;
}

const RequestButton = ({
  tmdbId,
  onUpdate,
  media,
  mediaType,
  isShowComplete = false,
  is4kShowComplete = false,
}: RequestButtonProps) => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const settings = useSettings();
  const { user, hasPermission } = useUser();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRequest4kModal, setShowRequest4kModal] = useState(false);
  const [editRequest, setEditRequest] = useState(false);

  // All pending requests
  const activeRequests = media?.requests.filter(
    (request) => request.status === MediaRequestStatus.PENDING && !request.is4k
  );
  const active4kRequests = media?.requests.filter(
    (request) => request.status === MediaRequestStatus.PENDING && request.is4k
  );

  // Current user's pending request, or the first pending request
  const activeRequest = useMemo(() => {
    return activeRequests && activeRequests.length > 0
      ? (activeRequests.find(
          (request) => request.requestedBy.id === user?.id
        ) ?? activeRequests[0])
      : undefined;
  }, [activeRequests, user]);
  const active4kRequest = useMemo(() => {
    return active4kRequests && active4kRequests.length > 0
      ? (active4kRequests.find(
          (request) => request.requestedBy.id === user?.id
        ) ?? active4kRequests[0])
      : undefined;
  }, [active4kRequests, user]);

  const modifyRequest = async (
    request: MediaRequest,
    type: 'approve' | 'decline'
  ) => {
    const response = await axios.post(
      `${serverUrl}/api/v1/request/${request.id}/${type}`
    );

    if (response) {
      onUpdate();
      mutate('/api/v1/request/count');
    }
  };

  const modifyRequests = async (
    requests: MediaRequest[],
    type: 'approve' | 'decline'
  ): Promise<void> => {
    if (!requests) {
      return;
    }

    await Promise.all(
      requests.map(async (request) => {
        return axios.post(`${serverUrl}/api/v1/request/${request.id}/${type}`);
      })
    );

    onUpdate();
    mutate('/api/v1/request/count');
  };

  const buttons: ButtonOption[] = [];

  // If there are pending requests, show request management options first
  if (activeRequest || active4kRequest) {
    if (
      activeRequest &&
      (activeRequest.requestedBy.id === user?.id ||
        (activeRequests?.length === 1 &&
          hasPermission(Permission.MANAGE_REQUESTS)))
    ) {
      buttons.push({
        id: 'active-request',
        text: intl.formatMessage(messages.viewrequest),
        action: () => {
          setEditRequest(true);
          setShowRequestModal(true);
        },
        svg: <InformationCircle color="#ffffff" />,
      });
    }

    if (
      activeRequest &&
      hasPermission(Permission.MANAGE_REQUESTS) &&
      mediaType === 'movie'
    ) {
      buttons.push(
        {
          id: 'approve-request',
          text: intl.formatMessage(messages.approverequest),
          action: () => {
            modifyRequest(activeRequest, 'approve');
          },
          svg: <Check color="#ffffff" />,
        },
        {
          id: 'decline-request',
          text: intl.formatMessage(messages.declinerequest),
          action: () => {
            modifyRequest(activeRequest, 'decline');
          },
          svg: <XMark />,
        }
      );
    } else if (
      activeRequests &&
      activeRequests.length > 0 &&
      hasPermission(Permission.MANAGE_REQUESTS) &&
      mediaType === 'tv'
    ) {
      buttons.push(
        {
          id: 'approve-request-batch',
          text: intl.formatMessage(messages.approverequests, {
            requestCount: activeRequests.length,
          }),
          action: () => {
            modifyRequests(activeRequests, 'approve');
          },
          svg: <Check color="#ffffff" />,
        },
        {
          id: 'decline-request-batch',
          text: intl.formatMessage(messages.declinerequests, {
            requestCount: activeRequests.length,
          }),
          action: () => {
            modifyRequests(activeRequests, 'decline');
          },
          svg: <XMark color="#ffffff" />,
        }
      );
    }

    if (
      active4kRequest &&
      (active4kRequest.requestedBy.id === user?.id ||
        (active4kRequests?.length === 1 &&
          hasPermission(Permission.MANAGE_REQUESTS)))
    ) {
      buttons.push({
        id: 'active-4k-request',
        text: intl.formatMessage(messages.viewrequest4k),
        action: () => {
          setEditRequest(true);
          setShowRequest4kModal(true);
        },
        svg: <InformationCircle color="#ffffff" />,
      });
    }

    if (
      active4kRequest &&
      hasPermission(Permission.MANAGE_REQUESTS) &&
      mediaType === 'movie'
    ) {
      buttons.push(
        {
          id: 'approve-4k-request',
          text: intl.formatMessage(messages.approverequest4k),
          action: () => {
            modifyRequest(active4kRequest, 'approve');
          },
          svg: <Check color="#ffffff" />,
        },
        {
          id: 'decline-4k-request',
          text: intl.formatMessage(messages.declinerequest4k),
          action: () => {
            modifyRequest(active4kRequest, 'decline');
          },
          svg: <XMark color="#ffffff" />,
        }
      );
    } else if (
      active4kRequests &&
      active4kRequests.length > 0 &&
      hasPermission(Permission.MANAGE_REQUESTS) &&
      mediaType === 'tv'
    ) {
      buttons.push(
        {
          id: 'approve-4k-request-batch',
          text: intl.formatMessage(messages.approve4krequests, {
            requestCount: active4kRequests.length,
          }),
          action: () => {
            modifyRequests(active4kRequests, 'approve');
          },
          svg: <Check color="#ffffff" />,
        },
        {
          id: 'decline-4k-request-batch',
          text: intl.formatMessage(messages.decline4krequests, {
            requestCount: active4kRequests.length,
          }),
          action: () => {
            modifyRequests(active4kRequests, 'decline');
          },
          svg: <XMark color="#ffffff" />,
        }
      );
    }
  }

  // Standard request button
  if (
    (!media ||
      media.status === MediaStatus.UNKNOWN ||
      (media.status === MediaStatus.DELETED && !activeRequest)) &&
    hasPermission(
      [
        Permission.REQUEST,
        mediaType === 'movie'
          ? Permission.REQUEST_MOVIE
          : Permission.REQUEST_TV,
      ],
      { type: 'or' }
    )
  ) {
    buttons.push({
      id: 'request',
      text: intl.formatMessage(globalMessages.request),
      action: () => {
        setEditRequest(false);
        setShowRequestModal(true);
      },
      svg: <ArrowDownTray color="#ffffff" />,
    });
  } else if (
    mediaType === 'tv' &&
    (!activeRequest || activeRequest.requestedBy.id !== user?.id) &&
    hasPermission([Permission.REQUEST, Permission.REQUEST_TV], {
      type: 'or',
    }) &&
    media &&
    media.status !== MediaStatus.BLACKLISTED &&
    !isShowComplete
  ) {
    buttons.push({
      id: 'request-more',
      text: intl.formatMessage(messages.requestmore),
      action: () => {
        setEditRequest(false);
        setShowRequestModal(true);
      },
      svg: <ArrowDownTray color="#ffffff" />,
    });
  }

  // 4K request button
  if (
    (!media ||
      media.status4k === MediaStatus.UNKNOWN ||
      (media.status4k === MediaStatus.DELETED && !active4kRequest)) &&
    hasPermission(
      [
        Permission.REQUEST_4K,
        mediaType === 'movie'
          ? Permission.REQUEST_4K_MOVIE
          : Permission.REQUEST_4K_TV,
      ],
      { type: 'or' }
    ) &&
    ((settings.currentSettings.movie4kEnabled && mediaType === 'movie') ||
      (settings.currentSettings.series4kEnabled && mediaType === 'tv'))
  ) {
    buttons.push({
      id: 'request4k',
      text: intl.formatMessage(globalMessages.request4k),
      action: () => {
        setEditRequest(false);
        setShowRequest4kModal(true);
      },
      svg: <ArrowDownTray color="#ffffff" />,
    });
  } else if (
    mediaType === 'tv' &&
    (!active4kRequest || active4kRequest.requestedBy.id !== user?.id) &&
    hasPermission([Permission.REQUEST_4K, Permission.REQUEST_4K_TV], {
      type: 'or',
    }) &&
    media &&
    media.status4k !== MediaStatus.BLACKLISTED &&
    !is4kShowComplete &&
    settings.currentSettings.series4kEnabled
  ) {
    buttons.push({
      id: 'request-more-4k',
      text: intl.formatMessage(messages.requestmore4k),
      action: () => {
        setEditRequest(false);
        setShowRequest4kModal(true);
      },
      svg: <ArrowDownTray color="#ffffff" />,
    });
  }

  const [buttonOne, ...others] = buttons;

  if (!buttonOne) {
    return null;
  }

  return (
    <View>
      <RequestModal
        tmdbId={tmdbId}
        show={showRequestModal}
        type={mediaType}
        editRequest={editRequest ? activeRequest : undefined}
        onComplete={() => {
          onUpdate();
          setShowRequestModal(false);
        }}
        onCancel={() => setShowRequestModal(false)}
      />
      <RequestModal
        tmdbId={tmdbId}
        show={showRequest4kModal}
        type={mediaType}
        editRequest={editRequest ? active4kRequest : undefined}
        is4k
        onComplete={() => {
          onUpdate();
          setShowRequest4kModal(false);
        }}
        onCancel={() => setShowRequest4kModal(false)}
      />
      <ButtonWithDropdown
        text={
          <>
            {buttonOne.svg}
            <ThemedText>{buttonOne.text}</ThemedText>
          </>
        }
        onPress={buttonOne.action}
      >
        {others && others.length > 0
          ? others.map((button) => (
              <ButtonWithDropdown.Item
                onPress={button.action}
                key={`request-option-${button.id}`}
              >
                {button.svg}
                <ThemedText>{button.text}</ThemedText>
              </ButtonWithDropdown.Item>
            ))
          : null}
      </ButtonWithDropdown>
    </View>
  );
};

export default RequestButton;
