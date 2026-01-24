import ThemedText from '@/components/Common/ThemedText';
import PersonCard from '@/components/PersonCard';
import TitleCard from '@/components/TitleCard';
import TmdbTitleCard from '@/components/TitleCard/TmdbTitleCard';
import { Permission, useUser } from '@/hooks/useUser';
import { MediaStatus } from '@/seerr/server/constants/media';
import type { WatchlistItem } from '@/seerr/server/interfaces/api/discoverInterfaces';
import type {
  CollectionResult,
  MovieResult,
  PersonResult,
  TvResult,
} from '@/seerr/server/models/Search';
import globalMessages from '@/utils/globalMessages';
import { useIntl } from 'react-intl';
import { FlatList, Platform, View } from 'react-native';

type ListViewProps = {
  items?: (TvResult | MovieResult | PersonResult | CollectionResult)[];
  plexItems?: WatchlistItem[];
  isEmpty?: boolean;
  isLoading?: boolean;
  isReachingEnd?: boolean;
  onScrollBottom: () => void;
  mutateParent?: () => void;
  header?: React.ReactElement;
};

const ListView = ({
  items,
  isEmpty,
  isLoading,
  onScrollBottom,
  isReachingEnd,
  plexItems,
  mutateParent,
  header,
}: ListViewProps) => {
  const intl = useIntl();
  const { hasPermission } = useUser();
  // useVerticalScroll(onScrollBottom, !isLoading && !isEmpty && !isReachingEnd);

  const blacklistVisibility = hasPermission(
    [Permission.MANAGE_BLACKLIST, Permission.VIEW_BLACKLIST],
    { type: 'or' }
  );

  if (isEmpty && !isLoading) {
    return (
      <View className="flex w-full flex-1 items-center justify-center">
        <ThemedText className="text-center text-2xl text-gray-400">
          {intl.formatMessage(globalMessages.noresults)}
        </ThemedText>
      </View>
    );
  }

  return (
    <View className="px-2">
      <FlatList
        ListHeaderComponent={
          header
            ? () => {
                return (
                  <>
                    {header}
                    <View />
                  </>
                );
              }
            : undefined
        }
        renderItem={({ item, index }) => item}
        numColumns={Platform.isTV ? 6 : 2}
        horizontal={false}
        contentContainerStyle={{ alignItems: 'stretch' }}
        onEndReached={onScrollBottom}
        data={[
          ...(plexItems || []).map((title, index) => {
            return (
              <View className="m-2 flex-1" key={`${title.ratingKey}-${index}`}>
                <TmdbTitleCard
                  id={title.tmdbId}
                  tmdbId={title.tmdbId}
                  type={title.mediaType}
                  isAddedToWatchlist={true}
                  canExpand
                  mutateParent={mutateParent}
                />
              </View>
            );
          }),
          ...(items || [])
            .filter((title) => {
              if (!blacklistVisibility)
                return (
                  (title as TvResult | MovieResult).mediaInfo?.status !==
                  MediaStatus.BLACKLISTED
                );
              return title;
            })
            .map((title, index) => {
              let titleCard: React.ReactNode;

              switch (title.mediaType) {
                case 'movie':
                  titleCard = (
                    <TitleCard
                      key={title.id}
                      id={title.id}
                      isAddedToWatchlist={
                        title.mediaInfo?.watchlists?.length ?? 0
                      }
                      image={title.posterPath}
                      status={title.mediaInfo?.status}
                      summary={title.overview}
                      title={title.title}
                      userScore={title.voteAverage}
                      year={title.releaseDate}
                      mediaType={title.mediaType}
                      inProgress={
                        (title.mediaInfo?.downloadStatus ?? []).length > 0
                      }
                      canExpand
                    />
                  );
                  break;
                case 'tv':
                  titleCard = (
                    <TitleCard
                      key={title.id}
                      id={title.id}
                      isAddedToWatchlist={
                        title.mediaInfo?.watchlists?.length ?? 0
                      }
                      image={title.posterPath}
                      status={title.mediaInfo?.status}
                      summary={title.overview}
                      title={title.name}
                      userScore={title.voteAverage}
                      year={title.firstAirDate}
                      mediaType={title.mediaType}
                      inProgress={
                        (title.mediaInfo?.downloadStatus ?? []).length > 0
                      }
                      canExpand
                    />
                  );
                  break;
                case 'collection':
                  titleCard = (
                    <TitleCard
                      id={title.id}
                      image={title.posterPath}
                      summary={title.overview}
                      title={title.title}
                      mediaType={title.mediaType}
                      canExpand
                    />
                  );
                  break;
                case 'person':
                  titleCard = (
                    <PersonCard
                      personId={title.id}
                      name={title.name}
                      profilePath={title.profilePath}
                      canExpand
                    />
                  );
                  break;
              }

              return (
                <View className="m-2 flex-1" key={`${title.id}-${index}`}>
                  {titleCard}
                </View>
              );
            }),
          ...(isLoading && !isReachingEnd
            ? [...Array(20)].map((_item, i) => (
                <View className="m-2 flex-1" key={`placeholder-${i}`}>
                  <TitleCard.Placeholder canExpand />
                </View>
              ))
            : []),
        ]}
      />
    </View>
  );
};

export default ListView;
