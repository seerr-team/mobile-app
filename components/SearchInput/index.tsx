import getSeerrMessages from '@app/utils/getSeerrMessages';
import { MagnifyingGlass } from '@nandorojo/heroicons/24/solid';
import { router, usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { TextInput, View } from 'react-native';

const messages = getSeerrMessages('components.Layout.SearchInput');

const SearchInput = () => {
  const intl = useIntl();
  const inputRef = useRef<TextInput>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (searchValue !== '') {
      if (pathname === '/search') {
        router.setParams({ query: searchValue });
      } else {
        router.replace({
          pathname: '/search',
          params: { query: searchValue },
        });
      }
    } else {
      inputRef.current?.blur();
    }
  }, [searchValue, pathname]);

  useEffect(() => {
    if (pathname !== '/search') {
      setSearchValue('');
    }
  }, [pathname]);

  return (
    <View
      className={`flex flex-1 flex-row items-center gap-2 rounded-full border bg-gray-900 bg-opacity-80 pl-4 pr-2 hover:border-gray-500 ${isOpen ? 'border-gray-500' : 'border-gray-600'}`}
      focusable={false}
    >
      <View className="pointer-events-none flex justify-center">
        <MagnifyingGlass width={20} height={20} color="#ffffff" />
      </View>
      <TextInput
        ref={inputRef}
        className="block flex-1 py-2 text-lg text-white placeholder:text-lg placeholder:text-gray-300 focus-within:text-gray-200 focus:placeholder:text-gray-400"
        style={{ borderRadius: 24 }}
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
        autoComplete="off"
        value={searchValue}
        onChangeText={(e) => setSearchValue(e)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          if (searchValue === '' && pathname === '/search') {
            setIsOpen(false);
            router.replace('');
          }
        }}
      />
    </View>
  );
};

export default SearchInput;
