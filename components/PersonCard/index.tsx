import CachedImage from '@/components/Common/CachedImage';
import { UserCircle } from '@nandorojo/heroicons/24/outline';
import { Link } from 'expo-router';
import { View } from 'react-native';
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
      className={canExpand ? 'w-full' : 'w-36 sm:w-36 md:w-44'}
      role="link"
      tabIndex={0}
    >
      <View
        className={`relative ${
          canExpand ? 'w-full' : 'w-36 sm:w-36 md:w-44'
        } scale-100 transform-gpu cursor-pointer rounded-xl bg-gray-800 text-white shadow ring-1 ring-gray-700 transition duration-150 ease-in-out`}
      >
        <View style={{ paddingBottom: '150%' }}>
          <View className="absolute inset-0 flex h-full w-full flex-col items-center p-2">
            <View className="relative mb-4 mt-2 flex h-1/2 w-full justify-center">
              {profilePath ? (
                <View className="relative h-full w-3/4 overflow-hidden rounded-full ring-1 ring-gray-700">
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
                <UserCircle className="h-full" />
              )}
            </View>
            <View className="w-full truncate text-center font-bold">
              <ThemedText>{name}</ThemedText>
            </View>
            {subName && (
              <View
                className="overflow-hidden whitespace-normal text-center text-sm text-gray-300"
                style={{
                  overflow: 'hidden',
                }}
              >
                <ThemedText>{subName}</ThemedText>
              </View>
            )}
            <View
              className={`absolute bottom-0 left-0 right-0 h-12 rounded-b-xl bg-gradient-to-t from-gray-900`}
            />
          </View>
        </View>
      </View>
    </Link>
  );
};

export default PersonCard;
