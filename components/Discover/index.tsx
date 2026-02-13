import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { sliderTitles } from '@/components/Discover/constants';
import MovieGenreSlider from '@/components/Discover/MovieGenreSlider';
import NetworkSlider from '@/components/Discover/NetworkSlider';
import PlexWatchlistSlider from '@/components/Discover/PlexWatchlistSlider';
import RecentlyAddedSlider from '@/components/Discover/RecentlyAddedSlider';
import RecentRequestsSlider from '@/components/Discover/RecentRequestsSlider';
import StudioSlider from '@/components/Discover/StudioSlider';
import TvGenreSlider from '@/components/Discover/TvGenreSlider';
import MediaSlider from '@/components/MediaSlider';
import { encodeURIExtraParams } from '@/hooks/useDiscover';
import useServerUrl from '@/hooks/useServerUrl';
import { DiscoverSliderType } from '@/seerr/server/constants/discover';
import type DiscoverSlider from '@/seerr/server/entity/DiscoverSlider';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { RefreshControl, ScrollView, View } from 'react-native';
import useSWR from 'swr';

const Discover = () => {
  const intl = useIntl();
  const serverUrl = useServerUrl();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const {
    data: discoverData,
    error: discoverError,
    mutate,
  } = useSWR<DiscoverSlider[]>(serverUrl + '/api/v1/settings/discover');

  const now = new Date();
  const offset = now.getTimezoneOffset();
  const upcomingDate = new Date(now.getTime() - offset * 60 * 1000)
    .toISOString()
    .split('T')[0];

  if (!discoverData && !discoverError) {
    return (
      <View className="flex flex-1 flex-col justify-center">
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerClassName="pb-4"
      refreshControl={
        <RefreshControl
          refreshing={!discoverData && !discoverError}
          onRefresh={() => {
            mutate();
            setLastRefresh(new Date());
          }}
          colors={['white']}
          progressBackgroundColor={'black'}
          progressViewOffset={32}
        />
      }
    >
      {discoverData?.map((slider, index) => {
        if (!slider.enabled) {
          return null;
        }

        let sliderComponent: React.ReactElement = <></>;

        switch (slider.type) {
          case DiscoverSliderType.RECENTLY_ADDED:
            sliderComponent = <RecentlyAddedSlider lastRefresh={lastRefresh} />;
            break;
          case DiscoverSliderType.RECENT_REQUESTS:
            sliderComponent = (
              <RecentRequestsSlider lastRefresh={lastRefresh} />
            );
            break;
          case DiscoverSliderType.PLEX_WATCHLIST:
            sliderComponent = <PlexWatchlistSlider lastRefresh={lastRefresh} />;
            break;
          case DiscoverSliderType.TRENDING:
            sliderComponent = (
              <MediaSlider
                sliderKey="trending"
                title={intl.formatMessage(sliderTitles.trending)}
                url="/api/v1/discover/trending"
                linkUrl="/discover_trending"
              />
            );
            break;
          case DiscoverSliderType.POPULAR_MOVIES:
            sliderComponent = (
              <MediaSlider
                sliderKey="popular-movies"
                title={intl.formatMessage(sliderTitles.popularmovies)}
                url="/api/v1/discover/movies"
                linkUrl="/discover_movies"
              />
            );
            break;
          case DiscoverSliderType.MOVIE_GENRES:
            sliderComponent = <MovieGenreSlider />;
            break;
          case DiscoverSliderType.UPCOMING_MOVIES:
            sliderComponent = (
              <MediaSlider
                sliderKey="upcoming"
                title={intl.formatMessage(sliderTitles.upcoming)}
                linkUrl={`/discover_movies?primaryReleaseDateGte=${upcomingDate}`}
                url="/api/v1/discover/movies"
                extraParams={`primaryReleaseDateGte=${upcomingDate}`}
              />
            );
            break;
          case DiscoverSliderType.STUDIOS:
            sliderComponent = <StudioSlider />;
            break;
          case DiscoverSliderType.POPULAR_TV:
            sliderComponent = (
              <MediaSlider
                sliderKey="popular-tv"
                title={intl.formatMessage(sliderTitles.populartv)}
                url="/api/v1/discover/tv"
                linkUrl="/discover_tv"
              />
            );
            break;
          case DiscoverSliderType.TV_GENRES:
            sliderComponent = <TvGenreSlider />;
            break;
          case DiscoverSliderType.UPCOMING_TV:
            sliderComponent = (
              <MediaSlider
                sliderKey="upcoming-tv"
                title={intl.formatMessage(sliderTitles.upcomingtv)}
                linkUrl={`/discover_tv?firstAirDateGte=${upcomingDate}`}
                url="/api/v1/discover/tv"
                extraParams={`firstAirDateGte=${upcomingDate}`}
              />
            );
            break;
          case DiscoverSliderType.NETWORKS:
            sliderComponent = <NetworkSlider />;
            break;
          case DiscoverSliderType.TMDB_MOVIE_KEYWORD:
            sliderComponent = (
              <MediaSlider
                sliderKey={`custom-slider-${slider.id}`}
                title={slider.title ?? ''}
                url="/api/v1/discover/movies"
                extraParams={
                  slider.data
                    ? `keywords=${encodeURIExtraParams(slider.data)}`
                    : ''
                }
                linkUrl={`/discover_movies?keywords=${slider.data}`}
              />
            );
            break;
          case DiscoverSliderType.TMDB_TV_KEYWORD:
            sliderComponent = (
              <MediaSlider
                sliderKey={`custom-slider-${slider.id}`}
                title={slider.title ?? ''}
                url="/api/v1/discover/tv"
                extraParams={
                  slider.data
                    ? `keywords=${encodeURIExtraParams(slider.data)}`
                    : ''
                }
                linkUrl={`/discover_tv?keywords=${slider.data}`}
              />
            );
            break;
          case DiscoverSliderType.TMDB_MOVIE_GENRE:
            sliderComponent = (
              <MediaSlider
                sliderKey={`custom-slider-${slider.id}`}
                title={slider.title ?? ''}
                url={`/api/v1/discover/movies`}
                extraParams={`genre=${slider.data}`}
                linkUrl={`/discover_movies?genre=${slider.data}`}
              />
            );
            break;
          case DiscoverSliderType.TMDB_TV_GENRE:
            sliderComponent = (
              <MediaSlider
                sliderKey={`custom-slider-${slider.id}`}
                title={slider.title ?? ''}
                url={`/api/v1/discover/tv`}
                extraParams={`genre=${slider.data}`}
                linkUrl={`/discover_tv?genre=${slider.data}`}
              />
            );
            break;
          case DiscoverSliderType.TMDB_STUDIO:
            sliderComponent = (
              <MediaSlider
                sliderKey={`custom-slider-${slider.id}`}
                title={slider.title ?? ''}
                url={`/api/v1/discover/movies/studio/${slider.data}`}
                linkUrl={`/discover/movies/studio/${slider.data}`}
              />
            );
            break;
          case DiscoverSliderType.TMDB_NETWORK:
            sliderComponent = (
              <MediaSlider
                sliderKey={`custom-slider-${slider.id}`}
                title={slider.title ?? ''}
                url={`/api/v1/discover/tv/network/${slider.data}`}
                linkUrl={`/discover/tv/network/${slider.data}`}
              />
            );
            break;
          case DiscoverSliderType.TMDB_SEARCH:
            sliderComponent = (
              <MediaSlider
                sliderKey={`custom-slider-${slider.id}`}
                title={slider.title ?? ''}
                url="/api/v1/search"
                extraParams={`query=${slider.data}`}
                linkUrl={`/search?query=${slider.data}`}
              />
            );
            break;
          case DiscoverSliderType.TMDB_MOVIE_STREAMING_SERVICES:
            sliderComponent = (
              <MediaSlider
                sliderKey={`custom-slider-${slider.id}`}
                title={slider.title ?? ''}
                url="/api/v1/discover/movies"
                extraParams={`watchRegion=${
                  slider.data?.split(',')[0]
                }&watchProviders=${slider.data?.split(',')[1]}`}
                linkUrl={`/discover_movies?watchRegion=${
                  slider.data?.split(',')[0]
                }&watchProviders=${slider.data?.split(',')[1]}`}
              />
            );
            break;
          case DiscoverSliderType.TMDB_TV_STREAMING_SERVICES:
            sliderComponent = (
              <MediaSlider
                sliderKey={`custom-slider-${slider.id}`}
                title={slider.title ?? ''}
                url="/api/v1/discover/tv"
                extraParams={`watchRegion=${
                  slider.data?.split(',')[0]
                }&watchProviders=${slider.data?.split(',')[1]}`}
                linkUrl={`/discover_tv?watchRegion=${
                  slider.data?.split(',')[0]
                }&watchProviders=${slider.data?.split(',')[1]}`}
              />
            );
            break;
        }

        return (
          <View key={`discover-slider-${slider.id}`}>
            {React.cloneElement(sliderComponent, { lastRefresh })}
          </View>
        );
      })}
    </ScrollView>
  );
};

export default Discover;
