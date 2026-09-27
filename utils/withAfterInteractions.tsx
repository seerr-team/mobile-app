import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export function withAfterInteractions(WrappedComponent: React.ComponentType) {
  return function WithAfterInteractions(
    props: React.ComponentProps<typeof WrappedComponent>
  ) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const handle = requestIdleCallback(() => {
        setIsReady(true);
      });
      return () => cancelIdleCallback(handle);
    }, []);

    if (!isReady) {
      return (
        <View className="flex h-full items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
