import CachedImage from '@/components/Common/CachedImage';
import ThemedText from '@/components/Common/ThemedText';
import { UserCircle } from '@nandorojo/heroicons/24/solid';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

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
    <Link href={`/person/${personId}` as any} asChild>
      <Pressable
        className="flex items-center overflow-hidden rounded-xl border border-gray-700 bg-gray-700"
        style={
          !canExpand ? { width: 150, height: 225 } : { aspectRatio: '2 / 3' }
        }
      >
        <View className="mt-4 flex h-32 w-32 items-center p-2">
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
        <View className="mt-8 flex w-full justify-between p-2">
          <ThemedText className="truncate text-center font-bold">
            {name}
          </ThemedText>
          {subName && (
            <View
              className="overflow-hidden"
              style={{
                overflow: 'hidden',
              }}
            >
              <ThemedText className="whitespace-normal text-center text-sm text-gray-300">
                {subName}
              </ThemedText>
            </View>
          )}
        </View>
      </Pressable>
    </Link>
  );
};

export default PersonCard;
