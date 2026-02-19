import useServerUrl from '@/hooks/useServerUrl';
import type { Language } from '@/seerr/server/lib/settings';
import getSeerrMessages from '@/utils/getSeerrMessages';
import globalMessages from '@/utils/globalMessages';
import { XMark } from '@nandorojo/heroicons/24/outline';
import { sortBy } from 'lodash';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import useSWR from 'swr';
import ThemedText from '../Common/ThemedText';

const messages = getSeerrMessages('components.LanguageSelector');

type OptionType = {
  value: string;
  label: string;
  isFixed?: boolean;
};

interface LanguageSelectorProps {
  value?: string;
  setFieldValue: (property: string, value: string) => void;
  serverValue?: string;
  isUserSettings?: boolean;
  isDisabled?: boolean;
}

const LanguageSelector = ({
  value,
  setFieldValue,
  serverValue,
  isUserSettings = false,
  isDisabled,
}: LanguageSelectorProps) => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const { data: languages } = useSWR<Language[]>(
    `${serverUrl}/api/v1/languages`
  );

  const sortedLanguages = useMemo(() => {
    languages?.forEach((language) => {
      language.name = language.name =
        language.name.includes('?') || !language.name
          ? language.english_name
          : language.name;
    });

    return sortBy(languages, 'name');
  }, [intl, languages]);

  const languageName = (languageCode: string) =>
    sortedLanguages?.find((language) => language.iso_639_1 === languageCode)
      ?.name ?? languageCode;

  const options: OptionType[] =
    sortedLanguages?.map((language) => ({
      label: language.name,
      value: language.iso_639_1,
    })) ?? [];

  if (isUserSettings) {
    options.unshift({
      value: 'server',
      label: intl.formatMessage(messages.languageServerDefault, {
        language: serverValue
          ? serverValue
              .split('|')
              .map((value) => languageName(value))
              .reduce((prev, curr) =>
                intl.formatMessage(globalMessages.delimitedlist, {
                  a: prev,
                  b: curr,
                })
              )
          : intl.formatMessage(messages.originalLanguageDefault),
      }),
      isFixed: true,
    });
  }

  options.unshift({
    value: 'all',
    label: intl.formatMessage(messages.originalLanguageDefault),
    isFixed: true,
  });

  return (
    <MultiSelect
      data={options}
      labelField="label"
      valueField="value"
      value={
        (isUserSettings && value === 'all') || (!isUserSettings && !value)
          ? ['all']
          : (value === '' || !value || value === 'server') && isUserSettings
            ? ['server']
            : (
                value
                  ?.split('|')
                  .map((code) => {
                    const matchedLanguage = sortedLanguages?.find(
                      (lang) => lang.iso_639_1 === code
                    );

                    if (!matchedLanguage) {
                      return undefined;
                    }

                    return {
                      label: matchedLanguage.name,
                      value: matchedLanguage.iso_639_1,
                    };
                  })
                  .filter((option) => option !== undefined) as OptionType[]
              ).map((option) => option.value)
      }
      onChange={(value) => {
        if (value.every((v) => v === 'server')) {
          return setFieldValue('originalLanguage', '');
        }

        if (value.every((v) => v === 'all')) {
          return setFieldValue('originalLanguage', isUserSettings ? 'all' : '');
        }

        setFieldValue(
          'originalLanguage',
          value
            .map((lang) => lang)
            .filter((v) => v !== 'all')
            .join('|')
        );
      }}
      disable={isDisabled}
      style={{
        backgroundColor: '#374151',
        borderWidth: 1,
        borderRadius: 6,
        borderColor: '#6b7280',
        paddingLeft: 12,
        paddingRight: 8,
        paddingVertical: 4,
        height: 36,
        marginBottom: 4,
      }}
      placeholderStyle={{
        color: '#9ca3af',
        fontSize: 14,
      }}
      containerStyle={{
        marginTop: 4,
        backgroundColor: '#1f2937',
        borderWidth: 1,
        borderRadius: 6,
        borderColor: '#374151',
      }}
      activeColor="#4f46e5"
      selectedTextStyle={{
        color: '#ffffff',
        fontSize: 12,
        height: 36,
        marginLeft: 12,
        lineHeight: 33,
      }}
      renderItem={(item) => (
        <View className="flex flex-row items-center gap-2 p-2">
          {/* <View className="w-6">
            {value.includes(Number(item.value)) && (
              <Check color="#4ade80" width={20} height={20} />
            )}
          </View> */}
          <ThemedText>{item.label}</ThemedText>
        </View>
      )}
      renderSelectedItem={(item, unSelect) => (
        <Pressable onPress={() => unSelect && unSelect(item)}>
          <View className="flex flex-row items-center gap-2 rounded border border-gray-500 bg-gray-800 px-2 py-1">
            <ThemedText className="text-xs">{item.label}</ThemedText>
            <XMark color="#ffffff" width={15} height={15} />
          </View>
        </Pressable>
      )}
    />
  );
};

export default LanguageSelector;
