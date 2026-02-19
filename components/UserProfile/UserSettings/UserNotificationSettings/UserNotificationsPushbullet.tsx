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

const UserPushbulletSettings = () => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  // const { user } = useUser({ id: Number(router.query.userId) });
  const { user } = useUser();
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<UserSettingsNotificationsResponse>(
    user ? `${serverUrl}/api/v1/user/${user?.id}/settings/notifications` : null
  );

  const UserNotificationsPushbulletSchema = Yup.object().shape({
    pushbulletAccessToken: Yup.string().when('types', {
      is: (types: number) => !!types,
      then: Yup.string()
        .nullable()
        .required(intl.formatMessage(messages.validationPushbulletAccessToken)),
      otherwise: Yup.string().nullable(),
    }),
  });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <Formik
      initialValues={{
        pushbulletAccessToken: data?.pushbulletAccessToken,
        types: data?.notificationTypes.pushbullet ?? 0,
      }}
      validationSchema={UserNotificationsPushbulletSchema}
      enableReinitialize
      onSubmit={async (values) => {
        try {
          await axios.post(
            `${serverUrl}/api/v1/user/${user?.id}/settings/notifications`,
            {
              pgpKey: data?.pgpKey,
              discordId: data?.discordId,
              pushbulletAccessToken: values.pushbulletAccessToken,
              pushoverApplicationToken: data?.pushoverApplicationToken,
              pushoverUserKey: data?.pushoverUserKey,
              telegramChatId: data?.telegramChatId,
              telegramSendSilently: data?.telegramSendSilently,
              notificationTypes: {
                pushbullet: values.types,
              },
            }
          );
          toast.success(intl.formatMessage(messages.pushbulletsettingssaved));
        } catch (e) {
          toast.error(intl.formatMessage(messages.pushbulletsettingsfailed));
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
                    {intl.formatMessage(messages.pushbulletAccessToken)}
                  </ThemedText>
                  <ThemedText className="label-required ml-1 text-red-500">
                    *
                  </ThemedText>
                </View>
                {data?.pushbulletAccessToken && (
                  <ThemedText className="label-tip mb-1 block font-medium text-gray-500">
                    {intl.formatMessage(messages.pushbulletAccessTokenTip, {
                      PushbulletSettingsLink: (msg: React.ReactNode) => (
                        <ThemedText
                          key="pushbulletSettingsLink"
                          onPress={() =>
                            Linking.openURL(
                              'https://www.pushbullet.com/#settings/account'
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
                    id="pushbulletAccessToken"
                    value={values.pushbulletAccessToken}
                    onChangeText={(text) =>
                      setFieldValue('pushbulletAccessToken', text)
                    }
                    onBlur={() => handleBlur('pushbulletAccessToken')}
                    autoCapitalize="none"
                  />
                </View>
                {errors.pushbulletAccessToken &&
                  touched.pushbulletAccessToken && (
                    <ThemedText className="error mt-2 text-sm text-red-500">
                      {errors.pushbulletAccessToken}
                    </ThemedText>
                  )}
              </View>
            </View>
            <NotificationTypeSelector
              user={user}
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

export default UserPushbulletSettings;
