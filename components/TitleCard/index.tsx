import CachedImage from '@app/components/Common/CachedImage';
import StatusBadgeMini from '@app/components/Common/StatusBadgeMini';
import ThemedText from '@app/components/Common/ThemedText';
import ErrorCard from '@app/components/TitleCard/ErrorCard';
import Placeholder from '@app/components/TitleCard/Placeholder';
import globalMessages from '@app/utils/globalMessages';
import { withProperties } from '@app/utils/typeHelpers';
import { MediaStatus } from '@server/constants/media';
import type { MediaType } from '@server/models/Search';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';

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
    <Link
      href={`/${mediaType}/${id}`}
      className="overflow-hidden"
      style={!canExpand ? { width: 150, height: 225 } : {}}
      asChild
    >
      <Pressable className="rounded-xl border border-gray-700 bg-gray-700 transition-colors focus:border-indigo-500">
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
          {currentStatus &&
            currentStatus !== MediaStatus.UNKNOWN &&
            currentStatus !== MediaStatus.DELETED && (
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
          style={
            canExpand
              ? { width: '100%', aspectRatio: '2/3' }
              : { width: 150, height: 225 }
          }
          contentFit="cover"
          alt=""
          src={
            image
              ? `https://image.tmdb.org/t/p/w300_and_h450_face${image}`
              : `/images/seerr_poster_not_found_logo_top.png`
          }
          placeholder={null}
          placeholderContentFit="cover"
        />
      </Pressable>
    </Link>
  );
};

export default withProperties(TitleCard, { Placeholder, ErrorCard });
