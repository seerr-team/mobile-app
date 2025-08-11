/* eslint-disable react-hooks/exhaustive-deps */
import CachedImage from '@/components/Common/CachedImage';
import { Listbox } from '@/components/Common/Listbox';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import type { User } from '@/hooks/useUser';
import { Permission, useUser } from '@/hooks/useUser';
import type {
  ServiceCommonServer,
  ServiceCommonServerWithDetails,
} from '@/jellyseerr/server/interfaces/api/serviceInterfaces';
import type { UserResultsResponse } from '@/jellyseerr/server/interfaces/api/userInterfaces';
import { hasPermission } from '@/jellyseerr/server/lib/permissions';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import globalMessages from '@/utils/globalMessages';
import { formatBytes } from '@/utils/numberHelpers';
import { Check, ChevronDown } from '@nandorojo/heroicons/24/solid';
import { Picker } from '@react-native-picker/picker';
import { isEqual } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import useSWR from 'swr';

const messages = getJellyseerrMessages(
  'components.RequestModal.AdvancedRequester'
);

export type RequestOverrides = {
  server?: number;
  profile?: number;
  folder?: string;
  tags?: number[];
  language?: number;
  user?: User;
};

interface AdvancedRequesterProps {
  type: 'movie' | 'tv';
  is4k: boolean;
  isAnime?: boolean;
  defaultOverrides?: RequestOverrides;
  requestUser?: User;
  onChange: (overrides: RequestOverrides) => void;
}

