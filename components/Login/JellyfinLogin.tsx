import Button from '@/components/Common/Button';
import TextInput from '@/components/Common/TextInput';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import useSettings from '@/hooks/useSettings';
import { ApiErrorCode } from '@/jellyseerr/server/constants/error';
import {
  MediaServerType,
  ServerType,
} from '@/jellyseerr/server/constants/server';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { ArrowLeftOnRectangle } from '@nandorojo/heroicons/24/outline';
import axios from 'axios';
import { Formik } from 'formik';
import toast from 'react-hot-toast/headless';
import { useIntl } from 'react-intl';
import { Linking, Pressable, View } from 'react-native';
import * as Yup from 'yup';

const messages = getJellyseerrMessages('components.Login');

interface JellyfinLoginProps {
  revalidate: () => void;
  serverType?: MediaServerType;
}

const JellyfinLogin: React.FC<JellyfinLoginProps> = ({
  revalidate,
  serverType,
}) => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const settings = useSettings();

  const mediaServerFormatValues = {
    mediaServerName:
      serverType === MediaServerType.JELLYFIN
        ? ServerType.JELLYFIN
        : serverType === MediaServerType.EMBY
          ? ServerType.EMBY
          : 'Media Server',
  };

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required(
      intl.formatMessage(messages.validationusernamerequired)
    ),
    password: Yup.string(),
  });
  const baseUrl = settings.currentSettings.jellyfinExternalHost
    ? settings.currentSettings.jellyfinExternalHost
    : settings.currentSettings.jellyfinHost;
  const jellyfinForgotPasswordUrl =
    settings.currentSettings.jellyfinForgotPasswordUrl;

  return (
    <View>
      <Formik
        initialValues={{
          username: '',
          password: '',
        }}
        validationSchema={LoginSchema}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            await axios.post(serverUrl + '/api/v1/auth/jellyfin', {
              username: values.username,
              password: values.password,
              email: values.username,
            });
          } catch (e) {
            let errorMessage = null;
            switch (e?.response?.data?.message) {
              case ApiErrorCode.InvalidUrl:
                errorMessage = messages.invalidurlerror;
                break;
              case ApiErrorCode.InvalidCredentials:
                errorMessage = messages.credentialerror;
                break;
              case ApiErrorCode.NotAdmin:
                errorMessage = messages.adminerror;
                break;
              case ApiErrorCode.NoAdminUser:
                errorMessage = messages.noadminerror;
                break;
              default:
                errorMessage = messages.loginerror;
                break;
            }
            toast.error(
              intl.formatMessage(errorMessage, mediaServerFormatValues)
            );
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
          handleChange,
          handleBlur,
          handleSubmit,
        }) => {
          return (
            <>
              <View>
                <ThemedText className="-mt-1 mb-6 text-center text-lg font-bold text-neutral-200">
                  {intl.formatMessage(messages.loginwithapp, {
                    appName: mediaServerFormatValues.mediaServerName,
                  })}
                </ThemedText>

                <View className="mb-4 mt-1">
                  <View className="flex max-w-lg rounded-md shadow-sm">
                    <TextInput
                      onChangeText={handleChange('username')}
                      onBlur={handleBlur('username')}
                      value={values.username}
                      placeholder={intl.formatMessage(messages.username)}
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.username && touched.username && (
                    <ThemedText className="mt-1.5 text-red-500">
                      {errors.username}
                    </ThemedText>
                  )}
                </View>

                <View className="mb-2 mt-1">
                  <View className="flex max-w-lg rounded-md shadow-sm">
                    <TextInput
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      value={values.password}
                      placeholder={intl.formatMessage(messages.password)}
                      autoCapitalize="none"
                      secureTextEntry={true}
                    />
                  </View>
                  <View className="flex flex-row">
                    {errors.password && touched.password && (
                      <ThemedText className="mt-1.5 text-red-500">
                        {errors.password}
                      </ThemedText>
                    )}
                    <View className="flex-grow"></View>
                    {baseUrl && (
                      <Pressable
                        onPress={() => {
                          Linking.openURL(
                            jellyfinForgotPasswordUrl
                              ? `${jellyfinForgotPasswordUrl}`
                              : `${baseUrl}/web/index.html#!/${
                                  settings.currentSettings.mediaServerType ===
                                  MediaServerType.EMBY
                                    ? 'startup/'
                                    : ''
                                }forgotpassword.html`
                          );
                        }}
                        className="group pt-2 text-sm"
                      >
                        <ThemedText className="text-indigo-500 group-hover:text-indigo-400 group-focus:text-indigo-400">
                          {intl.formatMessage(messages.forgotpassword)}
                        </ThemedText>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>

              <Button
                buttonType="primary"
                disabled={isSubmitting || !isValid}
                className="mt-2 flex w-full flex-row items-center justify-center gap-2"
                onClick={() => handleSubmit()}
              >
                <ArrowLeftOnRectangle color="#ffffff" />
                <ThemedText>
                  {isSubmitting
                    ? intl.formatMessage(messages.signingin)
                    : intl.formatMessage(messages.signin)}
                </ThemedText>
              </Button>
            </>
          );
        }}
      </Formik>
    </View>
  );
};

export default JellyfinLogin;
