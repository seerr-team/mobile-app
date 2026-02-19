import useServerUrl from '@/hooks/useServerUrl';
import useSettings from '@/hooks/useSettings';
import type { Region } from '@/seerr/server/lib/settings';
import getSeerrMessages from '@/utils/getSeerrMessages';
import '@formatjs/intl-displaynames/polyfill.js';
import { ChevronDown } from '@nandorojo/heroicons/24/solid';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { sortBy } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import useSWR from 'swr';
import ThemedText from '../Common/ThemedText';

const messages = getSeerrMessages('components.RegionSelector');

interface RegionSelectorProps {
  value: string;
  name: string;
  isUserSetting?: boolean;
  disableAll?: boolean;
  watchProviders?: boolean;
  regionType?: 'discover' | 'streaming';
  onChange?: (fieldName: string, region: string) => void;
}

const RegionSelector = ({
  name,
  value,
  isUserSetting = false,
  disableAll = false,
  watchProviders = false,
  regionType = 'discover',
  onChange,
}: RegionSelectorProps) => {
  const serverUrl = useServerUrl();
  const { currentSettings } = useSettings();
  const intl = useIntl();
  const { data: regions } = useSWR<Region[]>(
    watchProviders
      ? `${serverUrl}/api/v1/watchproviders/regions`
      : `${serverUrl}/api/v1/regions`
  );
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const allRegion: Region = useMemo(
    () => ({
      iso_3166_1: 'all',
      english_name: 'All',
    }),
    []
  );

  const sortedRegions = useMemo(() => {
    regions?.forEach((region) => {
      region.name = region.name || region.english_name;
      // region.name = region.name
      //   ? `${getUnicodeFlagIcon(region.iso_3166_1)} ${region.name}`
      //   : `${getUnicodeFlagIcon(region.iso_3166_1)} ${region.english_name}`;
      // intl.formatDisplayName(region.iso_3166_1, {
      //   type: 'region',
      //   fallback: 'none',
      // }) ?? region.english_name;
    });

    return sortBy(regions, 'name');
  }, [intl, regions]);

  const regionName = (regionCode: string) =>
    sortedRegions?.find((region) => region.iso_3166_1 === regionCode)?.name ??
    regionCode;

  const regionValue =
    regionType === 'discover'
      ? currentSettings.discoverRegion
      : currentSettings.streamingRegion;

  useEffect(() => {
    if (regions && value) {
      if (value === 'all') {
        setSelectedRegion(allRegion);
      } else {
        const matchedRegion = regions.find(
          (region) => region.iso_3166_1 === value
        );
        setSelectedRegion(matchedRegion ?? null);
      }
    }
  }, [value, regions, allRegion]);

  useEffect(() => {
    if (onChange && regions) {
      const newValue = selectedRegion ? selectedRegion.iso_3166_1 : '';
      if (newValue !== value) {
        onChange(name, newValue);
      }
    }
  }, [onChange, selectedRegion, name, regions]);

  return (
    <Dropdown
      data={
        // isUserSetting && !disableAll
        //   ? [allRegion, ...(sortedRegions ?? [])]
        //   : sortedRegions
        [
          ...(isUserSetting
            ? [
                {
                  label: intl.formatMessage(messages.regionServerDefault, {
                    region: regionValue
                      ? regionName(regionValue)
                      : intl.formatMessage(messages.regionDefault),
                  }),
                  value: null,
                },
              ]
            : []),
          ...(!disableAll
            ? [
                {
                  label: intl.formatMessage(messages.regionDefault),
                  value: isUserSetting ? 'all' : null,
                },
              ]
            : []),
          ...sortedRegions.map((region) => ({
            label: region.name,
            value: region.iso_3166_1,
          })),
        ].map((item) => ({
          ...item,
          label: item.value
            ? `${getUnicodeFlagIcon(item.value)} ${item.label}`
            : item.value !== 'all' && regionValue
              ? `${getUnicodeFlagIcon(regionValue)} ${item.label}`
              : `${item.label}`,
        }))
      }
      value={value}
      onChange={(item) => {
        console.log('Selected item:', item);
        if (item.value === 'all') {
          setSelectedRegion(allRegion);
        } else {
          const matchedRegion = regions?.find(
            (region) => region.iso_3166_1 === item.value
          );
          setSelectedRegion(matchedRegion ?? null);
        }
      }}
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
        <View
          style={{
            padding: 8,
          }}
        >
          <ThemedText>{item.label}</ThemedText>
        </View>
      )}
      placeholder={
        (regionValue ? getUnicodeFlagIcon(regionValue) + ' ' : '') +
        intl.formatMessage(messages.regionServerDefault, {
          region: regionValue
            ? regionName(regionValue)
            : intl.formatMessage(messages.regionDefault),
        })
      }
      placeholderStyle={{
        color: '#ffffff',
        fontSize: 12,
        height: 36,
        marginLeft: 12,
        lineHeight: 33,
      }}
    />
  );
};

export default RegionSelector;