const AdvancedRequester = ({
  type,
  is4k = false,
  isAnime = false,
  defaultOverrides,
  requestUser,
  onChange,
}: AdvancedRequesterProps) => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const { user: currentUser, hasPermission: currentHasPermission } = useUser();
  const { data, error } = useSWR<ServiceCommonServer[]>(
    `${serverUrl}/api/v1/service/${type === 'movie' ? 'radarr' : 'sonarr'}`,
    {
      refreshInterval: 0,
      refreshWhenHidden: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  );
  const [selectedServer, setSelectedServer] = useState<number | null>(
    defaultOverrides?.server !== undefined && defaultOverrides?.server >= 0
      ? defaultOverrides?.server
      : null
  );
  const [selectedProfile, setSelectedProfile] = useState<number>(
    defaultOverrides?.profile ?? -1
  );
  const [selectedFolder, setSelectedFolder] = useState<string>(
    defaultOverrides?.folder ?? ''
  );

  const [selectedLanguage, setSelectedLanguage] = useState<number>(
    defaultOverrides?.language ?? -1
  );

  const [selectedTags, setSelectedTags] = useState<number[]>(
    defaultOverrides?.tags ?? []
  );

  const { data: serverData, isValidating } =
    useSWR<ServiceCommonServerWithDetails>(
      selectedServer !== null
        ? `${serverUrl}/api/v1/service/${
            type === 'movie' ? 'radarr' : 'sonarr'
          }/${selectedServer}`
        : null,
      {
        refreshInterval: 0,
        refreshWhenHidden: false,
        revalidateOnFocus: false,
      }
    );

  const [selectedUser, setSelectedUser] = useState<User | null>(
    requestUser ?? null
  );

  const { data: userData } = useSWR<UserResultsResponse>(
    currentHasPermission([Permission.MANAGE_REQUESTS, Permission.MANAGE_USERS])
      ? `${serverUrl}/api/v1/user?take=1000&sort=displayname`
      : null
  );
  const filteredUserData = useMemo(
    () =>
      userData?.results.filter((user) =>
        hasPermission(
          is4k
            ? [
                Permission.REQUEST_4K,
                type === 'movie'
                  ? Permission.REQUEST_4K_MOVIE
                  : Permission.REQUEST_4K_TV,
              ]
            : [
                Permission.REQUEST,
                type === 'movie'
                  ? Permission.REQUEST_MOVIE
                  : Permission.REQUEST_TV,
              ],
          user.permissions,
          { type: 'or' }
        )
      ),
    [userData?.results]
  );

  useEffect(() => {
    if (filteredUserData && !requestUser) {
      setSelectedUser(
        filteredUserData.find((u) => u.id === currentUser?.id) ?? null
      );
    }
  }, [filteredUserData]);

  useEffect(() => {
    let defaultServer = data?.find(
      (server) => server.isDefault && is4k === server.is4k
    );

    if (!defaultServer && (data ?? []).length > 0) {
      defaultServer = data?.[0];
    }

    if (
      defaultServer &&
      defaultServer.id !== selectedServer &&
      (!defaultOverrides || defaultOverrides.server === null)
    ) {
      setSelectedServer(defaultServer.id);
    }
  }, [data]);

  useEffect(() => {
    if (serverData) {
      const defaultProfile = serverData.profiles.find(
        (profile) =>
          profile.id ===
          (isAnime && serverData.server.activeAnimeProfileId
            ? serverData.server.activeAnimeProfileId
            : serverData.server.activeProfileId)
      );
      const defaultFolder = serverData.rootFolders.find(
        (folder) =>
          folder.path ===
          (isAnime && serverData.server.activeAnimeDirectory
            ? serverData.server.activeAnimeDirectory
            : serverData.server.activeDirectory)
      );
      const defaultLanguage = serverData.languageProfiles?.find(
        (language) =>
          language.id ===
          (isAnime && serverData.server.activeAnimeLanguageProfileId
            ? serverData.server.activeAnimeLanguageProfileId
            : serverData.server.activeLanguageProfileId)
      );
      const defaultTags = isAnime
        ? serverData.server.activeAnimeTags
        : serverData.server.activeTags;

      const applyOverrides =
        defaultOverrides &&
        ((defaultOverrides.server === null && serverData.server.isDefault) ||
          defaultOverrides.server === serverData.server.id);

      if (
        defaultProfile &&
        defaultProfile.id !== selectedProfile &&
        (!applyOverrides || defaultOverrides.profile === null)
      ) {
        setSelectedProfile(defaultProfile.id);
      }

      if (
        defaultFolder &&
        defaultFolder.path !== selectedFolder &&
        (!applyOverrides || !defaultOverrides.folder)
      ) {
        setSelectedFolder(defaultFolder.path ?? '');
      }

      if (
        defaultLanguage &&
        defaultLanguage.id !== selectedLanguage &&
        (!applyOverrides || defaultOverrides.language === null)
      ) {
        setSelectedLanguage(defaultLanguage.id);
      }

      if (
        defaultTags &&
        !isEqual(defaultTags, selectedTags) &&
        (!applyOverrides || defaultOverrides.tags === null)
      ) {
        setSelectedTags(defaultTags);
      }
    }
  }, [serverData]);

  useEffect(() => {
    if (defaultOverrides && defaultOverrides.server != null) {
      setSelectedServer(defaultOverrides.server);
    }

    if (defaultOverrides && defaultOverrides.profile != null) {
      setSelectedProfile(defaultOverrides.profile);
    }

    if (defaultOverrides && defaultOverrides.folder) {
      setSelectedFolder(defaultOverrides.folder);
    }

    if (defaultOverrides && defaultOverrides.language != null) {
      setSelectedLanguage(defaultOverrides.language);
    }

    if (defaultOverrides && defaultOverrides.tags != null) {
      setSelectedTags(defaultOverrides.tags);
    }
  }, [
    defaultOverrides?.server,
    defaultOverrides?.folder,
    defaultOverrides?.profile,
    defaultOverrides?.language,
    defaultOverrides?.tags,
  ]);

  useEffect(() => {
    if (selectedServer !== null || selectedUser) {
      onChange({
        folder: selectedFolder !== '' ? selectedFolder : undefined,
        profile: selectedProfile !== -1 ? selectedProfile : undefined,
        server: selectedServer ?? undefined,
        user: selectedUser ?? undefined,
        language: selectedLanguage !== -1 ? selectedLanguage : undefined,
        tags: selectedTags,
      });
    }
  }, [
    selectedFolder,
    selectedServer,
    selectedProfile,
    selectedUser,
    selectedLanguage,
    selectedTags,
  ]);

  if (!data && !error) {
    return (
      <View className="mb-2 w-full">
        <LoadingSpinner size={16} />
      </View>
    );
  }

  if (
    (!data ||
      selectedServer === null ||
      (data.filter((server) => server.is4k === is4k).length < 2 &&
        (!serverData ||
          (serverData.profiles.length < 2 &&
            serverData.rootFolders.length < 2 &&
            (serverData.languageProfiles ?? []).length < 2 &&
            !serverData.tags?.length)))) &&
    (!selectedUser || (filteredUserData ?? []).length < 2)
  ) {
    return null;
  }

  return (
    <>
      <ThemedText className="mb-2 mt-4 flex items-center text-lg font-semibold">
        {intl.formatMessage(messages.advancedoptions)}
      </ThemedText>
      <View className="rounded-md">
        {!!data && selectedServer !== null && (
          <View className="flex flex-col md:flex-row">
            {data.filter((server) => server.is4k === is4k).length > 1 && (
              <View className="mb-3 w-full flex-shrink-0 flex-grow last:pr-0 md:w-1/4 md:pr-4">
                <ThemedText className="mb-1 block text-sm font-bold leading-5 text-gray-400">
                  {intl.formatMessage(messages.destinationserver)}
                </ThemedText>
                <Picker
                  selectedValue={selectedServer}
                  onValueChange={(v) => setSelectedServer(v)}
                  className="border-gray-700 bg-gray-800"
                >
                  {data
                    .filter((server) => server.is4k === is4k)
                    .map((server) => (
                      <Picker.Item
                        key={`server-list-${server.id}`}
                        label={
                          server.isDefault
                            ? intl.formatMessage(messages.default, {
                                name: server.name,
                              })
                            : server.name
                        }
                        value={server.id}
                      />
                    ))}
                </Picker>
              </View>
            )}
            {(isValidating ||
              !serverData ||
              serverData.profiles.length > 1) && (
              <View className="mb-3 w-full flex-shrink-0 flex-grow last:pr-0 md:w-1/4 md:pr-4">
                <ThemedText className="mb-1 block text-sm font-bold leading-5 text-gray-400">
                  {intl.formatMessage(messages.qualityprofile)}
                </ThemedText>
                <View className="rounded border border-gray-700 bg-gray-800">
                  <Picker
                    selectedValue={selectedProfile}
                    onValueChange={(v) => setSelectedProfile(v)}
                    enabled={!(isValidating || !serverData)}
                    style={{ color: 'white' }}
                    dropdownIconColor="white"
                  >
                    {(isValidating || !serverData) && (
                      <Picker.Item
                        label={intl.formatMessage(globalMessages.loading)}
                        value=""
                      />
                    )}
                    {!isValidating &&
                      serverData &&
                      serverData.profiles.map((profile) => (
                        <Picker.Item
                          key={`profile-list${profile.id}`}
                          label={
                            isAnime &&
                            serverData.server.activeAnimeProfileId ===
                              profile.id
                              ? intl.formatMessage(messages.default, {
                                  name: profile.name,
                                })
                              : !isAnime &&
                                  serverData.server.activeProfileId ===
                                    profile.id
                                ? intl.formatMessage(messages.default, {
                                    name: profile.name,
                                  })
                                : profile.name
                          }
                          value={profile.id}
                        />
                      ))}
                  </Picker>
                </View>
              </View>
            )}
            {(isValidating ||
              !serverData ||
              serverData.rootFolders.length > 1) && (
              <View className="mb-3 w-full flex-shrink-0 flex-grow last:pr-0 md:w-1/4 md:pr-4">
                <ThemedText className="mb-1 block text-sm font-bold leading-5 text-gray-400">
                  {intl.formatMessage(messages.rootfolder)}
                </ThemedText>
                <View className="rounded border border-gray-700 bg-gray-800">
                  <Picker
                    selectedValue={selectedFolder}
                    onValueChange={(v) => setSelectedFolder(v)}
                    className="border-gray-700 bg-gray-800"
                    style={{ color: 'white' }}
                    enabled={!(isValidating || !serverData)}
                  >
                    {(isValidating || !serverData) && (
                      <Picker.Item
                        label={intl.formatMessage(globalMessages.loading)}
                        value=""
                      />
                    )}
                    {!isValidating &&
                      serverData &&
                      serverData.rootFolders.map((folder) => (
                        <Picker.Item
                          key={`folder-list${folder.id}`}
                          label={
                            isAnime &&
                            serverData.server.activeAnimeDirectory ===
                              folder.path
                              ? intl.formatMessage(messages.default, {
                                  name: intl.formatMessage(messages.folder, {
                                    path: folder.path,
                                    space: formatBytes(folder.freeSpace ?? 0),
                                  }),
                                })
                              : !isAnime &&
                                  serverData.server.activeDirectory ===
                                    folder.path
                                ? intl.formatMessage(messages.default, {
                                    name: intl.formatMessage(messages.folder, {
                                      path: folder.path,
                                      space: formatBytes(folder.freeSpace ?? 0),
                                    }),
                                  })
                                : intl.formatMessage(messages.folder, {
                                    path: folder.path,
                                    space: formatBytes(folder.freeSpace ?? 0),
                                  })
                          }
                          value={folder.path}
                        />
                      ))}
                  </Picker>
                </View>
              </View>
            )}
            {type === 'tv' &&
              (isValidating ||
                !serverData ||
                (serverData.languageProfiles ?? []).length > 1) && (
                <View className="mb-3 w-full flex-shrink-0 flex-grow last:pr-0 md:w-1/4 md:pr-4">
                  <ThemedText className="mb-1 block text-sm font-bold leading-5 text-gray-400">
                    {intl.formatMessage(messages.languageprofile)}
                  </ThemedText>
                  <View className="rounded border border-gray-700 bg-gray-800">
                    <Picker
                      selectedValue={selectedLanguage}
                      onValueChange={(v) => setSelectedLanguage(v)}
                      className="border-gray-700 bg-gray-800"
                      style={{ color: 'white' }}
                      enabled={!(isValidating || !serverData)}
                    >
                      {(isValidating || !serverData) && (
                        <Picker.Item
                          label={intl.formatMessage(globalMessages.loading)}
                          value=""
                        />
                      )}
                      {!isValidating &&
                        serverData &&
                        serverData.languageProfiles?.map((language) => (
                          <Picker.Item
                            key={`folder-list${language.id}`}
                            label={
                              isAnime &&
                              serverData.server.activeAnimeLanguageProfileId ===
                                language.id
                                ? intl.formatMessage(messages.default, {
                                    name: language.name,
                                  })
                                : !isAnime &&
                                    serverData.server
                                      .activeLanguageProfileId === language.id
                                  ? intl.formatMessage(messages.default, {
                                      name: language.name,
                                    })
                                  : language.name
                            }
                            value={language.id}
                          />
                        ))}
                    </Picker>
                  </View>
                </View>
              )}
          </View>
        )}
        {/* {selectedServer !== null &&
          (isValidating || !serverData || !!serverData?.tags?.length) && (
            <View className="mb-2">
              <ThemedText className="mb-1 block text-sm font-bold leading-5 text-gray-400">
                {intl.formatMessage(messages.tags)}
              </ThemedText>
              <Select<OptionType, true>
                name="tags"
                options={(serverData?.tags ?? []).map((tag) => ({
                  label: tag.label,
                  value: tag.id,
                }))}
                isMulti
                isDisabled={isValidating || !serverData}
                placeholder={
                  isValidating || !serverData
                    ? intl.formatMessage(globalMessages.loading)
                    : intl.formatMessage(messages.selecttags)
                }
                className="react-select-container react-select-container-dark"
                classNamePrefix="react-select"
                value={
                  selectedTags
                    .map((tagId) => {
                      const foundTag = serverData?.tags.find(
                        (tag) => tag.id === tagId
                      );

                      if (!foundTag) {
                        return undefined;
                      }

                      return {
                        value: foundTag.id,
                        label: foundTag.label,
                      };
                    })
                    .filter((option) => option !== undefined) as OptionType[]
                }
                onChange={(value) => {
                  setSelectedTags(value.map((option) => option.value));
                }}
                noOptionsMessage={() =>
                  intl.formatMessage(messages.notagoptions)
                }
              />
            </View>
          )} */}
        {currentHasPermission([
          Permission.MANAGE_REQUESTS,
          Permission.MANAGE_USERS,
        ]) &&
          selectedUser &&
          (filteredUserData ?? []).length > 1 && (
            <Listbox
              value={selectedUser}
              onChange={(value) => setSelectedUser(value)}
            >
              {({ open }) => (
                <>
                  <ThemedText className="mb-1 block text-sm font-bold leading-5 text-gray-400">
                    {intl.formatMessage(messages.requestas)}
                  </ThemedText>
                  <View className="relative w-full">
                    <Listbox.Button className="focus:shadow-outline-blue relative w-full cursor-default rounded-md border border-gray-700 bg-gray-800 py-0.5 pl-2 text-left text-white transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5">
                      <View className="relative">
                        <View
                          className="group mb-3 flex translate-y-1.5 flex-row items-center gap-1.5 truncate pl-1 pr-10"
                          pointerEvents="none"
                        >
                          <View className="avatar-sm overflow-hidden rounded-full">
                            <CachedImage
                              type="avatar"
                              src={selectedUser.avatar}
                              alt=""
                              style={{ width: 20, height: 20 }}
                            />
                          </View>
                          <ThemedText className="truncate font-bold text-gray-300 group-hover:underline">
                            {selectedUser.displayName}
                          </ThemedText>
                          {selectedUser.displayName.toLowerCase() !==
                            selectedUser.email && (
                            <ThemedText className="truncate text-gray-400">
                              ({selectedUser.email})
                            </ThemedText>
                          )}
                        </View>
                        <View className="absolute inset-y-0 right-0 flex flex-row items-center pr-2">
                          <ChevronDown color="#6b7280" width={20} height={20} />
                        </View>
                      </View>
                    </Listbox.Button>

                    <Listbox.Options>
                      {filteredUserData?.map((user) => (
                        <Listbox.Option key={user.id} value={user}>
                          {({ selected, active }) => (
                            <View
                              className={`${
                                active
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-gray-300'
                              } relative cursor-default select-none py-2 pl-8 pr-4`}
                              pointerEvents="none"
                            >
                              <View className="group flex flex-row items-center gap-1.5 truncate pl-1">
                                <View className="avatar-sm overflow-hidden rounded-full">
                                  <CachedImage
                                    type="avatar"
                                    src={user.avatar}
                                    alt=""
                                    style={{ width: 20, height: 20 }}
                                  />
                                </View>
                                <ThemedText className="truncate font-bold text-gray-300 group-hover:underline">
                                  {user.displayName}
                                </ThemedText>
                                {user.displayName.toLowerCase() !==
                                  user.email && (
                                  <ThemedText className="ml-1 truncate text-gray-400">
                                    ({user.email})
                                  </ThemedText>
                                )}
                              </View>
                              {selected && (
                                <View className="absolute inset-y-0 left-0 flex flex-row items-center pl-1.5">
                                  <Check
                                    width={20}
                                    height={20}
                                    color={active ? '#ffffff' : '#4f46e5'}
                                  />
                                </View>
                              )}
                            </View>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </View>
                </>
              )}
            </Listbox>
          )}
        {isAnime && (
          <ThemedText className="mt-4 italic">
            {intl.formatMessage(messages.animenote)}
          </ThemedText>
        )}
      </View>
    </>
  );
};

export default AdvancedRequester;
