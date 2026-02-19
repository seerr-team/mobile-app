import Badge from '@/components/Common/Badge';
import Tooltip from '@/components/Common/Tooltip';
import getSeerrMessages from '@/utils/getSeerrMessages';
import globalMessages from '@/utils/globalMessages';
import { useIntl } from 'react-intl';

const messages = getSeerrMessages('components.Settings');

const SettingsBadge = ({
  badgeType,
  className,
}: {
  badgeType: 'advanced' | 'experimental' | 'restartRequired';
  className?: string;
}) => {
  const intl = useIntl();

  switch (badgeType) {
    case 'advanced':
      return (
        <Tooltip content={intl.formatMessage(messages.advancedTooltip)}>
          <Badge badgeType="danger" className={className}>
            {intl.formatMessage(globalMessages.advanced)}
          </Badge>
        </Tooltip>
      );
    case 'experimental':
      return (
        <Tooltip content={intl.formatMessage(messages.experimentalTooltip)}>
          <Badge badgeType="warning">
            {intl.formatMessage(globalMessages.experimental)}
          </Badge>
        </Tooltip>
      );
    case 'restartRequired':
      return (
        <Tooltip content={intl.formatMessage(messages.restartrequiredTooltip)}>
          <Badge badgeType="primary" className={className}>
            {intl.formatMessage(globalMessages.restartRequired)}
          </Badge>
        </Tooltip>
      );
    default:
      return null;
  }
};

export default SettingsBadge;
