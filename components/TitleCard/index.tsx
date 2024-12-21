import CachedImage, { blurhash } from '@/components/Common/CachedImage';
import ThemedText from '@/components/Common/ThemedText';
import StatusBadgeMini from '@/components/StatusBadgeMini';
import ErrorCard from '@/components/TitleCard/ErrorCard';
import Placeholder from '@/components/TitleCard/Placeholder';
import { MediaStatus } from '@/jellyseerr/server/constants/media';
import type { MediaType } from '@/jellyseerr/server/models/Search';
import globalMessages from '@/utils/globalMessages';
import { withProperties } from '@/utils/typeHelpers';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';

interface TitleCardProps {
  id: number;
  image?: string;
  summary?: string;
  year?: string;
  title: string;
  userScore?: number;
  mediaType: MediaType;
  status?: MediaStatus;
  canExpand?: boolean;
  inProgress?: boolean;
  isAddedToWatchlist?: number | boolean;
  mutateParent?: () => void;
}

const TitleCard = ({
  id,
  image,
  summary,
  year,
  title,
  status,
  mediaType,
  isAddedToWatchlist = false,
  inProgress = false,
  canExpand = false,
  mutateParent,
}: TitleCardProps) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  const intl = useIntl();

  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  return (
    <View
      className="overflow-hidden rounded-xl border border-gray-700 bg-gray-700"
      style={{ width: 150, height: 225 }}
    >
      <View className="absolute flex w-full flex-row justify-between p-2">
        <View
          className={`pointer-events-none z-40 self-start rounded-full border shadow-md ${
            mediaType === 'movie' || mediaType === 'collection'
              ? 'border-blue-500 bg-blue-600/80'
              : 'border-purple-600 bg-purple-600/80'
          }`}
        >
          <View className="flex items-center px-2 py-1 text-center">
            <ThemedText className="text-xs font-medium uppercase tracking-wider text-white">
              {mediaType === 'movie'
                ? intl.formatMessage(globalMessages.movie)
                : mediaType === 'collection'
                  ? intl.formatMessage(globalMessages.collection)
                  : intl.formatMessage(globalMessages.tvshow)}
            </ThemedText>
          </View>
        </View>
        {currentStatus && currentStatus !== MediaStatus.UNKNOWN && (
          <View className="flex flex-col items-center gap-1">
            <View className="pointer-events-none z-40 flex">
              <StatusBadgeMini
                status={currentStatus}
                inProgress={inProgress}
                shrink
              />
            </View>
          </View>
        )}
      </View>
      <CachedImage
        type="tmdb"
        style={{ width: 150, height: 225 }}
        contentFit="cover"
        transition={200}
        alt=""
        src={
          image
            ? `https://image.tmdb.org/t/p/w300_and_h450_face${image}`
            : `/images/overseerr_poster_not_found_logo_top.png`
        }
        placeholder={{ blurhash, width: 150, height: 225 }}
        placeholderContentFit="cover"
      />
    </View>
  );
};

export { Placeholder };

export default withProperties(TitleCard, { Placeholder, ErrorCard });
