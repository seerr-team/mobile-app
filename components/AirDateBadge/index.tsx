import Badge from '@/components/Common/Badge';
import getSeerrMessages from '@/utils/getSeerrMessages';
import { FormattedRelativeTime, useIntl } from 'react-intl';
import { View } from 'react-native';

const messages = getSeerrMessages('components.AirDateBadge');

type AirDateBadgeProps = {
  airDate: string;
};

const AirDateBadge = ({ airDate }: AirDateBadgeProps) => {
  const WEEK = 1000 * 60 * 60 * 24 * 8;
  const intl = useIntl();
  const dAirDate = new Date(airDate);
  const nowDate = new Date();
  const alreadyAired = dAirDate.getTime() < nowDate.getTime();
  const compareWeek = new Date(
    alreadyAired ? Date.now() - WEEK : Date.now() + WEEK
  );
  let showRelative = false;
  if (
    (alreadyAired && dAirDate.getTime() > compareWeek.getTime()) ||
    (!alreadyAired && dAirDate.getTime() < compareWeek.getTime())
  ) {
    showRelative = true;
  }

  const diffInDays = Math.round(
    (dAirDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <View className="flex flex-row items-center space-x-2">
      <Badge badgeType="light">
        {intl.formatDate(dAirDate, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC',
        })}
      </Badge>
      {showRelative && (
        <Badge badgeType="light">
          {intl.formatMessage(
            alreadyAired ? messages.airedrelative : messages.airsrelative,
            {
              relativeTime: (
                <FormattedRelativeTime
                  key={`airdate-${airDate}`}
                  value={diffInDays}
                  unit="day"
                  numeric="auto"
                />
              ),
            }
          )}
        </Badge>
      )}
    </View>
  );
};

export default AirDateBadge;
