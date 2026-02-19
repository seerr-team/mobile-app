import Badge from '@/components/Common/Badge';
import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import LanguageSelector from '@/components/LanguageSelector';
// import QuotaSelector from '@/components/QuotaSelector';
import SimpleSelect from '@/components/Common/SimpleSelect';
import TextInput from '@/components/Common/TextInput';
import ThemedText from '@/components/Common/ThemedText';
import ErrorPage from '@/components/ErrorPage';
import RegionSelector from '@/components/RegionSelector';
import useLocale from '@/hooks/useLocale';
import useServerUrl from '@/hooks/useServerUrl';
import useSettings from '@/hooks/useSettings';
import { Permission, UserType, useUser } from '@/hooks/useUser';
import { ApiErrorCode } from '@/seerr/server/constants/error';
import type { UserSettingsGeneralResponse } from '@/seerr/server/interfaces/api/userSettingsInterfaces';
import type { AvailableLocale } from '@/seerr/server/types/languages';
import { availableLanguages } from '@/seerr/src/context/LanguageContext';
import getSeerrMessages from '@/utils/getSeerrMessages';
import globalMessages from '@/utils/globalMessages';
import { ArrowDownOnSquare } from '@nandorojo/heroicons/24/outline';
import axios from 'axios';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast/headless';
import { useIntl } from 'react-intl';
import { Linking, Pressable, Switch, View } from 'react-native';
import useSWR from 'swr';
import validator from 'validator';
import * as Yup from 'yup';

const messages = getSeerrMessages(
  'components.UserProfile.UserSettings.UserGeneralSettings'
);

