import Discover from '@/components/Discover';
import { ScrollView } from 'react-native-gesture-handler';

export default function Home() {
  return (
    <ScrollView className="-mt-4 h-screen">
      <Discover />
    </ScrollView>
  );
}
