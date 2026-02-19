import Alert from '@/components/Common/Alert';
import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import TextInput from '@/components/Common/TextInput';
import ThemedText from '@/components/Common/ThemedText';
import ErrorPage from '@/components/ErrorPage';
import useServerUrl from '@/hooks/useServerUrl';
import { Permission, useUser } from '@/hooks/useUser';
import getSeerrMessages from '@/utils/getSeerrMessages';
import globalMessages from '@/utils/globalMessages';
import { ArrowDownOnSquare } from '@nandorojo/heroicons/24/outline';
import axios from 'axios';
import { Formik } from 'formik';
import toast from 'react-hot-toast/headless';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import useSWR from 'swr';
import * as Yup from 'yup';

const messages = getSeerrMessages(
  'components.UserProfile.UserSettings.UserPasswordChange'
);

const UserPasswordChange = () => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const { user: currentUser } = useUser();
  // const { user, hasPermission } = useUser({ id: Number(router.query.userId) });
  const { user, hasPermission } = useUser();
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<{ hasPassword: boolean }>(
    user ? `${serverUrl}/api/v1/user/${user?.id}/settings/password` : null
  );

  const PasswordChangeSchema = Yup.object().shape({
    currentPassword: Yup.lazy(() =>
      data?.hasPassword && currentUser?.id === user?.id
        ? Yup.string().required(
            intl.formatMessage(messages.validationCurrentPassword)
          )
        : Yup.mixed().optional()
    ),
    newPassword: Yup.string()
      .required(intl.formatMessage(messages.validationNewPassword))
      .min(8, intl.formatMessage(messages.validationNewPasswordLength)),
    confirmPassword: Yup.string()
      .required(intl.formatMessage(messages.validationConfirmPassword))
      .oneOf(
        [Yup.ref('newPassword'), null as any],
        intl.formatMessage(messages.validationConfirmPasswordSame)
      ),
  });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <ErrorPage statusCode={500} />;
  }

  if (
    currentUser?.id !== user?.id &&
    hasPermission(Permission.ADMIN) &&
    currentUser?.id !== 1
  ) {
    return (
      <>
        <View className="mb-6">
          <ThemedText className="heading">
            {intl.formatMessage(messages.password)}
          </ThemedText>
        </View>
        <Alert
          title={intl.formatMessage(messages.nopermissionDescription)}
          type="error"
        />
      </>
    );
  }

  return (
    <View className="px-4">
      <View className="mb-6">
        <ThemedText className="heading">
          {intl.formatMessage(messages.password)}
        </ThemedText>
      </View>
      <Formik
        initialValues={{
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }}
        validationSchema={PasswordChangeSchema}
        enableReinitialize
        onSubmit={async (values, { resetForm }) => {
          try {
            await axios.post(
              `${serverUrl}/api/v1/user/${user?.id}/settings/password`,
              {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword,
              }
            );

            toast.success(intl.formatMessage(messages.toastSettingsSuccess));
          } catch (e) {
            toast.error(
              intl.formatMessage(
                data.hasPassword && user?.id === currentUser?.id
                  ? messages.toastSettingsFailureVerifyCurrent
                  : messages.toastSettingsFailure
              )
            );
          } finally {
            revalidate();
            resetForm();
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
            <View className="section">
              {!data.hasPassword && (
                <Alert
                  type="warning"
                  title={intl.formatMessage(
                    user?.id === currentUser?.id
                      ? messages.noPasswordSetOwnAccount
                      : messages.noPasswordSet
                  )}
                />
              )}
              {data.hasPassword && user?.id === currentUser?.id && (
                <View className="form-row pb-6">
                  <ThemedText className="text-label mb-1 font-bold text-gray-400">
                    {intl.formatMessage(messages.currentpassword)}
                  </ThemedText>
                  <View className="form-input-area">
                    <View className="form-input-field">
                      <TextInput
                        onChangeText={handleChange('currentPassword')}
                        onBlur={handleBlur('currentPassword')}
                        value={values.currentPassword}
                        autoCapitalize="none"
                        secureTextEntry={true}
                      />
                    </View>
                    {errors.currentPassword &&
                      touched.currentPassword &&
                      typeof errors.currentPassword === 'string' && (
                        <ThemedText className="mt-1.5 text-red-500">
                          {errors.currentPassword}
                        </ThemedText>
                      )}
                  </View>
                </View>
              )}
              <View className="form-row">
                <ThemedText className="text-label mb-1 font-bold text-gray-400">
                  {intl.formatMessage(messages.newpassword)}
                </ThemedText>
                <View className="form-input-area">
                  <View className="form-input-field">
                    <TextInput
                      onChangeText={handleChange('newPassword')}
                      onBlur={handleBlur('newPassword')}
                      value={values.newPassword}
                      autoCapitalize="none"
                      secureTextEntry={true}
                    />
                  </View>
                  {errors.newPassword &&
                    touched.newPassword &&
                    typeof errors.newPassword === 'string' && (
                      <ThemedText className="mt-1.5 text-red-500">
                        {errors.newPassword}
                      </ThemedText>
                    )}
                </View>
              </View>
              <View className="form-row">
                <ThemedText className="text-label mb-1 font-bold text-gray-400">
                  {intl.formatMessage(messages.confirmpassword)}
                </ThemedText>
                <View className="form-input-area">
                  <View className="form-input-field">
                    <TextInput
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      value={values.confirmPassword}
                      autoCapitalize="none"
                      secureTextEntry={true}
                    />
                  </View>
                  {errors.confirmPassword &&
                    touched.confirmPassword &&
                    typeof errors.confirmPassword === 'string' && (
                      <ThemedText className="mt-1.5 text-red-500">
                        {errors.confirmPassword}
                      </ThemedText>
                    )}
                </View>
              </View>
              <View className="actions">
                <View className="flex flex-row justify-end">
                  <View className="ml-3 inline-flex flex-row rounded-md shadow-sm">
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
    </View>
  );
};

export default UserPasswordChange;
