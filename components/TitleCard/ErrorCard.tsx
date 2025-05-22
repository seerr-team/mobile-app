import Button from '@/components/Common/Button';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import globalMessages from '@/utils/globalMessages';
import { Check, Trash } from '@nandorojo/heroicons/24/solid';
import axios from 'axios';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import { mutate } from 'swr';

interface ErrorCardProps {
  id: number;
  tmdbId: number;
  tvdbId?: number;
  type: 'movie' | 'tv';
  canExpand?: boolean;
}

const messages = getJellyseerrMessages('components.TitleCard');

const ErrorCard = ({ id, tmdbId, tvdbId, type, canExpand }: ErrorCardProps) => {
  const intl = useIntl();
  const serverUrl = useServerUrl();

  const deleteMedia = async () => {
    await axios.delete(`${serverUrl}/api/v1/media/${id}`);
    mutate(
      serverUrl + '/api/v1/media?filter=allavailable&take=20&sort=mediaAdded'
    );
    mutate(
      serverUrl + '/api/v1/request?filter=all&take=10&sort=modified&skip=0'
    );
  };

  return (
    <View
      className={canExpand ? 'w-full' : 'w-36 sm:w-36 md:w-44'}
      data-testid="title-card"
    >
      <View
        className="relative overflow-hidden rounded-xl border border-gray-700 bg-gray-700 bg-cover shadow outline-none"
        style={{
          paddingBottom: '150%',
        }}
      >
        <View className="absolute inset-0 h-full w-full overflow-hidden">
          <View className="absolute left-0 right-0 flex items-center justify-between p-2">
            <View
              className={`pointer-events-none z-40 rounded-full shadow ${
                type === 'movie' ? 'bg-blue-500' : 'bg-purple-600'
              }`}
            >
              <View className="flex h-4 items-center px-2 py-2 text-center text-xs font-medium uppercase tracking-wider text-white sm:h-5">
                {type === 'movie'
                  ? intl.formatMessage(globalMessages.movie)
                  : intl.formatMessage(globalMessages.tvshow)}
              </View>
            </View>
            <View className="pointer-events-none z-40">
              <View className="flex h-4 w-4 items-center justify-center rounded-full bg-green-400 text-white shadow sm:h-5 sm:w-5">
                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
              </View>
            </View>
          </View>

          <View className="flex h-full w-full items-end">
            <View className="px-2 pb-11 text-white">
              <ThemedText
                className="whitespace-normal text-xl font-bold leading-tight"
                style={{
                  overflow: 'hidden',
                }}
                data-testid="title-card-title"
              >
                {intl.formatMessage(messages.mediaerror, {
                  mediaType: intl.formatMessage(
                    type === 'movie'
                      ? globalMessages.movie
                      : globalMessages.tvshow
                  ),
                })}
              </ThemedText>
              <View
                className="whitespace-normal text-xs"
                style={{
                  overflow: 'hidden',
                }}
              >
                <View className="flex items-center">
                  <ThemedText className="mr-2 font-bold text-gray-400">
                    {intl.formatMessage(messages.tmdbid)}
                  </ThemedText>
                  {tmdbId}
                </View>
                {!!tvdbId && (
                  <View className="mt-2 flex items-center sm:mt-1">
                    <ThemedText className="mr-2 font-bold text-gray-400">
                      {intl.formatMessage(messages.tvdbid)}
                    </ThemedText>
                    {tvdbId}
                  </View>
                )}
              </View>
            </View>
          </View>

          <View className="absolute bottom-0 left-0 right-0 flex justify-between px-2 py-2">
            <Button
              onClick={() => {
                deleteMedia();
              }}
              className="h-7 w-full"
            >
              <Trash />
              <ThemedText>{intl.formatMessage(messages.cleardata)}</ThemedText>
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
};
export default ErrorCard;
