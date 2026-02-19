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
import Checkbox from 'expo-checkbox';
import { Formik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast/headless';
import { useIntl } from 'react-intl';
import { Linking, Pressable, View } from 'react-native';
import useSWR from 'swr';
import * as Yup from 'yup';

const messages = getSeerrMessages(
  'components.UserProfile.UserSettings.UserNotificationSettings'
);

const UserTelegramSettings = () => {
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
  const [checkboxFocused, setCheckboxFocused] = useState(false);

  const UserNotificationsTelegramSchema = Yup.object().shape({
    telegramChatId: Yup.string()
      .when('types', {
        is: (types: number) => !!types,
        then: Yup.string()
          .nullable()
          .required(intl.formatMessage(messages.validationTelegramChatId)),
        otherwise: Yup.string().nullable(),
      })
      .matches(
        /^-?\d+$/,
        intl.formatMessage(messages.validationTelegramChatId)
      ),
    telegramMessageThreadId: Yup.string()
      .when(['types'], {
        is: (enabled: boolean, types: number) => enabled && !!types,
        then: Yup.string()
          .nullable()
          .required(
            intl.formatMessage(messages.validationTelegramMessageThreadId)
          ),
        otherwise: Yup.string().nullable(),
      })
      .matches(
        /^\d+$/,
        intl.formatMessage(messages.validationTelegramMessageThreadId)
      ),
  });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <Formik
      initialValues={{
        telegramChatId: data?.telegramChatId,
        telegramMessageThreadId: data?.telegramMessageThreadId,
        telegramSendSilently: data?.telegramSendSilently,
        types: data?.notificationTypes.telegram ?? 0,
      }}
      validationSchema={UserNotificationsTelegramSchema}
      enableReinitialize
      onSubmit={async (values) => {
        try {
          await axios.post(
            `${serverUrl}/api/v1/user/${user?.id}/settings/notifications`,
            {
              pgpKey: data?.pgpKey,
              discordId: data?.discordId,
              pushbulletAccessToken: data?.pushbulletAccessToken,
              pushoverApplicationToken: data?.pushoverApplicationToken,
              pushoverUserKey: data?.pushoverUserKey,
              telegramChatId: values.telegramChatId,
              telegramMessageThreadId: values.telegramMessageThreadId,
              telegramSendSilently: values.telegramSendSilently,
              notificationTypes: {
                telegram: values.types,
              },
            }
          );
          toast.success(intl.formatMessage(messages.telegramsettingssaved));
        } catch (e) {
          toast.error(intl.formatMessage(messages.telegramsettingsfailed));
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
                    {intl.formatMessage(messages.telegramChatId)}
                  </ThemedText>
                  <ThemedText className="label-required ml-1 text-red-500">
                    *
                  </ThemedText>
                </View>
                {data?.telegramBotUsername && (
                  <ThemedText className="label-tip mb-1 block font-medium text-gray-500">
                    {intl.formatMessage(messages.telegramChatIdTipLong, {
                      TelegramBotLink: (msg: React.ReactNode) => (
                        <ThemedText
                          onPress={() =>
                            Linking.openURL(
                              `https://telegram.me/${data.telegramBotUsername}`
                            )
                          }
                        >
                          {msg}
                        </ThemedText>
                      ),
                      GetIdBotLink: (msg: React.ReactNode) => (
                        <ThemedText
                          onPress={() =>
                            Linking.openURL('https://telegram.me/get_id_bot')
                          }
                        >
                          {msg}
                        </ThemedText>
                      ),
                      code: (msg: React.ReactNode) => (
                        <ThemedText>{msg}</ThemedText>
                      ),
                    })}
                  </ThemedText>
                )}
              </View>
              <View className="form-input-area">
                <View className="form-input-field">
                  <TextInput
                    id="telegramChatId"
                    value={values.telegramChatId}
                    onChangeText={(text) =>
                      setFieldValue('telegramChatId', text)
                    }
                    onBlur={() => handleBlur('telegramChatId')}
                    autoCapitalize="none"
                  />
                </View>
                {errors.telegramChatId &&
                  touched.telegramChatId &&
                  typeof errors.telegramChatId === 'string' && (
                    <ThemedText className="error mt-2 text-sm text-red-500">
                      {errors.telegramChatId}
                    </ThemedText>
                  )}
              </View>
            </View>
            <View className="form-row">
              <View className="text-label">
                <ThemedText>
                  {intl.formatMessage(messages.telegramMessageThreadId)}
                </ThemedText>
                <ThemedText className="label-tip mb-1 block font-medium text-gray-500">
                  {intl.formatMessage(messages.telegramMessageThreadIdTip)}
                </ThemedText>
              </View>
              <View className="form-input-area">
                <View className="form-input-field">
                  <TextInput
                    id="telegramMessageThreadId"
                    value={values.telegramMessageThreadId}
                    onChangeText={(text) =>
                      setFieldValue('telegramMessageThreadId', text)
                    }
                    onBlur={() => handleBlur('telegramMessageThreadId')}
                    autoCapitalize="none"
                  />
                </View>
                {errors.telegramMessageThreadId &&
                  touched.telegramMessageThreadId &&
                  typeof errors.telegramMessageThreadId === 'string' && (
                    <ThemedText className="error mt-2 text-sm text-red-500">
                      {errors.telegramMessageThreadId}
                    </ThemedText>
                  )}
              </View>
            </View>
            <View className="form-row">
              <View className="form-input-area flex flex-row items-start">
                <View className="mt-2 flex h-5 flex-row items-center">
                  <Checkbox
                    value={values.telegramSendSilently}
                    onValueChange={(newValue) =>
                      setFieldValue('telegramSendSilently', newValue)
                    }
                    onFocus={() => setCheckboxFocused(true)}
                    onBlur={() => setCheckboxFocused(false)}
                    style={
                      checkboxFocused
                        ? { borderColor: '#4f46e5', borderWidth: 2 }
                        : {}
                    }
                    color={
                      checkboxFocused
                        ? '#6366f1'
                        : values.telegramSendSilently
                          ? '#4f46e5'
                          : '#ffffff'
                    }
                  />
                </View>
                <Pressable
                  onPress={() =>
                    setFieldValue(
                      'telegramSendSilently',
                      !values.telegramSendSilently
                    )
                  }
                >
                  <View className="checkbox-label ml-3 block text-sm leading-6">
                    <ThemedText>
                      {intl.formatMessage(messages.sendSilently)}
                    </ThemedText>
                    <ThemedText className="label-tip mb-1 block font-medium text-gray-500">
                      {intl.formatMessage(messages.sendSilentlyDescription)}
                    </ThemedText>
                  </View>
                </Pressable>
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

export default UserTelegramSettings;
