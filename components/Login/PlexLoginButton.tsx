import PlexIcon from '@/assets/services/plex.png';
import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ThemedText from '@/components/Common/ThemedText';
import usePlexLogin from '@/hooks/usePlexLogin';
import getSeerrMessages from '@/utils/getSeerrMessages';
import { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Image, View } from 'react-native';

const messages = getSeerrMessages('components.Login');

interface PlexLoginButtonProps {
  onAuthToken: (authToken: string) => void;
  isProcessing?: boolean;
  onError?: (message: string) => void;
  large?: boolean;
}

const PlexLoginButton = ({
  onAuthToken,
  onError,
  isProcessing,
  large,
}: PlexLoginButtonProps) => {
  const { loading, login } = usePlexLogin({ onAuthToken, onError });

  return (
    <Button
      forceClassName="flex w-full flex-row items-center justify-center px-4 py-2 rounded-md border border-[#cc7b19] bg-[rgba(204,123,25,0.3)] hover:border-[#cc7b19] hover:bg-[rgba(204,123,25,0.7)] disabled:opacity-50"
      onClick={login}
      disabled={loading || isProcessing}
      data-testid="plex-login-button"
    >
      {loading && (
        <View className="absolute right-0 mr-4 h-4 w-4">
          <LoadingSpinner />
        </View>
      )}

      {large ? (
        <FormattedMessage
          {...messages.loginwithapp}
          values={{
            appName: (
              <Image
                source={PlexIcon}
                className="ml-[0.35em]"
                style={{
                  width: 32,
                  height: 20,
                  objectFit: 'cover',
                  marginTop: 2,
                }}
              />
            ),
          }}
        >
          {(chunks) => (
            <>
              {chunks.map((c, index) =>
                typeof c === 'string' ? (
                  <ThemedText key={index}>{c}</ThemedText>
                ) : (
                  <Fragment key={index}>{c}</Fragment>
                )
              )}
            </>
          )}
        </FormattedMessage>
      ) : (
        <Image
          source={PlexIcon}
          style={{ width: 32, height: 20, objectFit: 'contain' }}
        />
      )}
    </Button>
  );
};

export default PlexLoginButton;
