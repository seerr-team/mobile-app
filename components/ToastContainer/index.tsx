import Constants from 'expo-constants';
import { resolveValue, useToaster } from 'react-hot-toast/headless';
import { useWindowDimensions, View } from 'react-native';

export default function ToastContainer() {
  const { toasts, handlers } = useToaster();
  const { width } = useWindowDimensions();
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
      }}
      pointerEvents="box-none"
    >
      {toasts.map((t) => (
        <View
          key={t.id}
          style={{
            position: 'absolute',
            top: handlers.calculateOffset(t, { reverseOrder: false }),
            left: 0,
            right: 0,
            zIndex: t.visible ? 9999 : undefined,
            alignItems: 'center',
          }}
          pointerEvents="box-none"
        >
          <View
            onLayout={(event) =>
              handlers.updateHeight(t.id, event.nativeEvent.layout.height)
            }
            style={{
              margin: Constants.statusBarHeight + 10,
              width: Math.min(width - 40, 384),
            }}
          >
            {resolveValue(t.message, t)}
          </View>
        </View>
      ))}
    </View>
  );
}
