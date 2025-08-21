import BottomNavigation from '@/components/Layout/BottomNavigation';
import UserDropdown from '@/components/Layout/UserDropdown';
import SearchInput from '@/components/SearchInput';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StackLayout() {
  const insets = useSafeAreaInsets();
  const contentStyle = {
    backgroundColor: '#111827',
    paddingTop: insets.top + 67,
    paddingBottom: 56 + insets.bottom,
  };

  return (
    <View className="flex-1">
      <View
        className="h-18 absolute left-0 right-0 top-0 z-50 flex flex-row items-center gap-4 border-b border-gray-600 bg-gray-900 px-6 pb-2"
        style={{ paddingTop: insets.top + 16 }}
      >
        <SearchInput />
        <UserDropdown />
      </View>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle,
          animation: 'slide_from_right',
          animationDuration: 100,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            contentStyle,
          }}
        />
        <Stack.Screen
          name="discover_movies"
          options={{
            contentStyle,
          }}
        />
        <Stack.Screen
          name="discover_tv"
          options={{
            contentStyle,
          }}
        />
        <Stack.Screen
          name="requests"
          options={{
            contentStyle,
          }}
        />
        <Stack.Screen
          name="search"
          options={{
            contentStyle,
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="discover_trending"
          options={{
            contentStyle,
          }}
        />
        <Stack.Screen
          name="discover_movies/studio/[studioId]"
          options={{
            contentStyle,
          }}
        />
        <Stack.Screen
          name="discover_tv/network/[networkId]"
          options={{
            contentStyle,
          }}
        />
        <Stack.Screen
          name="discover_watchlist"
          options={{
            contentStyle,
          }}
        />
        <Stack.Screen
          name="movie/[movieId]/index"
          options={{
            contentStyle,
          }}
        />
        <Stack.Screen
          name="movie/[movieId]/recommendations"
          options={{
            contentStyle,
          }}
        />
        <Stack.Screen
          name="movie/[movieId]/similar"
          options={{
            contentStyle,
          }}
        />
        <Stack.Screen
          name="tv/[tvId]/index"
          options={{
            contentStyle,
          }}
        />
        <Stack.Screen
          name="tv/[tvId]/recommendations"
          options={{
            contentStyle,
          }}
        />
        <Stack.Screen
          name="tv/[tvId]/similar"
          options={{
            contentStyle,
          }}
        />
        <Stack.Screen
          name="person/[personId]/index"
          options={{
            contentStyle,
          }}
        />
        <Stack.Screen
          name="collection/[collectionId]/index"
          options={{
            contentStyle,
          }}
        />
      </Stack>
      <BottomNavigation />
    </View>
  );
}
