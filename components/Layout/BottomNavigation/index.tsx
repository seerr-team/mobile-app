import { Clock, Film, Sparkles, Tv } from '@nandorojo/heroicons/24/outline';
import {
  Clock as ClockFilled,
  Film as FilmFilled,
  Sparkles as SparklesFilled,
  Tv as TvFilled,
} from '@nandorojo/heroicons/24/solid';
import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, TVFocusGuideView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tintColor = '#6366f1';
const inactiveColor = '#9ca3af';
const focusColor = '#ffffff';

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
    path: '/',
    icon: Sparkles,
    activeIcon: SparklesFilled,
  },
  {
    path: '/discover_movies',
    icon: Film,
    activeIcon: FilmFilled,
  },
  {
    path: '/discover_tv',
    icon: Tv,
    activeIcon: TvFilled,
  },
  {
    path: '/requests',
    icon: Clock,
    activeIcon: ClockFilled,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [isFocused, setIsFocused] = useState<null | string>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  useEffect(() => {
    if (pathname !== navigationHistory[navigationHistory.length - 1]) {
      setNavigationHistory((prev) => [...prev, pathname]);
    }
  }, [pathname]);

  return (
    <TVFocusGuideView autoFocus>
      <View
        className="flex-row border-t border-gray-600 bg-gray-800"
        style={{ paddingBottom: insets.bottom, height: 56 + insets.bottom }}
      >
        {navigationItems.map((item) => {
          const active = pathname === item.path;
          const IconComponent = active ? item.activeIcon : item.icon;
          const iconColor =
            isFocused === item.path
              ? focusColor
              : active
                ? tintColor
                : inactiveColor;

          return (
            <Pressable
              key={item.path}
              onPress={() => {
                if (pathname !== item.path) {
                  if (router.canDismiss()) {
                    router.dismissTo(item.path);
                  } else {
                    router.push(item.path);
                  }
                }
              }}
              className="flex-1 items-center justify-center"
              onFocus={() => setIsFocused(item.path)}
              onBlur={() => setIsFocused(null)}
            >
              <View className="items-center">
                <IconComponent color={iconColor} width={24} height={24} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </TVFocusGuideView>
  );
}
