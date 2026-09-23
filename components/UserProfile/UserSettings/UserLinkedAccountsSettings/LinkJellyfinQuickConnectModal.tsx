import QuickConnectModal from '@app/components/Common/QuickConnectModal';
import useServerUrl from '@app/hooks/useServerUrl';
import useSettings from '@app/hooks/useSettings';
import { useUser } from '@app/hooks/useUser';
import getSeerrMessages from '@app/utils/getSeerrMessages';
import { MediaServerType } from '@server/constants/server';
import axios from 'axios';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';

const messages = getSeerrMessages(
  'components.UserProfile.UserSettings.LinkJellyfinQuickConnectModal'
);

interface LinkJellyfinQuickConnectModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  onSwitchToPassword: () => void;
}

const LinkJellyfinQuickConnectModal = ({
  show,
  onClose,
  onSave,
  onSwitchToPassword,
}: LinkJellyfinQuickConnectModalProps) => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const settings = useSettings();
  const { user } = useUser();

  const mediaServerName =
    settings.currentSettings.mediaServerType === MediaServerType.JELLYFIN
      ? 'Jellyfin'
      : 'Emby';

  const authenticate = useCallback(
    async (secret: string) => {
      await axios.post(
        `${serverUrl}/api/v1/user/${user?.id}/settings/linked-accounts/jellyfin/quickconnect`,
        { secret }
      );
    },
    [serverUrl, user]
  );

  const handleCancel = () => {
    onClose();
    onSwitchToPassword();
  };

  return (
    <QuickConnectModal
      show={show}
      title={intl.formatMessage(messages.title, { mediaServerName })}
      subTitle={intl.formatMessage(messages.subtitle)}
      cancelText={intl.formatMessage(messages.usePassword)}
      instructionsMessage={intl.formatMessage(messages.instructions, {
        mediaServerName,
      })}
      showInlineError
      onCancel={handleCancel}
      onSuccess={() => {
        onSave();
        onClose();
      }}
      authenticate={authenticate}
    />
  );
};

export default LinkJellyfinQuickConnectModal;
