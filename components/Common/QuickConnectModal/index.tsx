import Alert from '@app/components/Common/Alert';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import Modal from '@app/components/Common/Modal';
import ThemedText from '@app/components/Common/ThemedText';
import { useQuickConnect } from '@app/hooks/useQuickConnect';
import getSeerrMessages from '@app/utils/getSeerrMessages';
import { useIntl } from 'react-intl';
import { View } from 'react-native';

const messages = getSeerrMessages('components.Common.QuickConnectModal');

interface QuickConnectModalProps {
  show: boolean;
  title: string;
  subTitle: string;
  cancelText: string;
  instructionsMessage: string;
  showInlineError?: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  onError?: (error: string) => void;
  authenticate: (secret: string) => Promise<void>;
}

const QuickConnectModal = ({
  show,
  title,
  subTitle,
  cancelText,
  instructionsMessage,
  showInlineError,
  onCancel,
  onSuccess,
  onError,
  authenticate,
}: QuickConnectModalProps) => {
  const intl = useIntl();

  const {
    code,
    isLoading,
    hasError,
    isExpired,
    errorMessage,
    initiateQuickConnect,
    cleanup,
  } = useQuickConnect({
    show,
    onSuccess,
    onError,
    authenticate,
  });

  const handleCancel = () => {
    cleanup();
    onCancel();
  };

  return (
    <Modal
      show={show}
      onCancel={handleCancel}
      title={title}
      subTitle={subTitle}
      cancelText={cancelText}
      {...(hasError || isExpired
        ? {
            okText: intl.formatMessage(messages.tryAgain),
            onOk: initiateQuickConnect,
          }
        : {})}
    >
      {showInlineError && errorMessage && (
        <View className="mb-4">
          <Alert type="error" title={errorMessage} />
        </View>
      )}

      {isLoading && (
        <View className="flex flex-col items-center justify-center py-8">
          <LoadingSpinner />
        </View>
      )}

      {!isLoading && !hasError && !isExpired && (
        <View className="flex flex-col items-center gap-4">
          <ThemedText className="text-center text-gray-300">
            {instructionsMessage}
          </ThemedText>

          <View className="flex flex-col items-center gap-2">
            <View className="rounded-lg bg-gray-700 px-8 py-4">
              <ThemedText
                className="text-4xl font-bold tracking-wider text-white"
                selectable
              >
                {code}
              </ThemedText>
            </View>
          </View>

          <View className="flex flex-row items-center gap-2">
            <LoadingSpinner size={12} />
            <ThemedText className="text-sm text-gray-400">
              {intl.formatMessage(messages.waitingForAuth)}
            </ThemedText>
          </View>
        </View>
      )}

      {hasError && (
        <View className="flex flex-col items-center gap-4 py-4">
          <View>
            <ThemedText className="text-center text-lg font-semibold text-red-500">
              {intl.formatMessage(messages.error)}
            </ThemedText>
            <ThemedText className="mt-2 text-center text-gray-300">
              {errorMessage}
            </ThemedText>
          </View>
        </View>
      )}

      {isExpired && (
        <View className="flex flex-col items-center gap-4 py-4">
          <View>
            <ThemedText className="text-center text-lg font-semibold text-yellow-500">
              {intl.formatMessage(messages.expired)}
            </ThemedText>
            <ThemedText className="mt-2 text-center text-gray-300">
              {intl.formatMessage(messages.expiredMessage)}
            </ThemedText>
          </View>
        </View>
      )}
    </Modal>
  );
};

export default QuickConnectModal;
