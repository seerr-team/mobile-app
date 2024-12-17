import Button from '@/components/Common/Button';
import TextInput from '@/components/Common/TextInput';
import ThemedText from '@/components/Common/ThemedText';
import type { RootState } from '@/store';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { toast } from '@backpackapp-io/react-native-toast';
import { router } from 'expo-router';
import { Formik } from 'formik';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';

const messages = getJellyseerrMessages('components.Login');

const LocalLogin = () => {
  const intl = useIntl();
  const serverUrl = useSelector(
    (state: RootState) => state.appSettings.serverUrl
  );

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required(
      intl.formatMessage(messages.validationemailrequired)
    ),
    password: Yup.string().required(
      intl.formatMessage(messages.validationpasswordrequired)
    ),
  });

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
      }}
      validationSchema={LoginSchema}
      onSubmit={async (values) => {
        try {
          const res = await fetch(`${serverUrl}/api/v1/auth/local`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: values.email,
              password: values.password,
            }),
          });
          if (!res.ok) throw new Error();
          router.replace('/(tabs)');
        } catch (e) {
          toast.error(intl.formatMessage(messages.loginerror));
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
          <View>
            <View>
              <ThemedText className="font-bold text-gray-400">
                {intl.formatMessage(messages.email) +
                  ' / ' +
                  intl.formatMessage(messages.username)}
              </ThemedText>
              <View className="mb-2 mt-1 sm:col-span-2 sm:mt-0">
                <View className="form-input-field">
                  <TextInput
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
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
              <ThemedText className="font-bold text-gray-400">
                {intl.formatMessage(messages.password)}
              </ThemedText>
              <View className="mb-2 mt-1 sm:col-span-2 sm:mt-0">
                <View className="form-input-field">
                  <TextInput
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    autoCapitalize="none"
                    secureTextEntry={true}
                  />
                </View>
                {errors.password &&
                  touched.password &&
                  typeof errors.password === 'string' && (
                    <ThemedText className="mt-1.5 text-red-500">
                      {errors.password}
                    </ThemedText>
                  )}
              </View>
            </View>
            <View className="mt-8 border-t border-gray-700 pt-5">
              <View className="flex flex-row-reverse justify-between">
                <View className="inline-flex rounded-md shadow-sm">
                  <Button
                    disabled={isSubmitting || !isValid}
                    onClick={handleSubmit}
                  >
                    {isSubmitting
                      ? intl.formatMessage(messages.signingin)
                      : intl.formatMessage(messages.signin)}
                  </Button>
                </View>
                {/* {passwordResetEnabled && (
                <span className="inline-flex rounded-md shadow-sm">
                  <Link href="/resetpassword" passHref legacyBehavior>
                    <Button as="a" buttonType="ghost">
                      <LifebuoyIcon />
                      <span>
                        {intl.formatMessage(messages.forgotpassword)}
                      </span>
                    </Button>
                  </Link>
                </span>
              )} */}
              </View>
            </View>
          </View>
        );
      }}
    </Formik>
  );
};

export default LocalLogin;
