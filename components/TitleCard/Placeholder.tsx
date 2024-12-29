import { View } from 'react-native';

interface PlaceholderProps {
  canExpand?: boolean;
}

const Placeholder = ({ canExpand = false }: PlaceholderProps) => {
  return (
    <View
      className={`relative rounded-xl bg-gray-700 ${canExpand ? 'w-full' : ''}`}
      style={!canExpand ? { width: 150, height: 225 } : {}}
    >
      <View className="w-full" style={{ paddingBottom: '150%' }} />
    </View>
  );
};

export default Placeholder;
