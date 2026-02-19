import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import TextInput from '@/components/Common/TextInput';
import ThemedText from '@/components/Common/ThemedText';
import NotificationTypeSelector from '@/components/NotificationTypeSelector';
import useServerUrl from '@/hooks/useServerUrl';
import useSettings from '@/hooks/useSettings';
import { useUser } from '@/hooks/useUser';
import type { PushoverSound } from '@/seerr/server/api/pushover';
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

const UserPushoverSettings = () => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const settings = useSettings();
  // const { user } = useUser({ id: Number(router.query.userId) });
  const { user } = useUser();
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<UserSettingsNotificationsResponse>(
    user ? `${serverUrl}/api/v1/user/${user?.id}/settings/notifications` : null
  );
  const { data: soundsData } = useSWR<PushoverSound[]>(
    data?.pushoverApplicationToken
      ? `${serverUrl}/api/v1/settings/notifications/pushover/sounds?token=${data.pushoverApplicationToken}`
      : null
  );

  const UserNotificationsPushoverSchema = Yup.object().shape({
    pushoverApplicationToken: Yup.string()
      .when('types', {
        is: (types: number) => !!types,
        then: Yup.string()
          .nullable()
          .required(
            intl.formatMessage(messages.validationPushoverApplicationToken)
          ),
        otherwise: Yup.string().nullable(),
      })
      .matches(
        /^[a-z\d]{30}$/i,
        intl.formatMessage(messages.validationPushoverApplicationToken)
      ),
    pushoverUserKey: Yup.string()
      .when('types', {
        is: (types: number) => !!types,
        then: Yup.string()
          .nullable()
          .required(intl.formatMessage(messages.validationPushoverUserKey)),
        otherwise: Yup.string().nullable(),
      })
      .matches(
        /^[a-z\d]{30}$/i,
        intl.formatMessage(messages.validationPushoverUserKey)
      ),
  });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <Formik
      initialValues={{
        pushoverApplicationToken: data?.pushoverApplicationToken,
        pushoverUserKey: data?.pushoverUserKey,
        types: data?.notificationTypes.pushover ?? 0,
      }}
      validationSchema={UserNotificationsPushoverSchema}
      enableReinitialize
      onSubmit={async (values) => {
        try {
          await axios.post(
            `${serverUrl}/api/v1/user/${user?.id}/settings/notifications`,
            {
              pgpKey: data?.pgpKey,
              discordId: data?.discordId,
              pushbulletAccessToken: data?.pushbulletAccessToken,
              pushoverApplicationToken: values.pushoverApplicationToken,
              pushoverUserKey: values.pushoverUserKey,
              telegramChatId: data?.telegramChatId,
              telegramSendSilently: data?.telegramSendSilently,
              notificationTypes: {
                pushover: values.types,
              },
            }
          );
          toast.success(intl.formatMessage(messages.pushoversettingssaved));
        } catch (e) {
          toast.error(intl.formatMessage(messages.pushoversettingsfailed));
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
                    {intl.formatMessage(messages.pushoverApplicationToken)}
                  </ThemedText>
                  <ThemedText className="label-required ml-1 text-red-500">
                    *
                  </ThemedText>
                </View>
                <ThemedText className="label-tip mb-1 block font-medium text-gray-500">
                  {intl.formatMessage(messages.pushoverApplicationTokenTip, {
                    ApplicationRegistrationLink: (msg: React.ReactNode) => (
                      <ThemedText
                        key="applicationRegistrationLink"
                        onPress={() =>
                          Linking.openURL(
                            'https://pushover.net/api#registration'
                          )
                        }
                      >
                        {msg}
                      </ThemedText>
                    ),
                    applicationTitle: settings.currentSettings.applicationTitle,
                  })}
                </ThemedText>
              </View>
              <View className="form-input-area">
                <View className="form-input-field">
                  <TextInput
                    id="pushoverApplicationToken"
                    value={values.pushoverApplicationToken}
                    onChangeText={(value) =>
                      setFieldValue('pushoverApplicationToken', value)
                    }
                    onBlur={() => handleBlur('pushoverApplicationToken')}
                    autoCapitalize="none"
                  />
                </View>
                {errors.pushoverApplicationToken &&
                  touched.pushoverApplicationToken && (
                    <ThemedText className="error mt-2 text-sm text-red-500">
                      {errors.pushoverApplicationToken}
                    </ThemedText>
                  )}
              </View>
            </View>
            <View className="form-row">
              <View className="checkbox-label">
                <ThemedText className="mb-1 block text-sm font-bold leading-5 text-gray-400">
                  {intl.formatMessage(messages.pushoverUserKey)}
                </ThemedText>
                <ThemedText className="label-tip mb-1 block font-medium text-gray-500">
                  {intl.formatMessage(messages.pushoverUserKeyTip, {
                    UsersGroupsLink: (msg: React.ReactNode) => (
                      <ThemedText
                        key="usersGroupsLink"
                        onPress={() =>
                          Linking.openURL(
                            'https://pushover.net/api#identifiers'
                          )
                        }
                      >
                        {msg}
                      </ThemedText>
                    ),
                  })}
                </ThemedText>
              </View>
              <View className="form-input-area">
                <View className="form-input-field">
                  <TextInput
                    id="pushoverUserKey"
                    value={values.pushoverUserKey}
                    onChangeText={(value) =>
                      setFieldValue('pushoverUserKey', value)
                    }
                    onBlur={() => handleBlur('pushoverUserKey')}
                    autoCapitalize="none"
                  />
                </View>
                {errors.pushoverUserKey &&
                  touched.pushoverUserKey &&
                  typeof errors.pushoverUserKey === 'string' && (
                    <ThemedText className="error mt-2 text-sm text-red-500">
                      {errors.pushoverUserKey}
                    </ThemedText>
                  )}
              </View>
            </View>
            {/* <View className="form-row">
              <ThemedText className="mb-1 block text-sm font-bold leading-5 text-gray-400">
                {intl.formatMessage(messages.sound)}
              </ThemedText>
              <View className="form-input-area">
                <View className="form-input-field">
                  <SimpleSelect
                    data={[
                      { label: intl.formatMessage(messages.deviceDefault), value: '' },
                      ...(soundsData?.map((sound) => ({
                        label: sound.description,
                        value: sound.name,
                      })) ?? []),
                    ]}
                    value={values.sound ?? ''}
                    onChange={(value) => setFieldValue('sound', value)}
                    disabled={!soundsData?.length}
                  />
                </View>
              </View>
            </View> */}
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

export default UserPushoverSettings;
