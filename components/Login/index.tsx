import { View, Image } from 'react-native';
import ThemedText from '@/components/Common/ThemedText';
import JellyfinLogin from './JellyfinLogin';

export default function Login() {
  return (
    <View className="self-center">
      <View className="px-8">
        <Image
          className="h-64 max-w-full object-cover"
          style={{ resizeMode: 'contain' }}
          source={require('@/assets/images/logo-stacked.png')}
        />
      </View>
      <ThemedText className="mt-12 text-3xl font-bold text-center">Sign in to continue.</ThemedText>
      <JellyfinLogin />
    </View>
  );
}
