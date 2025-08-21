import ThemedText from '@/components/Common/ThemedText';
import { View } from 'react-native';

interface HeaderProps {
  extraMargin?: number;
  subtext?: React.ReactNode;
  children: React.ReactNode;
}

const Header = ({ children, extraMargin = 0, subtext }: HeaderProps) => {
  return (
    <View className="mx-4 mb-4 mt-8">
      {typeof children === 'string' && (
        <ThemedText className=" text-4xl font-bold text-indigo-400">
          {children}
        </ThemedText>
      )}
      {typeof children !== 'string' && <View className="mb-6">{children}</View>}
      {subtext && <View className="my-2">{subtext}</View>}
    </View>
  );
};

export default Header;
