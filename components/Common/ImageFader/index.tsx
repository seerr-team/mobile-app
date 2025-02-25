import useServerUrl from '@/hooks/useServerUrl';
import useSettings from '@/hooks/useSettings';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { CrossfadeImage } from 'react-native-crossfade-image';

interface ImageFaderProps {
  backgroundImages: string[];
  rotationSpeed?: number;
  isDarker?: boolean;
  forceOptimize?: boolean;
}

const DEFAULT_ROTATION_SPEED = 6000;

const ImageFader = ({
  backgroundImages,
  rotationSpeed = DEFAULT_ROTATION_SPEED,
  isDarker,
  forceOptimize,
  ...props
}: ImageFaderProps) => {
  const serverUrl = useServerUrl();
  const { currentSettings } = useSettings();
  const [activeIndex, setIndex] = useState(0);

  const getImageUrl = (src: string) => {
    let imageUrl =
      currentSettings.cacheImages && !src.startsWith('/')
        ? src.replace(/^https:\/\/image\.tmdb\.org\//, '/imageproxy/')
        : src;
    if (imageUrl.startsWith('/')) {
      imageUrl = `${serverUrl}${imageUrl}`;
    }
    return { uri: imageUrl };
  };

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((ai) => (ai + 1) % backgroundImages.length),
      rotationSpeed
    );

    return () => {
      clearInterval(interval);
    };
  }, [backgroundImages, rotationSpeed]);

  let gradient: [string, string] = [
    'rgba(45, 55, 72, 0.47)',
    'rgba(26, 32, 46, 1)',
  ];

  if (isDarker) {
    gradient = ['rgba(17, 24, 39, 0.47)', 'rgba(17, 24, 39, 1)'];
  }

  if (backgroundImages.length === 0) {
    return null;
  }

  return (
    <View
      className={`absolute-top-shift absolute inset-0 h-screen w-screen`}
      {...props}
    >
      <CrossfadeImage
        source={getImageUrl(backgroundImages[activeIndex])}
        className="absolute inset-0 h-full w-full"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={gradient}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />
    </View>
  );
};

export default ImageFader;
