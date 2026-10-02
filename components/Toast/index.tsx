import ThemedText from '@app/components/Common/ThemedText';
import {
  CheckCircle,
  ExclamationCircle,
  ExclamationTriangle,
  InformationCircle,
} from '@nandorojo/heroicons/24/outline';
import { XMark } from '@nandorojo/heroicons/24/solid';
import { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, View } from 'react-native';

export interface ToastProps {
  appearance?: 'success' | 'error' | 'info' | 'warning';
  children: React.ReactNode;
  onDismiss: () => void;
  transitionState: 'entering' | 'entered' | 'exiting' | 'exited';
}

const Toast = ({
  appearance,
  children,
  onDismiss,
  transitionState,
}: ToastProps) => {
  const show = transitionState === 'entered';
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(0.95));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: show ? 1 : 0,
      duration: show ? 300 : 150,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, show]);

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: show ? 1 : 0.9,
      duration: show ? 300 : 150,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, show]);

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
      className="w-full rounded-lg border border-gray-500 bg-gray-800 shadow-lg"
    >
      <View className="flex flex-row items-start p-4">
        <View className="flex-shrink-0">
          {appearance === 'success' && (
            <CheckCircle width={24} height={24} color="#4ade80" />
          )}
          {appearance === 'error' && (
            <ExclamationCircle width={24} height={24} color="#ef4444" />
          )}
          {appearance === 'info' && (
            <InformationCircle width={24} height={24} color="#6366f1" />
          )}
          {appearance === 'warning' && (
            <ExclamationTriangle width={24} height={24} color="#fb923c" />
          )}
        </View>
        <View className="ml-3 flex-1">
          {typeof children === 'string' ? (
            <ThemedText>{children}</ThemedText>
          ) : (
            children
          )}
        </View>
        {/* Hidden on TV so remote focus never lands on a transient toast */}
        {!Platform.isTV && (
          <Pressable
            onPress={() => onDismiss()}
            className="ml-4 flex flex-shrink-0"
            hitSlop={8}
          >
            <XMark width={20} height={20} color="#9ca3af" />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

export default Toast;
