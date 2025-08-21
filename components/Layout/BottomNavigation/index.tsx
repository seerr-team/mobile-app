import { Clock, Film, Sparkles, Tv } from '@nandorojo/heroicons/24/outline';
import {
  Clock as ClockFilled,
  Film as FilmFilled,
  Sparkles as SparklesFilled,
  Tv as TvFilled,
} from '@nandorojo/heroicons/24/solid';
import { router, usePathname } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tintColor = '#6366f1';
const inactiveColor = '#9ca3af';

interface NavigationItem {
  path: string;
  icon: React.ComponentType<{ color: string; width: number; height: number }>;
  activeIcon: React.ComponentType<{
    color: string;
    width: number;
    height: number;
  }>;
}

const navigationItems: NavigationItem[] = [
  {
    path: '/(tabs)/',
    icon: Sparkles,
    activeIcon: SparklesFilled,
  },
  {
    path: '/(tabs)/discover_movies',
    icon: Film,
    activeIcon: FilmFilled,
  },
  {
    path: '/(tabs)/discover_tv',
    icon: Tv,
    activeIcon: TvFilled,
  },
  {
    path: '/(tabs)/requests',
    icon: Clock,
    activeIcon: ClockFilled,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row border-t border-gray-600 bg-gray-800"
      style={{ paddingBottom: insets.bottom, height: 56 + insets.bottom }}
    >
      {navigationItems.map((item) => {
        const active = `/(tabs)${pathname}` === item.path;
        const IconComponent = active ? item.activeIcon : item.icon;
        const iconColor = active ? tintColor : inactiveColor;

        return (
          <TouchableOpacity
            key={item.path}
            onPress={() => {
              if (pathname !== item.path) {
                router.push(item.path);
              }
            }}
            className="flex-1 items-center justify-center"
          >
            <View className="items-center">
              <IconComponent color={iconColor} width={24} height={24} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