const UserGeneralSettings = () => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const { locale, setLocale } = useLocale();
  const [movieQuotaEnabled, setMovieQuotaEnabled] = useState(false);
  const [tvQuotaEnabled, setTvQuotaEnabled] = useState(false);
  const {
    user,
    hasPermission,
    revalidate: revalidateUser,
  } = useUser({
    // id: Number(router.query.userId),
  });
  const { user: currentUser, hasPermission: currentHasPermission } = useUser();
  const { currentSettings } = useSettings();
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<UserSettingsGeneralResponse>(
    user ? `${serverUrl}/api/v1/user/${user?.id}/settings/main` : null
  );

  const UserGeneralSettingsSchema = Yup.object().shape({
    email:
      // email is required for everybody except non-admin jellyfin users
      user?.id === 1 ||
      (user?.userType !== UserType.JELLYFIN && user?.userType !== UserType.EMBY)
        ? Yup.string()
            .test(
              'email',
              intl.formatMessage(messages.validationemailformat),
              (value) =>
                !value || validator.isEmail(value, { require_tld: false })
            )
            .required(intl.formatMessage(messages.validationemailrequired))
        : Yup.string().test(
            'email',
            intl.formatMessage(messages.validationemailformat),
            (value) =>
              !value || validator.isEmail(value, { require_tld: false })
          ),
    discordId: Yup.string()
      .nullable()
      .matches(/^\d{17,19}$/, intl.formatMessage(messages.validationDiscordId)),
  });

  useEffect(() => {
    setMovieQuotaEnabled(
      data?.movieQuotaLimit != undefined && data?.movieQuotaDays != undefined
    );
    setTvQuotaEnabled(
      data?.tvQuotaLimit != undefined && data?.tvQuotaDays != undefined
    );
  }, [data]);

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <ErrorPage statusCode={500} />;
  }

  return (
    <View className="px-4">
      <ThemedText className="heading">
        {intl.formatMessage(messages.generalsettings)}
      </ThemedText>
      <Formik
        initialValues={{
          displayName: data?.username !== user?.email ? data?.username : '',
          email: data?.email?.includes('@') ? data.email : '',
          discordId: data?.discordId ?? '',
          locale: data?.locale,
          discoverRegion: data?.discoverRegion,
          streamingRegion: data?.streamingRegion,
          originalLanguage: data?.originalLanguage,
          movieQuotaLimit: data?.movieQuotaLimit,
          movieQuotaDays: data?.movieQuotaDays,
          tvQuotaLimit: data?.tvQuotaLimit,
          tvQuotaDays: data?.tvQuotaDays,
          watchlistSyncMovies: data?.watchlistSyncMovies,
          watchlistSyncTv: data?.watchlistSyncTv,
        }}
        validationSchema={UserGeneralSettingsSchema}
        enableReinitialize
        onSubmit={async (values) => {
          try {
            await axios.post(
              `${serverUrl}/api/v1/user/${user?.id}/settings/main`,
              {
                username: values.displayName,
                email:
                  values.email || user?.jellyfinUsername || user?.plexUsername,
                discordId: values.discordId,
                locale: values.locale,
                discoverRegion: values.discoverRegion,
                streamingRegion: values.streamingRegion,
                originalLanguage: values.originalLanguage,
                movieQuotaLimit: movieQuotaEnabled
                  ? values.movieQuotaLimit
                  : null,
                movieQuotaDays: movieQuotaEnabled
                  ? values.movieQuotaDays
                  : null,
                tvQuotaLimit: tvQuotaEnabled ? values.tvQuotaLimit : null,
                tvQuotaDays: tvQuotaEnabled ? values.tvQuotaDays : null,
                watchlistSyncMovies: values.watchlistSyncMovies,
                watchlistSyncTv: values.watchlistSyncTv,
              }
            );

            if (currentUser?.id === user?.id && setLocale) {
              setLocale(
                (values.locale
                  ? values.locale
                  : currentSettings.locale) as AvailableLocale
              );
            }

            toast.success(intl.formatMessage(messages.toastSettingsSuccess));
          } catch (e) {
            if (e?.response?.data?.message === ApiErrorCode.InvalidEmail) {
              if (values.email) {
                toast.error(
                  intl.formatMessage(messages.toastSettingsFailureEmail)
                );
              } else {
                toast.error(
                  intl.formatMessage(messages.toastSettingsFailureEmailEmpty)
                );
              }
            } else {
              toast.error(intl.formatMessage(messages.toastSettingsFailure));
            }
          } finally {
            revalidate();
            revalidateUser();
          }
        }}
      >
        {({
          errors,
          touched,
          isSubmitting,
          isValid,
          values,
          setFieldValue,
          handleSubmit,
          handleBlur,
          handleChange,
        }) => {
          return (
            <View>
              <View className="form-row">
                <ThemedText className="text-label mb-1 font-bold text-gray-400">
                  {intl.formatMessage(messages.accounttype)}
                </ThemedText>
                <View className="mb-1 text-sm font-medium leading-5 text-gray-400 sm:mt-2">
                  <View className="flex max-w-lg flex-row items-center">
                    {user?.userType === UserType.PLEX ? (
                      <Badge badgeType="warning">
                        {intl.formatMessage(messages.plexuser)}
                      </Badge>
                    ) : user?.userType === UserType.LOCAL ? (
                      <Badge badgeType="default">
                        {intl.formatMessage(messages.localuser)}
                      </Badge>
                    ) : user?.userType === UserType.EMBY ? (
                      <Badge badgeType="success">
                        {intl.formatMessage(messages.mediaServerUser, {
                          mediaServerName: 'Emby',
                        })}
                      </Badge>
                    ) : user?.userType === UserType.JELLYFIN ? (
                      <Badge badgeType="default">
                        {intl.formatMessage(messages.mediaServerUser, {
                          mediaServerName: 'Jellyfin',
                        })}
                      </Badge>
                    ) : null}
                  </View>
                </View>
              </View>
              <View className="form-row">
                <ThemedText className="text-label mb-1 font-bold text-gray-400">
                  {intl.formatMessage(messages.role)}
                </ThemedText>
                <View className="mb-1 text-sm font-medium leading-5 text-gray-400 sm:mt-2">
                  <ThemedText className="flex max-w-lg flex-row items-center">
                    {user?.id === 1
                      ? intl.formatMessage(messages.owner)
                      : hasPermission(Permission.ADMIN)
                        ? intl.formatMessage(messages.admin)
                        : intl.formatMessage(messages.user)}
                  </ThemedText>
                </View>
              </View>
              <View className="form-row">
                <ThemedText className="text-label mb-1 font-bold text-gray-400">
                  {intl.formatMessage(messages.displayName)}
                </ThemedText>
                <View className="form-input-area">
                  <View className="form-input-field">
                    <TextInput
                      onChangeText={handleChange('displayName')}
                      onBlur={handleBlur('displayName')}
                      value={values.displayName}
                      keyboardType="default"
                      autoCapitalize="none"
                      placeholder={
                        user?.jellyfinUsername ||
                        user?.plexUsername ||
                        user?.email
                      }
                    />
                  </View>
                  {errors.displayName &&
                    touched.displayName &&
                    typeof errors.displayName === 'string' && (
                      <ThemedText className="mt-1.5 text-red-500">
                        {errors.displayName}
                      </ThemedText>
                    )}
                </View>
              </View>
              <View className="form-row">
                <ThemedText className="text-label mb-1 font-bold text-gray-400">
                  {intl.formatMessage(messages.email)}
                  {user?.warnings.find((w) => w === 'userEmailRequired') && (
                    <ThemedText className="label-required">*</ThemedText>
                  )}
                </ThemedText>
                <View className="form-input-area">
                  <View className="form-input-field">
                    <TextInput
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      value={values.email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="example@domain.com"
                      className={
                        user?.warnings.find((w) => w === 'userEmailRequired')
                          ? 'border-2 border-red-400 focus:border-blue-600'
                          : ''
                      }
                    />
                  </View>
                  {errors.email && touched.email && (
                    <ThemedText className="mt-1.5 text-red-500">
                      {errors.email}
                    </ThemedText>
                  )}
                </View>
              </View>
              <View className="form-row">
                <View className="-mt-1">
                  <ThemedText className="text-label mb-1 font-bold text-gray-400">
                    {intl.formatMessage(messages.discordId)}
                  </ThemedText>
                  {currentUser?.id === user?.id && (
                    <ThemedText className="label-tip mb-1 flex items-center font-medium text-gray-500">
                      {intl.formatMessage(messages.discordIdTip, {
                        FindDiscordIdLink: (msg: React.ReactNode) => (
                          <ThemedText
                            key="discordIdTipLink"
                            onPress={() => {
                              Linking.openURL(
                                'https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-'
                              );
                            }}
                            className="flex items-center"
                          >
                            {msg}
                          </ThemedText>
                        ),
                      })}
                    </ThemedText>
                  )}
                </View>
                <View className="form-input-area">
                  <View className="form-input-field">
                    <TextInput
                      onChangeText={handleChange('discordId')}
                      onBlur={handleBlur('discordId')}
                      value={values.discordId}
                      keyboardType="default"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.discordId &&
                    touched.discordId &&
                    typeof errors.discordId === 'string' && (
                      <ThemedText className="mt-1.5 text-red-500">
                        {errors.discordId}
                      </ThemedText>
                    )}
                </View>
              </View>
              <View className="form-row">
                <ThemedText className="text-label mb-1 font-bold text-gray-400">
                  {intl.formatMessage(messages.applanguage)}
                </ThemedText>
                <View className="form-input-area">
                  <View className="form-input-field">
                    {/* <Field as="select" id="locale" name="locale">
                      <option value="" lang={locale}>
                        {intl.formatMessage(messages.languageDefault, {
                          language:
                            availableLanguages[currentSettings.locale].display,
                        })}
                      </option>
                      {(
                        Object.keys(
                          availableLanguages
                        ) as (keyof typeof availableLanguages)[]
                      ).map((key) => (
                        <option
                          key={key}
                          value={availableLanguages[key].code}
                          lang={availableLanguages[key].code}
                        >
                          {availableLanguages[key].display}
                        </option>
                      ))}
                    </Field> */}
                    <SimpleSelect
                      data={Object.keys(availableLanguages).map((key) => ({
                        label:
                          availableLanguages[
                            key as keyof typeof availableLanguages
                          ].display,
                        value:
                          availableLanguages[
                            key as keyof typeof availableLanguages
                          ].code,
                      }))}
                      value={values.locale}
                      onChange={(item) => {
                        setFieldValue('locale', item.value);
                      }}
                      placeholder={intl.formatMessage(
                        messages.languageDefault,
                        {
                          language:
                            availableLanguages[currentSettings.locale].display,
                        }
                      )}
                    />
                  </View>
                </View>
              </View>
              <View className="form-row">
                <View>
                  <ThemedText className="text-label mb-1 font-bold text-gray-400">
                    {intl.formatMessage(messages.discoverRegion)}
                  </ThemedText>
                  <ThemedText className="label-tip mb-1 font-medium text-gray-500">
                    {intl.formatMessage(messages.discoverRegionTip)}
                  </ThemedText>
                </View>
                <View className="form-input-area">
                  <View className="form-input-field relative z-[22]">
                    <RegionSelector
                      name="discoverRegion"
                      value={values.discoverRegion ?? ''}
                      isUserSetting
                      onChange={setFieldValue}
                    />
                  </View>
                </View>
              </View>
              <View className="form-row">
                <View>
                  <ThemedText className="text-label mb-1 font-bold text-gray-400">
                    {intl.formatMessage(messages.originallanguage)}
                  </ThemedText>
                  <ThemedText className="label-tip mb-1 font-medium text-gray-500">
                    {intl.formatMessage(messages.originallanguageTip)}
                  </ThemedText>
                </View>
                <View className="form-input-area">
                  <View className="form-input-field relative z-[21]">
                    <LanguageSelector
                      setFieldValue={setFieldValue}
                      serverValue={currentSettings.originalLanguage}
                      value={values.originalLanguage}
                      isUserSettings
                    />
                  </View>
                </View>
              </View>
              <View className="form-row">
                <View>
                  <ThemedText className="text-label mb-1 font-bold text-gray-400">
                    {intl.formatMessage(messages.streamingRegion)}
                  </ThemedText>
                  <ThemedText className="label-tip mb-1 font-medium text-gray-500">
                    {intl.formatMessage(messages.streamingRegionTip)}
                  </ThemedText>
                </View>
                <View className="form-input-area">
                  <View className="form-input-field relative z-20">
                    <RegionSelector
                      name="streamingRegion"
                      value={values.streamingRegion || ''}
                      isUserSetting
                      onChange={setFieldValue}
                      regionType="streaming"
                      disableAll
                    />
                  </View>
                </View>
              </View>
              {/* {currentHasPermission(Permission.MANAGE_USERS) &&
                !hasPermission(Permission.MANAGE_USERS) && (
                  <>
                    <div className="form-row">
                      <label htmlFor="movieQuotaLimit" className="text-label text-gray-400 font-bold mb-1">
                        <span>
                          {intl.formatMessage(messages.movierequestlimit)}
                        </span>
                      </label>
                      <div className="form-input-area">
                        <div className="flex flex-col">
                          <div className="mb-4 flex flex-row items-center">
                            <input
                              type="checkbox"
                              checked={movieQuotaEnabled}
                              onChange={() => setMovieQuotaEnabled((s) => !s)}
                            />
                            <span className="ml-2 text-gray-300">
                              {intl.formatMessage(messages.enableOverride)}
                            </span>
                          </div>
                          <QuotaSelector
                            isDisabled={!movieQuotaEnabled}
                            dayFieldName="movieQuotaDays"
                            limitFieldName="movieQuotaLimit"
                            mediaType="movie"
                            onChange={setFieldValue}
                            defaultDays={values.movieQuotaDays}
                            defaultLimit={values.movieQuotaLimit}
                            dayOverride={
                              !movieQuotaEnabled
                                ? data?.globalMovieQuotaDays
                                : undefined
                            }
                            limitOverride={
                              !movieQuotaEnabled
                                ? data?.globalMovieQuotaLimit
                                : undefined
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <label htmlFor="tvQuotaLimit" className="text-label text-gray-400 font-bold mb-1">
                        <span>
                          {intl.formatMessage(messages.seriesrequestlimit)}
                        </span>
                      </label>
                      <div className="form-input-area">
                        <div className="flex flex-col">
                          <div className="mb-4 flex flex-row items-center">
                            <input
                              type="checkbox"
                              checked={tvQuotaEnabled}
                              onChange={() => setTvQuotaEnabled((s) => !s)}
                            />
                            <span className="ml-2 text-gray-300">
                              {intl.formatMessage(messages.enableOverride)}
                            </span>
                          </div>
                          <QuotaSelector
                            isDisabled={!tvQuotaEnabled}
                            dayFieldName="tvQuotaDays"
                            limitFieldName="tvQuotaLimit"
                            mediaType="tv"
                            onChange={setFieldValue}
                            defaultDays={values.tvQuotaDays}
                            defaultLimit={values.tvQuotaLimit}
                            dayOverride={
                              !tvQuotaEnabled
                                ? data?.globalTvQuotaDays
                                : undefined
                            }
                            limitOverride={
                              !tvQuotaEnabled
                                ? data?.globalTvQuotaLimit
                                : undefined
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )} */}
              {hasPermission(
                [Permission.AUTO_REQUEST, Permission.AUTO_REQUEST_MOVIE],
                { type: 'or' }
              ) &&
                user?.userType === UserType.PLEX && (
                  <View className="form-row">
                    <View className="checkbox-label">
                      <ThemedText className="mb-1 font-bold text-gray-400">
                        {intl.formatMessage(messages.plexwatchlistsyncmovies)}
                      </ThemedText>
                      <ThemedText className="label-tip mb-1 font-medium text-gray-500">
                        {intl.formatMessage(
                          messages.plexwatchlistsyncmoviestip,
                          {
                            PlexWatchlistSupportLink: (
                              msg: React.ReactNode
                            ) => (
                              <Pressable
                                onPress={() => {
                                  Linking.openURL(
                                    'https://support.plex.tv/articles/universal-watchlist/'
                                  );
                                }}
                              >
                                <ThemedText className="text-white transition duration-300 hover:underline">
                                  {msg}
                                </ThemedText>
                              </Pressable>
                            ),
                          }
                        )}
                      </ThemedText>
                    </View>
                    <View className="form-input-area">
                      <Switch
                        value={values.watchlistSyncMovies}
                        onValueChange={(value) => {
                          setFieldValue('watchlistSyncMovies', value);
                        }}
                      />
                    </View>
                  </View>
                )}
              {hasPermission(
                [Permission.AUTO_REQUEST, Permission.AUTO_REQUEST_TV],
                { type: 'or' }
              ) &&
                user?.userType === UserType.PLEX && (
                  <View className="form-row">
                    <View className="checkbox-label">
                      <ThemedText className="mb-1 font-bold text-gray-400">
                        {intl.formatMessage(messages.plexwatchlistsyncseries)}
                      </ThemedText>
                      <ThemedText className="label-tip mb-1 font-medium text-gray-500">
                        {intl.formatMessage(
                          messages.plexwatchlistsyncseriestip,
                          {
                            PlexWatchlistSupportLink: (
                              msg: React.ReactNode
                            ) => (
                              <Pressable
                                onPress={() => {
                                  Linking.openURL(
                                    'https://support.plex.tv/articles/universal-watchlist/'
                                  );
                                }}
                              >
                                <ThemedText className="text-white transition duration-300 hover:underline">
                                  {msg}
                                </ThemedText>
                              </Pressable>
                            ),
                          }
                        )}
                      </ThemedText>
                    </View>
                    <View className="form-input-area">
                      <Switch
                        value={values.watchlistSyncTv}
                        onValueChange={(value) => {
                          setFieldValue('watchlistSyncTv', value);
                        }}
                      />
                    </View>
                  </View>
                )}
              <View className="actions">
                <View className="flex flex-row justify-end">
                  <View className="ml-3 inline-flex rounded-md shadow-sm">
                    <Button
                      buttonType="primary"
                      disabled={isSubmitting || !isValid}
                      onClick={handleSubmit}
                      className="flex flex-row items-center gap-2"
                    >
                      <ArrowDownOnSquare color="#ffffff" />
                      <ThemedText>
                        {isSubmitting
                          ? intl.formatMessage(globalMessages.saving)
                          : intl.formatMessage(globalMessages.save)}
                      </ThemedText>
                    </Button>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      </Formik>
    </View>
  );
};

export default UserGeneralSettings;
