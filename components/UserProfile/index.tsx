import ImageFader from '@/components/Common/ImageFader';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ProgressCircle from '@/components/Common/ProgressCircle';
import ThemedText from '@/components/Common/ThemedText';
import ErrorPage from '@/components/ErrorPage';
import RequestCard, {
  Placeholder as RequestCardPlaceholder,
} from '@/components/RequestCard';
import Slider from '@/components/Slider';
import TmdbTitleCard from '@/components/TitleCard/TmdbTitleCard';
import ProfileHeader from '@/components/UserProfile/ProfileHeader';
import useServerUrl from '@/hooks/useServerUrl';
import { Permission, UserType, useUser } from '@/hooks/useUser';
import type { WatchlistResponse } from '@/seerr/server/interfaces/api/discoverInterfaces';
import type {
  QuotaResponse,
  UserRequestsResponse,
  UserWatchDataResponse,
} from '@/seerr/server/interfaces/api/userInterfaces';
import type { MovieDetails } from '@/seerr/server/models/Movie';
import type { TvDetails } from '@/seerr/server/models/Tv';
import getSeerrMessages from '@/utils/getSeerrMessages';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import useSWR from 'swr';

const messages = getSeerrMessages('components.UserProfile');

type MediaTitle = MovieDetails | TvDetails;

