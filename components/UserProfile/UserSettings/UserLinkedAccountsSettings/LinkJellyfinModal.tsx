import Alert from '@/components/Common/Alert';
import Modal from '@/components/Common/Modal';
import TextInput from '@/components/Common/TextInput';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import useSettings from '@/hooks/useSettings';
import { useUser } from '@/hooks/useUser';
import { MediaServerType } from '@/seerr/server/constants/server';
import getSeerrMessages from '@/utils/getSeerrMessages';
import axios from 'axios';
import { Formik } from 'formik';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import * as Yup from 'yup';

const messages = getSeerrMessages(
  'components.UserProfile.UserSettings.LinkJellyfinModal'
);

interface LinkJellyfinModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
}

const LinkJellyfinModal: React.FC<LinkJellyfinModalProps> = ({
  show,
  onClose,
  onSave,
}) => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const settings = useSettings();
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);

  const JellyfinLoginSchema = Yup.object().shape({
    username: Yup.string().required(
      intl.formatMessage(messages.usernameRequired)
    ),
    password: Yup.string().required(
      intl.formatMessage(messages.passwordRequired)
    ),
  });

  const applicationName = settings.currentSettings.applicationTitle;
  const mediaServerName =
    settings.currentSettings.mediaServerType === MediaServerType.EMBY
      ? 'Emby'
      : 'Jellyfin';

  return (
    <Formik
      initialValues={{
        username: '',
        password: '',
      }}
      validationSchema={JellyfinLoginSchema}
      onSubmit={async ({ username, password }) => {
        try {
          setError(null);
          await axios.post(
            `${serverUrl}/api/v1/user/${user?.id}/settings/linked-accounts/jellyfin`,
            {
              username,
              password,
            }
          );
          onSave();
        } catch (e) {
          if (e?.response?.status === 401) {
            setError(
              intl.formatMessage(messages.errorUnauthorized, {
                mediaServerName,
              })
            );
          } else if (e?.response?.status === 422) {
            setError(
              intl.formatMessage(messages.errorExists, { applicationName })
            );
          } else {
            setError(intl.formatMessage(messages.errorUnknown));
          }
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        handleSubmit,
        isSubmitting,
        isValid,
        setFieldValue,
        handleBlur,
      }) => {
        return (
          <Modal
            show={show}
            onCancel={() => {
              setError(null);
              onClose();
            }}
            okButtonType="primary"
            // okButtonProps={{ type: 'submit', form: 'link-jellyfin-account' }}
            okText={
              isSubmitting
                ? intl.formatMessage(messages.saving)
                : intl.formatMessage(messages.save)
            }
            okDisabled={isSubmitting || !isValid}
            onOk={() => handleSubmit()}
            title={intl.formatMessage(messages.title, { mediaServerName })}
            // dialogClass="sm:max-w-lg"
          >
            <View id="link-jellyfin-account">
              <ThemedText className="mb-2 text-gray-300">
                {intl.formatMessage(messages.description, {
                  mediaServerName,
                  applicationName,
                })}
              </ThemedText>
              {error && (
                <View className="mt-2">
                  <Alert type="error">{error}</Alert>
                </View>
              )}
              <ThemedText className="text-label mb-1 block text-sm font-bold leading-5 text-gray-400">
                {intl.formatMessage(messages.username)}
              </ThemedText>
              <View className="mb-2 mt-1 sm:col-span-2 sm:mt-0">
                <View className="flex rounded-md shadow-sm">
                  <TextInput
                    placeholder={intl.formatMessage(messages.username)}
                    value={values.username}
                    onChangeText={(text) => setFieldValue('username', text)}
                    onBlur={handleBlur('username')}
                    autoCapitalize="none"
                  />
                </View>
                {errors.username && touched.username && (
                  <ThemedText className="error">{errors.username}</ThemedText>
                )}
              </View>
              <ThemedText className="text-label mb-1 block text-sm font-bold leading-5 text-gray-400">
                {intl.formatMessage(messages.password)}
              </ThemedText>
              <ThemedText className="mb-2 mt-1 sm:col-span-2 sm:mt-0">
                <View className="flex rounded-md shadow-sm">
                  <TextInput
                    placeholder={intl.formatMessage(messages.password)}
                    value={values.password}
                    onChangeText={(text) => setFieldValue('password', text)}
                    onBlur={handleBlur('password')}
                    secureTextEntry={true}
                  />
                </View>
                {errors.password && touched.password && (
                  <ThemedText className="error">{errors.password}</ThemedText>
                )}
              </ThemedText>
            </View>
          </Modal>
        );
      }}
    </Formik>
  );
};

export default LinkJellyfinModal;
