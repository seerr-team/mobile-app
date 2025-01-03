import ThemedText from '@/components/Common/ThemedText';
import { Tag as TagIcon } from '@nandorojo/heroicons/24/outline';
import React from 'react';
import { View } from 'react-native';

type TagProps = {
  children: React.ReactNode;
  iconSvg?: JSX.Element;
};

const Tag = ({ children, iconSvg }: TagProps) => {
  return (
    <View className="inline-flex cursor-pointer flex-row items-center gap-1 rounded-full border border-gray-600 bg-gray-800 px-2 py-1 text-sm text-gray-200 transition hover:bg-gray-700">
      {iconSvg ? (
        React.cloneElement(iconSvg, {
          width: 16,
          height: 16,
        })
      ) : (
        <TagIcon width={16} height={16} color="#e5e7eb" />
      )}
      <ThemedText className="text-gray-200">{children}</ThemedText>
    </View>
  );
};

export default Tag;
