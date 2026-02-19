import { useEffect, useState } from 'react';
import { Dimensions, type ScaledSize } from 'react-native';

export default function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    Dimensions.get('window').width < Dimensions.get('window').height
      ? 'portrait'
      : 'landscape'
  );

  useEffect(() => {
    const onChange = ({ window }: { window: ScaledSize }) => {
      setOrientation(window.width < window.height ? 'portrait' : 'landscape');
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => {
      subscription?.remove();
    };
  }, []);

  return orientation;
}
