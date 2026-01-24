import ThemedText from '@/components/Common/ThemedText';
import { sliderTitles } from '@/components/Discover/constants';
import RequestCard, {
  Placeholder as RequestCardPlaceholder,
} from '@/components/RequestCard';
import Slider from '@/components/Slider';
import useServerUrl from '@/hooks/useServerUrl';
import type { RequestResultsResponse } from '@/seerr/server/interfaces/api/requestInterfaces';
import { VisibilitySensor } from '@futurejj/react-native-visibility-sensor';
import { ArrowRightCircle } from '@nandorojo/heroicons/24/outline';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';
import useSWR from 'swr';

export interface RecentRequestsSliderProps {
  lastRefresh?: Date;
}

const RecentRequestsSlider = ({ lastRefresh }: RecentRequestsSliderProps) => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const {
    data: requests,
    error: requestError,
    mutate,
  } = useSWR<RequestResultsResponse>(
    isVisible || hasBeenVisible
      ? serverUrl + '/api/v1/request?filter=all&take=10&sort=modified&skip=0'
      : null,
    {
      revalidateOnMount: true,
    }
  );

  useEffect(() => {
    if (requests && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [requests, hasBeenVisible]);

  useEffect(() => {
    mutate();
  }, [lastRefresh, mutate]);

  if (requests && requests.results.length === 0 && !requestError) {
    return null;
  }

  return (
    <VisibilitySensor onChange={setIsVisible}>
      <View className="mt-2 px-4">
        <Link href="/requests?filter=all" asChild>
          <Pressable className="group py-4">
            <View className="flex min-w-0 flex-row items-center gap-2">
              <ThemedText className="truncate text-2xl font-bold text-white group-focus:text-gray-400">
                {intl.formatMessage(sliderTitles.recentrequests)}
              </ThemedText>
              <ArrowRightCircle color="#ffffff" />
            </View>
          </Pressable>
        </Link>
      </View>
      <Slider
        sliderKey="requests"
        isLoading={!requests}
        items={(requests?.results ?? []).map((request) => (
          <RequestCard
            key={`request-slider-item-${request.id}`}
            request={request}
          />
        ))}
        placeholder={<RequestCardPlaceholder />}
      />
    </VisibilitySensor>
  );
};

export default RecentRequestsSlider;
