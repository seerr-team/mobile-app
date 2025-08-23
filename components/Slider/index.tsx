import TitleCard from '@/components/TitleCard';
import globalMessages from '@/utils/globalMessages';
import { useIntl } from 'react-intl';
import { FlatList, View } from 'react-native';

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
  placeholder = <TitleCard.Placeholder />,
}: SliderProps) => {
  const intl = useIntl();

  return (
    <FlatList
      horizontal
      data={isLoading ? [...Array(10)] : items}
      keyExtractor={(item, index) =>
        isLoading ? `placeholder-${index}` : `${sliderKey}-${index}`
      }
      renderItem={({ item, index }) => (
        <View className="inline-block px-2 align-top">
          {isLoading ? placeholder : item}
        </View>
      )}
      ListEmptyComponent={
        isEmpty ? (
          <View className="mb-16 mt-16 px-2 text-center font-medium text-gray-400">
            {emptyMessage
              ? emptyMessage
              : intl.formatMessage(globalMessages.noresults)}
          </View>
        ) : null
      }
      initialNumToRender={5}
      maxToRenderPerBatch={3}
      windowSize={5}
    />
  );
};

export default Slider;
