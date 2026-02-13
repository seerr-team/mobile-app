import CachedImage from '@/components/Common/CachedImage';
import ThemedText from '@/components/Common/ThemedText';
import { withProperties } from '@/utils/typeHelpers';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

interface GenreCardProps {
  name: string;
  image: string;
  url: string;
  canExpand?: boolean;
}

const GenreCard = ({ image, url, name, canExpand = false }: GenreCardProps) => {
  return (
    <Link href={url} asChild>
      <Pressable className="h-32 w-56 overflow-hidden rounded-xl border border-gray-700 bg-gray-700 transition-colors focus:border-indigo-500">
        <View className="absolute z-10 flex h-full w-full items-center justify-center">
          <ThemedText className="truncate whitespace-normal text-center text-2xl font-bold text-white">
            {name}
          </ThemedText>
        </View>
        <CachedImage
          type="tmdb"
          src={image}
          alt=""
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          placeholderContentFit="cover"
        />
      </Pressable>
    </Link>
  );
};

const GenreCardPlaceholder = () => {
  return (
    <View
      className={`relative h-32 w-56 rounded-xl bg-gray-700 sm:h-40 sm:w-72`}
    ></View>
  );
};

export default withProperties(GenreCard, { Placeholder: GenreCardPlaceholder });
