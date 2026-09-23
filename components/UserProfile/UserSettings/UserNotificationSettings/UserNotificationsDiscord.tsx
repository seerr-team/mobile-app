import Alert from '@app/components/Common/Alert';
import Button from '@app/components/Common/Button';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import TextInput from '@app/components/Common/TextInput';
import ThemedText from '@app/components/Common/ThemedText';
import NotificationTypeSelector from '@app/components/NotificationTypeSelector';
import useServerUrl from '@app/hooks/useServerUrl';
import { useUser } from '@app/hooks/useUser';
import getSeerrMessages from '@app/utils/getSeerrMessages';
import globalMessages from '@app/utils/globalMessages';
import {
  ArrowDownOnSquare,
  Plus,
  Trash,
} from '@nandorojo/heroicons/24/outline';
import { DISCORD_SNOWFLAKE_REGEX } from '@server/constants/discord';
import type { UserSettingsNotificationsResponse } from '@server/interfaces/api/userSettingsInterfaces';
import axios from 'axios';
import { Formik } from 'formik';
import toast from 'react-hot-toast/headless';
import { useIntl } from 'react-intl';
import { Linking, View } from 'react-native';
import useSWR from 'swr';
import * as Yup from 'yup';

const messages = getSeerrMessages(
  'components.UserProfile.UserSettings.UserNotificationSettings'
);

const UserNotificationsDiscord = () => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  // const { user } = useUser({ id: Number(router.query.userId) });
  const { user } = useUser();
  const { user: currentUser } = useUser();
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<UserSettingsNotificationsResponse>(
    user ? `${serverUrl}/api/v1/user/${user?.id}/settings/notifications` : null
  );

  const UserNotificationsDiscordSchema = Yup.object().shape({
    discordIds: Yup.array()
      .of(
        Yup.string().matches(DISCORD_SNOWFLAKE_REGEX, {
          message: intl.formatMessage(messages.validationDiscordId),
          excludeEmptyString: true,
        })
      )
      .when('types', {
        is: (types: number) => !!types,
        then: (schema) =>
          schema
            .compact((value) => value === '')
            .min(1, intl.formatMessage(messages.validationDiscordId)),
      }),
  });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <Formik
      initialValues={{
        discordIds: data?.discordIds ?? [''],
        types:
          (data?.discordEnabledTypes ?? 0) &
          (data?.notificationTypes.discord ?? 0),
      }}
      validationSchema={UserNotificationsDiscordSchema}
      enableReinitialize
      onSubmit={async (values) => {
        try {
          await axios.post(
            `${serverUrl}/api/v1/user/${user?.id}/settings/notifications`,
            {
              pgpKey: data?.pgpKey,
              discordIds: values.discordIds,
              pushbulletAccessToken: data?.pushbulletAccessToken,
              pushoverApplicationToken: data?.pushoverApplicationToken,
              pushoverUserKey: data?.pushoverUserKey,
              telegramChatId: data?.telegramChatId,
              telegramSendSilently: data?.telegramSendSilently,
              notificationTypes: {
                discord: values.types,
              },
            }
          );
          toast.success(intl.formatMessage(messages.discordsettingssaved));
        } catch (e) {
          toast.error(intl.formatMessage(messages.discordsettingsfailed));
        } finally {
          revalidate();
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
        setFieldTouched,
        handleBlur,
        handleSubmit,
      }) => {
        return (
          <View className="section mt-0">
            {!(data?.discordEnabledTypes ?? 0) && (
              <Alert
                type="warning"
                title={intl.formatMessage(
                  messages.discordNotificationsNotEnabled
                )}
              />
            )}
            <View className="form-row">
              <View className="text-label">
                <View className="flex flex-row items-center">
                  <ThemedText className="mb-1 block text-sm font-bold leading-5 text-gray-400">
                    {intl.formatMessage(messages.discordId)}
                  </ThemedText>
                  {!!data?.discordEnabledTypes && (
                    <ThemedText className="label-required ml-1 text-red-500">
                      *
                    </ThemedText>
                  )}
                </View>
                {currentUser?.id === user?.id && (
                  <ThemedText className="label-tip mb-1 block font-medium text-gray-500">
                    {intl.formatMessage(messages.discordIdTip, {
                      FindDiscordIdLink: (msg: React.ReactNode) => (
                        <ThemedText
                          key="findDiscordIdLink"
                          onPress={() =>
                            Linking.openURL(
                              'https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-'
                            )
                          }
                        >
                          {msg}
                        </ThemedText>
                      ),
                    })}
                  </ThemedText>
                )}
              </View>
              <View className="form-input-area w-full">
                <View className="gap-2">
                  {values.discordIds.map((_id: string, index: number) => (
                    <View key={index} className="flex flex-row gap-2">
                      <View className="flex-1">
                        <View className="form-input-field">
                          <TextInput
                            value={values.discordIds[index]}
                            onChangeText={(text) =>
                              setFieldValue(`discordIds.${index}`, text)
                            }
                            onBlur={handleBlur(`discordIds.${index}`)}
                            placeholder={intl.formatMessage(
                              messages.discordIdPlaceholder
                            )}
                            autoCapitalize="none"
                            keyboardType="number-pad"
                          />
                        </View>
                        {Array.isArray(errors.discordIds) &&
                          errors.discordIds[index] &&
                          Array.isArray(touched.discordIds) &&
                          touched.discordIds[index] && (
                            <ThemedText className="error mt-2 text-sm text-red-500">
                              {errors.discordIds[index]}
                            </ThemedText>
                          )}
                      </View>
                      {values.discordIds.length > 1 && (
                        <View className="flex items-center">
                          <Button
                            buttonType="danger"
                            onClick={() => {
                              const newIds = values.discordIds.filter(
                                (_: string, idx: number) => idx !== index
                              );
                              setFieldValue('discordIds', newIds);
                            }}
                            pressableProps={{
                              accessibilityLabel: intl.formatMessage(
                                messages.discordIdRemove
                              ),
                            }}
                          >
                            <Trash color="#ffffff" width={20} height={20} />
                          </Button>
                        </View>
                      )}
                    </View>
                  ))}
                  <Button
                    buttonType="ghost"
                    onClick={() => {
                      setFieldValue('discordIds', [...values.discordIds, '']);
                    }}
                    className="flex flex-row items-center gap-2"
                  >
                    <Plus color="#ffffff" width={20} height={20} />
                    <ThemedText>
                      {intl.formatMessage(messages.discordIdAdd)}
                    </ThemedText>
                  </Button>
                </View>
                {errors.discordIds &&
                  touched.discordIds &&
                  typeof errors.discordIds === 'string' && (
                    <ThemedText className="error mt-2 text-sm text-red-500">
                      {errors.discordIds}
                    </ThemedText>
                  )}
              </View>
            </View>
            <NotificationTypeSelector
              user={user}
              enabledTypes={data?.discordEnabledTypes ?? 0}
              currentTypes={values.types}
              onUpdate={(newTypes) => {
                setFieldValue('types', newTypes);
                setFieldTouched('types');
              }}
              error={
                errors.types && touched.types
                  ? (errors.types as string)
                  : undefined
              }
            />
            <View className="actions">
              <View className="flex flex-row justify-end">
                <View className="ml-3 inline-flex rounded-md shadow-sm">
                  <Button
                    buttonType="primary"
                    disabled={isSubmitting || !isValid}
                    onClick={() => handleSubmit()}
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
  );
};

export default UserNotificationsDiscord;
