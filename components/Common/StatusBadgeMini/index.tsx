import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ThemedText from '@/components/Common/ThemedText';
import { MediaStatus } from '@/jellyseerr/server/constants/media';
import { CheckCircle } from '@nandorojo/heroicons/20/solid';
import {
  Bell,
  Clock,
  EyeSlash,
  MinusSmall,
  Trash,
} from '@nandorojo/heroicons/24/solid';
import { View } from 'react-native';

interface StatusBadgeMiniProps {
  status: MediaStatus;
  is4k?: boolean;
  inProgress?: boolean;
  // Should the badge shrink on mobile to a smaller size? (TitleCard)
  shrink?: boolean;
}

const StatusBadgeMini = ({
  status,
  is4k = false,
  inProgress = false,
  shrink = false,
}: StatusBadgeMiniProps) => {
  const badgeStyle = [
    `rounded-full bg-opacity-80 shadow-md ${
      shrink ? 'border p-0' : 'ring-1 p-0.5'
    }`,
  ];

  let indicatorIcon: React.ReactNode;

  switch (status) {
    case MediaStatus.PROCESSING:
      badgeStyle.push('bg-indigo-500 border-indigo-400 ring-indigo-400');
      indicatorIcon = <Clock color="#e0e7ff" />;
      break;
    case MediaStatus.AVAILABLE:
      badgeStyle.push(
        'bg-green-500 border-green-400 ring-green-400 text-green-100'
      );
      indicatorIcon = <CheckCircle color="#dcfce7" />;
      break;
    case MediaStatus.PENDING:
      badgeStyle.push(
        'bg-yellow-500 border-yellow-400 ring-yellow-400 text-yellow-100'
      );
      indicatorIcon = <Bell color="#fef9c3" />;
      break;
    case MediaStatus.BLACKLISTED:
      badgeStyle.push('bg-red-500 border-white-400 ring-white-400 text-white');
      indicatorIcon = <EyeSlash color="#ffffff" />;
      break;
    case MediaStatus.PARTIALLY_AVAILABLE:
      badgeStyle.push(
        'bg-green-500 border-green-400 ring-green-400 text-green-100'
      );
      indicatorIcon = <MinusSmall width={20} height={20} color="#dcfce7" />;
      break;
    case MediaStatus.DELETED:
      badgeStyle.push('bg-red-500 border-red-400 ring-red-400 text-red-100');
      indicatorIcon = <Trash />;
      break;
  }

  if (inProgress) {
    indicatorIcon = <LoadingSpinner />;
  }

  return (
    <View
      className={`relative inline-flex whitespace-nowrap rounded-full border-gray-700 text-xs font-semibold leading-5 ring-gray-700 ${
        shrink ? '' : 'ring-1'
      }`}
    >
      <View className={badgeStyle.join(' ')}>{indicatorIcon}</View>
      {is4k && <ThemedText className="pl-1 pr-2 text-gray-200">4K</ThemedText>}
    </View>
  );
};

export default StatusBadgeMini;
