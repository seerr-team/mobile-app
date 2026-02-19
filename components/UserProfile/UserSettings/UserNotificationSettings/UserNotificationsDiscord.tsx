import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import TextInput from '@/components/Common/TextInput';
import ThemedText from '@/components/Common/ThemedText';
import NotificationTypeSelector from '@/components/NotificationTypeSelector';
import useServerUrl from '@/hooks/useServerUrl';
import { useUser } from '@/hooks/useUser';
import type { UserSettingsNotificationsResponse } from '@/seerr/server/interfaces/api/userSettingsInterfaces';
import getSeerrMessages from '@/utils/getSeerrMessages';
import globalMessages from '@/utils/globalMessages';
import { ArrowDownOnSquare } from '@nandorojo/heroicons/24/outline';
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
    discordId: Yup.string()
      .when('types', {
        is: (types: number) => !!types,
        then: Yup.string()
          .nullable()
          .required(intl.formatMessage(messages.validationDiscordId)),
        otherwise: Yup.string().nullable(),
      })
      .matches(/^\d{17,19}$/, intl.formatMessage(messages.validationDiscordId)),
  });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <Formik
      initialValues={{
        discordId: data?.discordId,
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
              discordId: values.discordId,
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
              <View className="form-input-area">
                <View className="form-input-field">
                  <TextInput
                    id="discordId"
                    value={values.discordId}
                    onChangeText={(text) => setFieldValue('discordId', text)}
                    onBlur={handleBlur('discordId')}
                    autoCapitalize="none"
                  />
                </View>
                {errors.discordId &&
                  touched.discordId &&
                  typeof errors.discordId === 'string' && (
                    <ThemedText className="error mt-2 text-sm text-red-500">
                      {errors.discordId}
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
