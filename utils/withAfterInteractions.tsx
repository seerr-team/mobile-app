import React, { useEffect, useState } from 'react';
import { ActivityIndicator, InteractionManager, View } from 'react-native';

export function withAfterInteractions(WrappedComponent: React.ComponentType) {
  return function WithAfterInteractions(
    props: React.ComponentProps<typeof WrappedComponent>
  ) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        setIsReady(true);
      });
      return () => task.cancel();
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
