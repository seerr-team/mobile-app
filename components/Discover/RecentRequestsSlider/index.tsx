import ThemedText from '@/components/Common/ThemedText';
import { sliderTitles } from '@/components/Discover/constants';
import RequestCard, {
  Placeholder as RequestCardPlaceholder,
} from '@/components/RequestCard';
import Slider from '@/components/Slider';
import type { RequestResultsResponse } from '@/jellyseerr/server/interfaces/api/requestInterfaces';
import type { RootState } from '@/store';
import { ArrowRightCircle } from '@nandorojo/heroicons/24/outline';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';
import { useSelector } from 'react-redux';

const RecentRequestsSlider = () => {
  const serverUrl = useSelector(
    (state: RootState) => state.appSettings.serverUrl
  );
  const intl = useIntl();
  const [requests, setRequests] = useState<RequestResultsResponse | null>(null);
  const [requestError, setRequestError] = useState('');

  async function fetchRequests() {
    try {
      const response = await fetch(
        serverUrl + '/api/v1/request?filter=all&take=10&sort=modified&skip=0'
      );
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      setRequestError((error as Error).message);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  if (requests && requests.results.length === 0 && !requestError) {
    return null;
  }

  return (
    <>
      <View className="slider-header px-4">
        <Link href="/requests?filter=all" className="slider-title">
          <Pressable>
            <View className="flex min-w-0 flex-row items-center gap-2 pr-16">
              <ThemedText className="truncate text-2xl font-bold">
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
    </>
  );
};

export default RecentRequestsSlider;