const UserProfile = () => {
  const serverUrl = useServerUrl();
  const intl = useIntl();
  const { user, error } = useUser({
    // id: Number(router.query.userId),
  });
  const { user: currentUser, hasPermission: currentHasPermission } = useUser();
  const [availableTitles, setAvailableTitles] = useState<
    Record<number, MediaTitle>
  >({});

  const { data: requests, error: requestError } = useSWR<UserRequestsResponse>(
    user &&
      (user.id === currentUser?.id ||
        currentHasPermission(
          [Permission.MANAGE_REQUESTS, Permission.REQUEST_VIEW],
          { type: 'or' }
        ))
      ? `${serverUrl}/api/v1/user/${user?.id}/requests?take=10&skip=0`
      : null
  );
  const { data: quota } = useSWR<QuotaResponse>(
    user &&
      (user.id === currentUser?.id ||
        currentHasPermission(
          [Permission.MANAGE_USERS, Permission.MANAGE_REQUESTS],
          { type: 'and' }
        ))
      ? `${serverUrl}/api/v1/user/${user.id}/quota`
      : null
  );
  const { data: watchData, error: watchDataError } =
    useSWR<UserWatchDataResponse>(
      user?.userType === UserType.PLEX &&
        (user.id === currentUser?.id || currentHasPermission(Permission.ADMIN))
        ? `${serverUrl}/api/v1/user/${user.id}/watch_data`
        : null
    );

  const { data: watchlistItems, error: watchlistError } =
    useSWR<WatchlistResponse>(
      user?.id === currentUser?.id ||
        currentHasPermission(
          [Permission.MANAGE_REQUESTS, Permission.WATCHLIST_VIEW],
          {
            type: 'or',
          }
        )
        ? `${serverUrl}/api/v1/user/${user?.id}/watchlist`
        : null,
      {
        revalidateOnMount: true,
      }
    );

  const updateAvailableTitles = (requestId: number, mediaTitle: MediaTitle) => {
    setAvailableTitles((titles) => {
      if (titles[requestId]) {
        return titles;
      }
      return {
        ...titles,
        [requestId]: mediaTitle,
      };
    });
  };

  useEffect(() => {
    setAvailableTitles({});
  }, [user?.id]);

  if (!user && !error) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <ErrorPage statusCode={404} />;
  }

  const watchlistSliderTitle = intl.formatMessage(
    user.userType === UserType.PLEX
      ? messages.plexwatchlist
      : messages.localWatchlist,
    { username: user.displayName }
  );

  return (
    <ScrollView contentContainerClassName="pb-4">
      {Object.keys(availableTitles).length > 0 && (
        <View className="absolute inset-0 -z-10 h-96 w-full">
          <ImageFader
            key={user.id}
            isDarker
            backgroundImages={Object.values(availableTitles)
              .filter((media) => media.backdropPath)
              .map(
                (media) =>
                  `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${media.backdropPath}`
              )
              .slice(0, 6)}
          />
        </View>
      )}
      <ProfileHeader user={user} />
      {quota &&
        (user.id === currentUser?.id ||
          currentHasPermission(
            [Permission.MANAGE_USERS, Permission.MANAGE_REQUESTS],
            { type: 'and' }
          )) && (
          <View className="relative z-40 px-4">
            <View className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
              <View className="overflow-hidden rounded-lg bg-gray-800 bg-opacity-50 px-4 py-5 shadow ring-1 ring-gray-700 sm:p-6">
                <ThemedText className="truncate text-sm font-bold text-gray-300">
                  {intl.formatMessage(messages.totalrequests)}
                </ThemedText>
                <View className="mt-1">
                  <Link
                    href={
                      currentHasPermission(
                        [Permission.MANAGE_REQUESTS, Permission.REQUEST_VIEW],
                        { type: 'or' }
                      )
                        ? `/users/${user?.id}/requests?filter=all`
                        : '/requests'
                    }
                  >
                    <ThemedText className="text-3xl font-semibold text-white">
                      {intl.formatNumber(user.requestCount)}
                    </ThemedText>
                  </Link>
                </View>
              </View>
              <View
                className={`overflow-hidden rounded-lg bg-gray-800 bg-opacity-50 px-4 py-5 shadow ring-1 ${
                  quota.movie.restricted
                    ? 'bg-gradient-to-t from-red-900 to-transparent ring-red-500'
                    : 'ring-gray-700'
                } sm:p-6`}
              >
                <ThemedText
                  className={`truncate text-sm font-bold ${
                    quota.movie.restricted ? 'text-red-500' : 'text-gray-300'
                  }`}
                >
                  {quota.movie.limit
                    ? intl.formatMessage(messages.pastdays, {
                        type: intl.formatMessage(messages.movierequests),
                        days: quota?.movie.days,
                      })
                    : intl.formatMessage(messages.movierequests)}
                </ThemedText>
                <View
                  className={`mt-1 flex flex-row items-center gap-2 text-sm ${
                    quota.movie.restricted ? 'text-red-500' : 'text-white'
                  }`}
                >
                  {quota.movie.limit ? (
                    <>
                      <ProgressCircle
                        progress={Math.round(
                          ((quota?.movie.remaining ?? 0) /
                            (quota?.movie.limit ?? 1)) *
                            100
                        )}
                        useHeatLevel
                        className="h-8 w-8"
                      />
                      <ThemedText>
                        {intl.formatMessage(messages.requestsperdays, {
                          limit: (
                            <ThemedText
                              className="text-3xl font-semibold"
                              key={`movie-${quota.movie.remaining}-${quota.movie.limit}`}
                            >
                              {intl.formatMessage(messages.limit, {
                                remaining: quota.movie.remaining,
                                limit: quota.movie.limit,
                              })}
                            </ThemedText>
                          ),
                        })}
                      </ThemedText>
                    </>
                  ) : (
                    <ThemedText className="text-3xl font-semibold">
                      {intl.formatMessage(messages.unlimited)}
                    </ThemedText>
                  )}
                </View>
              </View>
              <View
                className={`overflow-hidden rounded-lg bg-gray-800 bg-opacity-50 px-4 py-5 shadow ring-1 ${
                  quota.tv.restricted
                    ? 'bg-gradient-to-t from-red-900 to-transparent ring-red-500'
                    : 'ring-gray-700'
                } sm:p-6`}
              >
                <ThemedText
                  className={`truncate text-sm font-bold ${
                    quota.tv.restricted ? 'text-red-500' : 'text-gray-300'
                  }`}
                >
                  {quota.tv.limit
                    ? intl.formatMessage(messages.pastdays, {
                        type: intl.formatMessage(messages.seriesrequest),
                        days: quota?.tv.days,
                      })
                    : intl.formatMessage(messages.seriesrequest)}
                </ThemedText>
                <View
                  className={`mt-1 flex flex-row items-center gap-2 text-sm ${
                    quota.tv.restricted ? 'text-red-500' : 'text-white'
                  }`}
                >
                  {quota.tv.limit ? (
                    <>
                      <ProgressCircle
                        progress={Math.round(
                          ((quota?.tv.remaining ?? 0) /
                            (quota?.tv.limit ?? 1)) *
                            100
                        )}
                        useHeatLevel
                        className="h-8 w-8"
                      />
                      <ThemedText>
                        {intl.formatMessage(messages.requestsperdays, {
                          limit: (
                            <ThemedText
                              className="text-3xl font-semibold"
                              key={`tv-${quota.tv.remaining}-${quota.tv.limit}`}
                            >
                              {intl.formatMessage(messages.limit, {
                                remaining: quota.tv.remaining,
                                limit: quota.tv.limit,
                              })}
                            </ThemedText>
                          ),
                        })}
                      </ThemedText>
                    </>
                  ) : (
                    <ThemedText className="text-3xl font-semibold">
                      {intl.formatMessage(messages.unlimited)}
                    </ThemedText>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}
      {(user.id === currentUser?.id ||
        currentHasPermission(
          [Permission.MANAGE_REQUESTS, Permission.REQUEST_VIEW],
          { type: 'or' }
        )) &&
        (!requests || !!requests.results.length) &&
        !requestError && (
          <>
            <View className="slider-header px-4">
              <Link
                href={
                  currentHasPermission(
                    [Permission.MANAGE_REQUESTS, Permission.REQUEST_VIEW],
                    { type: 'or' }
                  )
                    ? `/users/${user?.id}/requests?filter=all`
                    : '/requests'
                }
                className="slider-title"
              >
                <ThemedText>
                  {intl.formatMessage(messages.recentrequests)}
                </ThemedText>
              </Link>
            </View>
            <Slider
              sliderKey="requests"
              isLoading={!requests}
              items={(requests?.results ?? []).map((request) => (
                <RequestCard
                  key={`request-slider-item-${request.id}`}
                  request={request}
                  onTitleData={updateAvailableTitles}
                />
              ))}
              placeholder={<RequestCardPlaceholder />}
            />
          </>
        )}
      {(user.id === currentUser?.id ||
        currentHasPermission(
          [Permission.MANAGE_REQUESTS, Permission.WATCHLIST_VIEW],
          { type: 'or' }
        )) &&
        (!watchlistItems ||
          !!watchlistItems.results.length ||
          (user.id === currentUser?.id &&
            (user.settings?.watchlistSyncMovies ||
              user.settings?.watchlistSyncTv))) &&
        !watchlistError && (
          <>
            <View className="slider-header px-4">
              <Link
                href={
                  user.id === currentUser?.id
                    ? '/profile/watchlist'
                    : `/users/${user.id}/watchlist`
                }
                className="slider-title"
              >
                <ThemedText>{watchlistSliderTitle}</ThemedText>
              </Link>
            </View>
            <Slider
              sliderKey="watchlist"
              isLoading={!watchlistItems}
              isEmpty={!!watchlistItems && watchlistItems.results.length === 0}
              emptyMessage={intl.formatMessage(messages.emptywatchlist, {
                PlexWatchlistSupportLink: (msg: React.ReactNode) => (
                  <Pressable
                    onPress={() => {
                      Linking.openURL(
                        'https://support.plex.tv/articles/universal-watchlist/'
                      );
                    }}
                    className="text-white transition duration-300 hover:underline"
                    key="plex-watchlist-support-link"
                  >
                    {msg}
                  </Pressable>
                ),
              })}
              items={watchlistItems?.results.map((item) => (
                <TmdbTitleCard
                  id={item.tmdbId}
                  key={`watchlist-slider-item-${item.ratingKey}`}
                  tmdbId={item.tmdbId}
                  type={item.mediaType}
                />
              ))}
            />
          </>
        )}
      {user.userType === UserType.PLEX &&
        (user.id === currentUser?.id ||
          currentHasPermission(Permission.ADMIN)) &&
        (!watchData || !!watchData.recentlyWatched?.length) &&
        !watchDataError && (
          <>
            <View className="slider-header px-4">
              <View className="slider-title">
                <ThemedText>
                  {intl.formatMessage(messages.recentlywatched)}
                </ThemedText>
              </View>
            </View>
            <Slider
              sliderKey="media"
              isLoading={!watchData}
              items={watchData?.recentlyWatched?.map((item) => (
                <TmdbTitleCard
                  key={`media-slider-item-${item.id}`}
                  id={item.id}
                  tmdbId={item.tmdbId}
                  tvdbId={item.tvdbId}
                  type={item.mediaType}
                />
              ))}
            />
          </>
        )}
    </ScrollView>
  );
};

export default UserProfile;
