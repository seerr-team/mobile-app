import { View } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import ThemedText from '@/components/Common/ThemedText';
import TextInput from '@/components/Common/TextInput';
import Button from '@/components/Common/Button';
import { Field, Formik } from 'formik';
import { toast } from '@backpackapp-io/react-native-toast';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import type { RootState } from '@/store';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';

const messages = getJellyseerrMessages('components.Login');

const LocalLogin = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const serverUrl = useSelector((state: RootState) => state.appSettings.serverUrl);

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
        } catch (e) {
          toast.error(intl.formatMessage(messages.loginerror));
        }
      }}
    >
      {({ errors, touched, isSubmitting, isValid, values, handleChange, handleBlur, handleSubmit }) => {
        return <View>
          <View>
            <ThemedText className="font-bold text-gray-400">
              {intl.formatMessage(messages.email) +
                ' / ' +
                intl.formatMessage(messages.username)}
            </ThemedText>
            <View className="mt-1 mb-2 sm:col-span-2 sm:mt-0">
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
                  <ThemedText className="text-red-500 mt-1.5">{errors.email}</ThemedText>
                )}
            </View>
            <ThemedText className="font-bold text-gray-400">
              {intl.formatMessage(messages.password)}
            </ThemedText>
            <View className="mt-1 mb-2 sm:col-span-2 sm:mt-0">
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
                  <ThemedText className="text-red-500 mt-1.5">{errors.password}</ThemedText>
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
        </View>;
      }}
    </Formik>
  );
};

export default LocalLogin;
