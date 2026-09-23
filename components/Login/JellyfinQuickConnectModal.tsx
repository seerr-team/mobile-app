import QuickConnectModal from '@app/components/Common/QuickConnectModal';
import useServerUrl from '@app/hooks/useServerUrl';
import getSeerrMessages from '@app/utils/getSeerrMessages';
import axios from 'axios';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';

const messages = getSeerrMessages('components.Login.JellyfinQuickConnectModal');

interface JellyfinQuickConnectModalProps {
  onClose: () => void;
  onAuthenticated: () => void;
  onError: (error: string) => void;
  mediaServerName: string;
}

const JellyfinQuickConnectModal = ({
  onClose,
  onAuthenticated,
  onError,
  mediaServerName,
}: JellyfinQuickConnectModalProps) => {
  const serverUrl = useServerUrl();
  const intl = useIntl();

  const authenticate = useCallback(
    async (secret: string) => {
      await axios.post(
        serverUrl + '/api/v1/auth/jellyfin/quickconnect/authenticate',
        {
          secret,
        }
      );
    },
    [serverUrl]
  );

  return (
    <QuickConnectModal
      show
      title={intl.formatMessage(messages.title)}
      subTitle={intl.formatMessage(messages.subtitle)}
      cancelText={intl.formatMessage(messages.cancel)}
      instructionsMessage={intl.formatMessage(messages.instructions, {
        mediaServerName,
      })}
      onCancel={onClose}
      onSuccess={() => {
        onAuthenticated();
        onClose();
      }}
      onError={onError}
      authenticate={authenticate}
    />
  );
};

export default JellyfinQuickConnectModal;
