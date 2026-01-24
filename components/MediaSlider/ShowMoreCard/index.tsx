import CachedImage from '@/components/Common/CachedImage';
import ThemedText from '@/components/Common/ThemedText';
import getSeerrMessages from '@/utils/getSeerrMessages';
import { ArrowRightCircle } from '@nandorojo/heroicons/24/solid';
import { Link } from 'expo-router';
import { useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';

const messages = getSeerrMessages('components.MediaSlider.ShowMoreCard');

interface ShowMoreCardProps {
  url: string;
  posters: (string | undefined)[];
}

const ShowMoreCard = ({ url, posters }: ShowMoreCardProps) => {
  const intl = useIntl();

  return (
    <Link href={url} asChild>
      <Pressable
        className="relative w-36 gap-2 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 text-white shadow-lg transition-colors focus:border-indigo-500 md:w-44"
        style={{ width: 150, height: 225 }}
      >
        <View className="h-full w-full">
          <View className="z-10 flex h-full flex-1 flex-row flex-wrap items-center justify-center pt-1 opacity-30">
            {posters[0] && (
              <View
                className="mx-1 my-2 overflow-hidden rounded-md"
                style={{ width: '43%', height: '43%' }}
              >
                <CachedImage
                  type="tmdb"
                  src={`https://image.tmdb.org/t/p/w300_and_h450_face${posters[0]}`}
                  alt=""
                  contentFit="cover"
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            )}
            {posters[1] && (
              <View
                className="mx-1 my-2 overflow-hidden rounded-md"
                style={{ width: '43%', height: '43%' }}
              >
                <CachedImage
                  type="tmdb"
                  src={`https://image.tmdb.org/t/p/w300_and_h450_face${posters[1]}`}
                  alt=""
                  contentFit="cover"
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            )}
            {posters[2] && (
              <View
                className="mx-1 my-2 overflow-hidden rounded-md"
                style={{ width: '43%', height: '43%' }}
              >
                <CachedImage
                  type="tmdb"
                  src={`https://image.tmdb.org/t/p/w300_and_h450_face${posters[2]}`}
                  alt=""
                  contentFit="cover"
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            )}
            {posters[3] && (
              <View
                className="mx-1 my-2 overflow-hidden rounded-md"
                style={{ width: '43%', height: '43%' }}
              >
                <CachedImage
                  type="tmdb"
                  src={`https://image.tmdb.org/t/p/w300_and_h450_face${posters[3]}`}
                  alt=""
                  contentFit="cover"
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            )}
          </View>
          <View className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
            <ArrowRightCircle width={56} height={56} color="#ffffff" />
            <ThemedText className="mt-2 font-extrabold">
              {intl.formatMessage(messages.seemore)}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};

export default ShowMoreCard;
