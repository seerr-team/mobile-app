import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import TextInput from '@/components/Common/TextInput';
import ThemedText from '@/components/Common/ThemedText';
import NotificationTypeSelector, {
  ALL_NOTIFICATIONS,
} from '@/components/NotificationTypeSelector';
import SettingsBadge from '@/components/Settings/SettingsBadge';
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

const UserEmailSettings = () => {
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

  const UserNotificationsEmailSchema = Yup.object().shape({
    pgpKey: Yup.string()
      .nullable()
      .matches(
        /-----BEGIN PGP PUBLIC KEY BLOCK-----.+-----END PGP PUBLIC KEY BLOCK-----/s,
        intl.formatMessage(messages.validationPgpPublicKey)
      ),
  });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <Formik
      initialValues={{
        pgpKey: data?.pgpKey,
        types: data?.notificationTypes.email ?? ALL_NOTIFICATIONS,
      }}
      validationSchema={UserNotificationsEmailSchema}
      enableReinitialize
      onSubmit={async (values) => {
        try {
          await axios.post(
            `${serverUrl}/api/v1/user/${user?.id}/settings/notifications`,
            {
              pgpKey: values.pgpKey,
              discordId: data?.discordId,
              pushbulletAccessToken: data?.pushbulletAccessToken,
              pushoverApplicationToken: data?.pushoverApplicationToken,
              pushoverUserKey: data?.pushoverUserKey,
              telegramChatId: data?.telegramChatId,
              telegramSendSilently: data?.telegramSendSilently,
              notificationTypes: {
                email: values.types,
              },
            }
          );
          toast.success(intl.formatMessage(messages.emailsettingssaved));
        } catch (e) {
          toast.error(intl.formatMessage(messages.emailsettingsfailed));
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
                  <ThemedText className="mr-2">
                    {intl.formatMessage(messages.pgpPublicKey)}
                  </ThemedText>
                  <SettingsBadge badgeType="advanced" />
                </View>
                <ThemedText className="label-tip mb-1 flex items-center font-medium text-gray-500">
                  {intl.formatMessage(messages.pgpPublicKeyTip, {
                    OpenPgpLink: (msg) => (
                      <ThemedText
                        key="openpgp-link"
                        onPress={() =>
                          Linking.openURL('https://www.openpgp.org/')
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
                    // id="pgpKey"
                    // name="pgpKey"
                    // rows="10"
                    className="font-mono text-xs"
                    value={values.pgpKey}
                    onChangeText={(text) => setFieldValue('pgpKey', text)}
                    onBlur={() => handleBlur('pgpKey')}
                    numberOfLines={10}
                  />
                </View>
                {errors.pgpKey &&
                  touched.pgpKey &&
                  typeof errors.pgpKey === 'string' && (
                    <ThemedText className="error">{errors.pgpKey}</ThemedText>
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

export default UserEmailSettings;
