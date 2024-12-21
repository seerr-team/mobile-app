import CachedImage, { blurhash } from '@/components/Common/CachedImage';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';

interface CompanyCardProps {
  name: string;
  image: string;
  url: string;
}

const CompanyCard = ({ image, url, name }: CompanyCardProps) => {
  return (
    <Link href={url as any} asChild>
      <Pressable className="h-32 w-56 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 p-8">
        <CachedImage
          type="tmdb"
          src={image}
          alt=""
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          placeholder={{ blurhash, width: '100%', height: '100%' }}
          placeholderContentFit="contain"
        />
      </Pressable>
    </Link>
  );
};

export default CompanyCard;
