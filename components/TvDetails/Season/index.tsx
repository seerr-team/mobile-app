import AirDateBadge from '@/components/AirDateBadge';
import CachedImage from '@/components/Common/CachedImage';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import type { SeasonWithEpisodes } from '@/seerr/server/models/Tv';
import getSeerrMessages from '@/utils/getSeerrMessages';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import useSWR from 'swr';

const messages = getSeerrMessages('components.TvDetails.Season');

type SeasonProps = {
  seasonNumber: number;
  tvId: number;
};

const Season = ({ seasonNumber, tvId }: SeasonProps) => {
  const intl = useIntl();
  const serverUrl = useServerUrl();
  const { data, error } = useSWR<SeasonWithEpisodes>(
    `${serverUrl}/api/v1/tv/${tvId}/season/${seasonNumber}`
  );

  if (!data && !error) {
    return (
      <View className="mt-2">
        <LoadingSpinner size={24} />
      </View>
    );
  }

  if (!data) {
    return (
      <ThemedText>{intl.formatMessage(messages.somethingwentwrong)}</ThemedText>
    );
  }

  return (
    <View className="flex flex-col justify-center">
      {data.episodes.length === 0 ? (
        <ThemedText>{intl.formatMessage(messages.noepisodes)}</ThemedText>
      ) : (
        data.episodes
          .slice()
          .reverse()
          .map((episode, idx) => {
            return (
              <View
                className={`flex flex-col space-y-4 border-gray-700 py-4 xl:flex-row xl:space-x-4 xl:space-y-4 ${idx !== 0 ? 'border-t' : ''}`}
                key={`season-${seasonNumber}-episode-${episode.episodeNumber}`}
              >
                <View className={`flex-1 ${episode.stillPath ? 'mb-2' : ''}`}>
                  <View className="flex flex-col space-y-2 xl:flex-row xl:items-center xl:space-x-2 xl:space-y-0">
                    <ThemedText className="text-lg">
                      {episode.episodeNumber} - {episode.name}
                    </ThemedText>
                    {episode.airDate && (
                      <AirDateBadge airDate={episode.airDate} />
                    )}
                  </View>
                  {episode.overview && (
                    <ThemedText>{episode.overview}</ThemedText>
                  )}
                </View>
                {episode.stillPath && (
                  <View className="relative aspect-video overflow-hidden rounded-lg xl:h-32">
                    <CachedImage
                      type="tmdb"
                      src={episode.stillPath}
                      style={{ width: '100%', height: '100%' }}
                      alt=""
                    />
                  </View>
                )}
              </View>
            );
          })
      )}
    </View>
  );
};

export default Season;
