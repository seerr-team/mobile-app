import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { ArrowRightCircle } from '@nandorojo/heroicons/24/outline';
import { Link } from 'expo-router';
import { useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';
import ThemedText from '../Common/ThemedText';

interface ErrorProps {
  statusCode?: number;
}

const messages = getJellyseerrMessages('pages');

const Error = ({ statusCode }: ErrorProps) => {
  const intl = useIntl();

  const getErrorMessage = (statusCode?: number) => {
    switch (statusCode) {
      case 500:
        return intl.formatMessage(messages.internalservererror);
      case 503:
        return intl.formatMessage(messages.serviceunavailable);
      default:
        return statusCode
          ? intl.formatMessage(messages.somethingwentwrong)
          : intl.formatMessage(messages.oops);
    }
  };
  return (
    <View className="error-message">
      <View>
        <ThemedText className="mb-4 text-2xl">
          {statusCode
            ? intl.formatMessage(messages.errormessagewithcode, {
                statusCode,
                error: getErrorMessage(statusCode),
              })
            : getErrorMessage(statusCode)}
        </ThemedText>
      </View>
      <Link href="/(tabs)" asChild>
        <Pressable className="flex flex-row items-center gap-2">
          <ThemedText>{intl.formatMessage(messages.returnHome)}</ThemedText>
          <ArrowRightCircle width={24} height={24} color="#ffffff" />
        </Pressable>
      </Link>
    </View>
  );
};

export default Error;
