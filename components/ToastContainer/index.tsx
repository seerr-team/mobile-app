import Toast from '@/components/Toast';
import { useToaster } from 'react-hot-toast/headless';
import { View } from 'react-native';

export default function ToastContainer() {
  const { toasts, handlers } = useToaster();
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      {toasts.map((t) => (
        <Toast
          key={t.id}
          t={t}
          updateHeight={(height) => handlers.updateHeight(t.id, height)}
          offset={handlers.calculateOffset(t, {
            reverseOrder: false,
          })}
        />
      ))}
    </View>
  );
}
