import ProgressCircle from '@/components/Common/ProgressCircle';
import ThemedText from '@/components/Common/ThemedText';
import type { QuotaStatus } from '@/jellyseerr/server/interfaces/api/userInterfaces';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { ChevronDown, ChevronUp } from '@nandorojo/heroicons/24/solid';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';

const messages = getJellyseerrMessages('components.RequestModal.QuotaDisplay');

interface QuotaDisplayProps {
  quota?: QuotaStatus;
  mediaType: 'movie' | 'tv';
  userOverride?: number | null;
  remaining?: number;
  overLimit?: number;
}

const QuotaDisplay = ({
  quota,
  mediaType,
  userOverride,
  remaining,
  overLimit,
}: QuotaDisplayProps) => {
  const intl = useIntl();
  const [showDetails, setShowDetails] = useState(false);
  return (
    <Pressable
      className="my-4 flex flex-col rounded-md border border-gray-700 p-4 backdrop-blur"
      onPress={() => setShowDetails((s) => !s)}
      tabIndex={0}
    >
      <View className="flex flex-row items-center">
        <ProgressCircle
          className="h-8 w-8"
          progress={Math.round(
            ((remaining ?? quota?.remaining ?? 0) / (quota?.limit ?? 1)) * 100
          )}
          useHeatLevel
        />
        <View
          className={`flex flex-row items-end ${
            (remaining ?? quota?.remaining ?? 0) <= 0 || quota?.restricted
              ? 'text-red-500'
              : ''
          }`}
        >
          <ThemedText className="ml-2 text-lg">
            {overLimit !== undefined
              ? intl.formatMessage(messages.notenoughseasonrequests)
              : intl.formatMessage(messages.requestsremaining, {
                  remaining: remaining ?? quota?.remaining ?? 0,
                  type: intl.formatMessage(
                    mediaType === 'movie' ? messages.movie : messages.season
                  ),
                  strong: (msg: React.ReactNode) => (
                    <ThemedText className="font-bold">{msg}</ThemedText>
                  ),
                })}
          </ThemedText>
        </View>
        <View className="flex flex-1 flex-row justify-end">
          {showDetails ? (
            <ChevronUp color="#ffffff" width={24} height={24} />
          ) : (
            <ChevronDown color="#ffffff" width={24} height={24} />
          )}
        </View>
      </View>
      {showDetails && (
        <View className="mt-4">
          {overLimit !== undefined && (
            <ThemedText className="mb-2">
              {intl.formatMessage(
                userOverride
                  ? messages.requiredquotaUser
                  : messages.requiredquota,
                {
                  seasons: overLimit,
                  strong: (msg: React.ReactNode) => (
                    <ThemedText className="font-bold">{msg}</ThemedText>
                  ),
                }
              )}
            </ThemedText>
          )}
          <ThemedText>
            {intl.formatMessage(
              userOverride
                ? messages.allowedRequestsUser
                : messages.allowedRequests,
              {
                limit: quota?.limit,
                days: quota?.days,
                type: intl.formatMessage(
                  mediaType === 'movie'
                    ? messages.movielimit
                    : messages.seasonlimit,
                  { limit: quota?.limit }
                ),
                strong: (msg: React.ReactNode) => (
                  <ThemedText className="font-bold">{msg}</ThemedText>
                ),
              }
            )}
          </ThemedText>
          <ThemedText className="mt-2">
            {intl.formatMessage(
              userOverride ? messages.quotaLinkUser : messages.quotaLink,
              {
                ProfileLink: (msg: React.ReactNode) => (
                  <Link
                    href={userOverride ? `/users/${userOverride}` : '/profile'}
                    className="text-white transition duration-300 hover:underline"
                  >
                    {msg}
                  </Link>
                ),
              }
            )}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
};

export default QuotaDisplay;
