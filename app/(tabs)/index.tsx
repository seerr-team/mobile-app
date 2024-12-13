import { StyleSheet, View } from 'react-native';

import Setup from '@/components/Setup';
import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
  return (
    <View className="bg-gray-900">
      <Setup>
        <View style={styles.titleContainer}>
          <ThemedText>Home</ThemedText>
        </View>
      </Setup>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
