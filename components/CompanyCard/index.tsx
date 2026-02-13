import CachedImage from '@/components/Common/CachedImage';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';

interface CompanyCardProps {
  name: string;
  image: string;
  url: string;
}

const CompanyCard = ({ image, url, name }: CompanyCardProps) => {
  return (
    <Link href={url} asChild>
      <Pressable className="h-32 w-56 overflow-hidden rounded-xl border border-gray-700 bg-gray-700 p-8 transition-colors focus:border-indigo-500">
        <CachedImage
          type="tmdb"
          src={image}
          alt=""
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          placeholderContentFit="contain"
        />
      </Pressable>
    </Link>
  );
};

export default CompanyCard;
