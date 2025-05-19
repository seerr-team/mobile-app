import Button from '@/components/Common/Button';
import useServerUrl from '@/hooks/useServerUrl';
// import SensitiveInput from '@/components/Common/SensitiveInput';
import useSettings from '@/hooks/useSettings';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { ArrowLeftOnRectangle } from '@nandorojo/heroicons/24/outline';
import { Formik } from 'formik';
// import Link from 'next/link';
import TextInput from '@/components/Common/TextInput';
import ThemedText from '@/components/Common/ThemedText';
import axios from 'axios';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import * as Yup from 'yup';

const messages = getJellyseerrMessages('components.Login');

interface LocalLoginProps {
  revalidate: () => void;
}

const LocalLogin = ({ revalidate }: LocalLoginProps) => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const settings = useSettings();
  const [loginError, setLoginError] = useState<string | null>(null);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required(
      intl.formatMessage(messages.validationemailrequired)
    ),
    password: Yup.string().required(
      intl.formatMessage(messages.validationpasswordrequired)
    ),
  });

  // const passwordResetEnabled =
  //   settings.currentSettings.applicationUrl &&
  //   settings.currentSettings.emailEnabled;

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
      }}
      validationSchema={LoginSchema}
      validateOnBlur={false}
      onSubmit={async (values) => {
        try {
          await axios.post(serverUrl + '/api/v1/auth/local', {
            email: values.email,
            password: values.password,
          });
        } catch (e) {
          setLoginError(intl.formatMessage(messages.loginerror));
        } finally {
          revalidate();
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
        handleChange,
        handleBlur,
        handleSubmit,
      }) => {
        return (
          <View>
            <View>
              <ThemedText className="-mt-1 mb-6 text-center text-lg font-bold text-neutral-200">
                {intl.formatMessage(messages.loginwithapp, {
                  appName: settings.currentSettings.applicationTitle,
                })}
              </ThemedText>

              <View className="mb-4 mt-1">
                <View className="form-input-field">
                  <TextInput
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder={`${intl.formatMessage(
                      messages.email
                    )} / ${intl.formatMessage(messages.username)}`}
                  />
                </View>
                {errors.email &&
                  touched.email &&
                  typeof errors.email === 'string' && (
                    <ThemedText className="mt-1.5 text-red-500">
                      {errors.email}
                    </ThemedText>
                  )}
              </View>
              <View className="mb-2 mt-1">
                <View className="form-input-field">
                  <TextInput
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    autoCapitalize="none"
                    secureTextEntry={true}
                    placeholder={intl.formatMessage(messages.password)}
                  />
                </View>
                <View className="flex flex-row">
                  {errors.password &&
                    touched.password &&
                    typeof errors.password === 'string' && (
                      <ThemedText className="mt-1.5 text-red-500">
                        {errors.password}
                      </ThemedText>
                    )}
                  <View className="flex-grow"></View>
                  {/* {passwordResetEnabled && (
                    <Link
                      href="/resetpassword"
                      className="pt-2 text-sm text-indigo-500 hover:text-indigo-400"
                    >
                      {intl.formatMessage(messages.forgotpassword)}
                    </Link>
                  )} */}
                </View>
              </View>
              {loginError && (
                <View className="mb-2 mt-1 sm:col-span-2 sm:mt-0">
                  <ThemedText className="mt-1.5 text-red-500">
                    {loginError}
                  </ThemedText>
                </View>
              )}
            </View>

            <Button
              buttonType="primary"
              disabled={isSubmitting || !isValid}
              className="mt-2 flex w-full flex-row items-center justify-center gap-2"
              onClick={handleSubmit}
            >
              <ArrowLeftOnRectangle color="#ffffff" />
              <ThemedText>
                {isSubmitting
                  ? intl.formatMessage(messages.signingin)
                  : intl.formatMessage(messages.signin)}
              </ThemedText>
            </Button>
          </View>
        );
      }}
    </Formik>
  );
};

export default LocalLogin;
