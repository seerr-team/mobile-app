import ThemedText from '@/components/Common/ThemedText';
import { View } from 'react-native';

interface HeaderProps {
  extraMargin?: number;
  subtext?: React.ReactNode;
  children: React.ReactNode;
}

const Header = ({ children, extraMargin = 0, subtext }: HeaderProps) => {
  const Component = typeof children === 'string' ? ThemedText : View;
  return (
    <View className="mt-8 md:flex md:items-center md:justify-between">
      <View className={`min-w-0 flex-1 mx-${extraMargin}`}>
        <View
          className="mb-4 truncate text-2xl font-bold leading-7 text-gray-100 sm:overflow-visible sm:text-4xl sm:leading-9 md:mb-0"
          data-testid="page-header"
        >
          <Component className="text-overseerr">{children}</Component>
        </View>
        {subtext && <div className="mt-2 text-gray-400">{subtext}</div>}
      </View>
    </View>
  );
};

export default Header;
