import { Clock, Film, Sparkles, Tv } from '@nandorojo/heroicons/24/outline';
import {
  Clock as ClockFilled,
  Film as FilmFilled,
  Sparkles as SparklesFilled,
  Tv as TvFilled,
} from '@nandorojo/heroicons/24/solid';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

const tintColor = '#6366f1';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        headerShown: false,
        tabBarBackground: () => <View className="border-t border-gray-600" />,
        tabBarStyle: {
          height: 64,
          backgroundColor: '#1f2937',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color }) => (
            <View className="pt-8">
              {color !== tintColor && (
                <Sparkles color={color} width={32} height={32} />
              )}
              {color === tintColor && (
                <SparklesFilled color={color} width={32} height={32} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="discover_movies"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color }) => (
            <View className="pt-8">
              {color !== tintColor && (
                <Film color={color} width={32} height={32} />
              )}
              {color === tintColor && (
                <FilmFilled color={color} width={32} height={32} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="discover_tv"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color }) => (
            <View className="pt-8">
              {color !== tintColor && (
                <Tv color={color} width={32} height={32} />
              )}
              {color === tintColor && (
                <TvFilled color={color} width={32} height={32} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color }) => (
            <View className="pt-8">
              {color !== tintColor && (
                <Clock color={color} width={32} height={32} />
              )}
              {color === tintColor && (
                <ClockFilled color={color} width={32} height={32} />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
