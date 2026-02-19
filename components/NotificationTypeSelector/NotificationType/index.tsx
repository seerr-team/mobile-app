import ThemedText from '@/components/Common/ThemedText';
import type { NotificationItem } from '@/components/NotificationTypeSelector';
import { hasNotificationType } from '@/components/NotificationTypeSelector';
import Checkbox from 'expo-checkbox';
import { useState } from 'react';
import { View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

interface NotificationTypeProps {
  option: NotificationItem;
  currentTypes: number;
  parent?: NotificationItem;
  onUpdate: (newTypes: number) => void;
}

const NotificationType = ({
  option,
  currentTypes,
  onUpdate,
  parent,
}: NotificationTypeProps) => {
  const [checkboxFocused, setCheckboxFocused] = useState(false);
  const checkboxChecked =
    hasNotificationType(option.value, currentTypes) ||
    (!!parent?.value && hasNotificationType(parent.value, currentTypes));
  return (
    <View>
      <View
        className={`flex flex-row items-start ${
          !!parent?.value && hasNotificationType(parent.value, currentTypes)
            ? 'opacity-50'
            : ''
        }`}
      >
        <View className="mt-2 flex h-5 flex-row items-center">
          <Checkbox
            value={checkboxChecked}
            onFocus={() => setCheckboxFocused(true)}
            onBlur={() => setCheckboxFocused(false)}
            disabled={
              !!parent?.value && hasNotificationType(parent.value, currentTypes)
            }
            onValueChange={() => {
              onUpdate(
                hasNotificationType(option.value, currentTypes)
                  ? currentTypes - option.value
                  : currentTypes + option.value
              );
            }}
            style={
              checkboxFocused ? { borderColor: '#4f46e5', borderWidth: 2 } : {}
            }
            color={
              checkboxFocused
                ? '#6366f1'
                : checkboxChecked
                  ? '#4f46e5'
                  : '#ffffff'
            }
          />
        </View>
        <Pressable
          onPress={() => {
            onUpdate(
              hasNotificationType(option.value, currentTypes)
                ? currentTypes - option.value
                : currentTypes + option.value
            );
          }}
        >
          <View className="ml-3 block text-sm leading-6">
            <View className="flex flex-col">
              <ThemedText className="font-medium text-white">
                {option.name}
              </ThemedText>
              <ThemedText className="font-normal text-gray-400">
                {option.description}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      </View>
      {(option.children ?? []).map((child) => (
        <View key={`notification-type-child-${child.id}`} className="mt-4 pl-6">
          <NotificationType
            option={child}
            currentTypes={currentTypes}
            onUpdate={(newTypes) => onUpdate(newTypes)}
            parent={option}
          />
        </View>
      ))}
    </View>
  );
};

export default NotificationType;
