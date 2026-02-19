import ThemedText from '@/components/Common/ThemedText';
import { ChevronDown } from '@nandorojo/heroicons/24/solid';
import { View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

export interface SimpleSelectProps<T = { label: string; value: string }> {
  data: T[];
  value: T | string | null | undefined;
  onChange: (value: T) => void;
  placeholder?: string;
  renderItem?: (item: T, selected?: boolean) => React.ReactElement | null;
  disabled?: boolean;
}

export default function SimpleSelect<T>({
  data,
  value,
  onChange,
  placeholder,
  renderItem,
  disabled,
}: SimpleSelectProps<T>) {
  return (
    <Dropdown
      data={data}
      value={value}
      onChange={onChange}
      disable={disabled}
      placeholder={placeholder}
      labelField="label"
      valueField="value"
      autoScroll={false}
      renderRightIcon={() => (
        <ChevronDown color="#6b7280" width={20} height={20} />
      )}
      style={{
        backgroundColor: '#374151',
        borderWidth: 1,
        borderRadius: 6,
        borderColor: '#6b7280',
        paddingRight: 8,
      }}
      containerStyle={{
        marginTop: 4,
        backgroundColor: '#1f2937',
        borderWidth: 1,
        borderRadius: 6,
        borderColor: '#6b7280',
      }}
      activeColor="#4f46e5"
      selectedTextStyle={{
        color: '#ffffff',
        fontSize: 12,
        height: 36,
        marginLeft: 12,
        lineHeight: 33,
      }}
      placeholderStyle={{
        color: '#6b7280',
        fontSize: 12,
        height: 36,
        marginLeft: 12,
        lineHeight: 33,
      }}
      renderItem={
        renderItem
          ? renderItem
          : (item) => (
              <View
                style={{
                  padding: 8,
                }}
              >
                <ThemedText>{item.label}</ThemedText>
              </View>
            )
      }
    />
  );
}
