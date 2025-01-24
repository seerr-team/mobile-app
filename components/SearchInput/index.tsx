import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { MagnifyingGlass } from '@nandorojo/heroicons/24/solid';
import type { Dispatch, SetStateAction } from 'react';
import { useIntl } from 'react-intl';
import { TextInput, View } from 'react-native';

const messages = getJellyseerrMessages('components.Layout.SearchInput');

export interface SearchInputProps {
  searchValue: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setSearchValue: Dispatch<SetStateAction<string>>;
  clear: () => void;
}

const SearchInput = ({
  searchValue,
  setSearchValue,
  isOpen,
  setIsOpen,
  clear,
}: SearchInputProps) => {
  const intl = useIntl();
  return (
    <View
      className={`flex flex-1 flex-row items-center gap-2 rounded-full border bg-gray-900 bg-opacity-80 pl-4 pr-2 hover:border-gray-500 ${isOpen ? 'border-gray-500' : 'border-gray-600'}`}
    >
      <View className="pointer-events-none flex justify-center">
        <MagnifyingGlass width={20} height={20} color="#ffffff" />
      </View>
      <TextInput
        className="block h-12 flex-1 py-2 text-lg text-white placeholder:text-lg placeholder:text-gray-300 focus-within:text-gray-200 focus:placeholder:text-gray-400"
        style={{ borderRadius: 24 }}
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
        autoComplete="off"
        value={searchValue}
        onChangeText={(e) => setSearchValue(e)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          if (searchValue === '') {
            setIsOpen(false);
          }
        }}
      />
      {/* {searchValue.length > 0 && (
        <Button
          forceClassName="absolute inset-y-0 right-2 m-auto h-7 w-7 border-none p-1 text-gray-400 outline-none transition hover:text-white focus:border-none focus:outline-none"
          onClick={() => clear()}
        >
          <XCircle width={20} height={20} />
        </Button>
      )} */}
    </View>
  );
};

export default SearchInput;
