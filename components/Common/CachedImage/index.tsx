import useSettings from '@/hooks/useSettings';
import type { RootState } from '@/store';
import { Image, type ImageProps } from 'expo-image';
import { useSelector } from 'react-redux';

export type CachedImageProps = ImageProps & {
  src: string;
  type: 'tmdb' | 'avatar';
};

export const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

/**
 * The CachedImage component should be used wherever
 * we want to offer the option to locally cache images.
 **/
const CachedImage = ({ src, type, ...props }: CachedImageProps) => {
  const serverUrl = useSelector(
    (state: RootState) => state.appSettings.serverUrl
  );
  const { currentSettings } = useSettings();

  let imageUrl: string;

  if (type === 'tmdb') {
    // tmdb stuff
    imageUrl =
      currentSettings.cacheImages && !src.startsWith('/')
        ? src.replace(/^https:\/\/image\.tmdb\.org\//, '/imageproxy/')
        : src;
  } else if (type === 'avatar') {
    // jellyfin avatar (if any)
    imageUrl = src;
  } else {
    return null;
  }

  if (imageUrl.startsWith('/')) {
    imageUrl = `${serverUrl}${imageUrl}`;
  }

  return <Image source={imageUrl} placeholder={{ blurhash }} {...props} />;
};

export default CachedImage;
