import CachedImage from '@/components/Common/CachedImage';
import { UserCircle } from '@nandorojo/heroicons/24/solid';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';
import ThemedText from '../Common/ThemedText';

interface PersonCardProps {
  personId: number;
  name: string;
  subName?: string;
  profilePath?: string;
  canExpand?: boolean;
}

const PersonCard = ({
  personId,
  name,
  subName,
  profilePath,
  canExpand = false,
}: PersonCardProps) => {
  return (
    <Link
      href={`/person/${personId}` as any}
      asChild
    >
      <Pressable
        className="overflow-hidden rounded-xl border border-gray-700 bg-gray-700 flex items-center"
        style={!canExpand ? { width: 150, height: 225 } : { aspectRatio: '2 / 3' }}
      >
        <View className="flex items-center mt-4 p-2 w-32 h-32">
          {profilePath ? (
            <View className="w-full overflow-hidden rounded-full border border-gray-700">
              <CachedImage
                type="tmdb"
                src={`https://image.tmdb.org/t/p/w600_and_h900_bestv2${profilePath}`}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </View>
          ) : (
            <UserCircle width={128} height={128} color="#ffffff" />
          )}
        </View>
        <View className="flex w-full justify-between mt-8 p-2">
          <ThemedText className="truncate text-center font-bold">{name}</ThemedText>
          {subName && (
            <View
              className="overflow-hidden"
              style={{
                overflow: 'hidden',
              }}
            >
              <ThemedText className="whitespace-normal text-center text-sm text-gray-300">{subName}</ThemedText>
            </View>
          )}
        </View>
      </Pressable>
    </Link>
  );
};

export default PersonCard;
