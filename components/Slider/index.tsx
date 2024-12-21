import { Placeholder as TitleCardPlaceholder } from '@/components/TitleCard';
import globalMessages from '@/utils/globalMessages';
import { useIntl } from 'react-intl';
import { ScrollView, View } from 'react-native';

interface SliderProps {
  sliderKey: string;
  items?: JSX.Element[];
  isLoading: boolean;
  isEmpty?: boolean;
  emptyMessage?: React.ReactNode;
  placeholder?: React.ReactNode;
}

const Slider = ({
  sliderKey,
  items,
  isLoading,
  isEmpty = false,
  emptyMessage,
  placeholder = <TitleCardPlaceholder />,
}: SliderProps) => {
  const intl = useIntl();

  return (
    <ScrollView horizontal className="mx-2 flex flex-row">
      {isLoading &&
        [...Array(10)].map((_item, i) => (
          <View
            key={`placeholder-${i}`}
            className="inline-block px-2 align-top"
          >
            {placeholder}
          </View>
        ))}
      {items?.map((item, index) => (
        <View
          key={`${sliderKey}-${index}`}
          className="inline-block px-2 align-top"
        >
          {item}
        </View>
      ))}
      {isEmpty && (
        <View className="mb-16 mt-16 px-2 text-center font-medium text-gray-400">
          {emptyMessage
            ? emptyMessage
            : intl.formatMessage(globalMessages.noresults)}
        </View>
      )}
    </ScrollView>
  );
};

export default Slider;
