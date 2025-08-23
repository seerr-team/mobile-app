import ThemedText from '@/components/Common/ThemedText';
import {
  CheckCircle,
  ExclamationCircle,
  InformationCircle,
} from '@nandorojo/heroicons/24/outline';
import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';
import { type Toast as RHToast } from 'react-hot-toast/headless';
import { Animated, useWindowDimensions, View } from 'react-native';

export default function Toast({
  t,
  updateHeight,
  offset,
}: {
  t: RHToast;
  updateHeight: (height: number) => void;
  offset: number;
}) {
  const { width } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: t.visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, t.visible]);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: t.visible ? 1 : 0.8,
      speed: 10,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, t.visible]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: offset,
        left: 0,
        right: 0,
        zIndex: t.visible ? 9999 : undefined,
        alignItems: 'center',
        opacity: fadeAnim,
        transform: [
          {
            scale: scaleAnim,
          },
        ],
      }}
    >
      <View
        onLayout={(event) => updateHeight(event.nativeEvent.layout.height)}
        style={{
          margin: Constants.statusBarHeight + 10,
          width: Math.min(width - 40, 384),
        }}
        className="flex flex-row gap-2 rounded-lg border border-gray-500 bg-gray-800 p-4"
        key={t.id}
      >
        {t.icon ? (
          <ThemedText>{t.icon} </ThemedText>
        ) : (
          <>
            {t.type === 'success' && (
              <CheckCircle width={24} height={24} color="#4ade80" />
            )}
            {t.type === 'error' && (
              <ExclamationCircle width={24} height={24} color="#ef4444" />
            )}
            {t.type === 'blank' && (
              <InformationCircle width={24} height={24} color="#6366f1" />
            )}
            {/* {t.type === 'warning' && (
            <ExclamationTriangleIcon className="h-6 w-6 text-orange-400" />
          )} */}
          </>
        )}
        <ThemedText>
          {typeof t.message === 'function' ? t.message(t) : t.message}
        </ThemedText>
      </View>
    </Animated.View>
  );
}
