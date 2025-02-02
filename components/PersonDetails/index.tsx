// import Ellipsis from '@app/assets/ellipsis.svg';
import CachedImage from '@/components/Common/CachedImage';
// import ImageFader from '@/components/Common/ImageFader';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ErrorPage from '@/components/ErrorPage';
import TitleCard from '@/components/TitleCard';
import type { PersonCombinedCreditsResponse } from '@/jellyseerr/server/interfaces/api/personInterfaces';
import type { PersonDetails as PersonDetailsType } from '@/jellyseerr/server/models/Person';
import { groupBy } from 'lodash';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
// import TruncateMarkup from 'react-truncate-markup';
import ThemedText from '@/components/Common/ThemedText';
import useServerUrl from '@/hooks/useServerUrl';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import globalMessages from '@/utils/globalMessages';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import useSWR from 'swr';

const messages = getJellyseerrMessages('components.PersonDetails');

const PersonDetails = () => {
  const serverUrl = useServerUrl();
  const searchParams = useLocalSearchParams();
  const intl = useIntl();
  const { data, error } = useSWR<PersonDetailsType>(
    `${serverUrl}/api/v1/person/${searchParams.personId}`
  );
  const [showBio, setShowBio] = useState(false);

  const { data: combinedCredits, error: errorCombinedCredits } =
    useSWR<PersonCombinedCreditsResponse>(
      `${serverUrl}/api/v1/person/${searchParams.personId}/combined_credits`
    );

  const sortedCast = useMemo(() => {
    const grouped = groupBy(combinedCredits?.cast ?? [], 'id');

    const reduced = Object.values(grouped).map((objs) => ({
      ...objs[0],
      character: objs.map((pos) => pos.character).join(', '),
    }));

    return reduced.sort((a, b) => {
      const aVotes = a.voteCount ?? 0;
      const bVotes = b.voteCount ?? 0;
      if (aVotes > bVotes) {
        return -1;
      }
      return 1;
    });
  }, [combinedCredits]);

  const sortedCrew = useMemo(() => {
    const grouped = groupBy(combinedCredits?.crew ?? [], 'id');

    const reduced = Object.values(grouped).map((objs) => ({
      ...objs[0],
      job: objs.map((pos) => pos.job).join(', '),
    }));

    return reduced.sort((a, b) => {
      const aVotes = a.voteCount ?? 0;
      const bVotes = b.voteCount ?? 0;
      if (aVotes > bVotes) {
        return -1;
      }
      return 1;
    });
  }, [combinedCredits]);

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <ErrorPage statusCode={404} />;
  }

  const personAttributes: string[] = [];

  if (data.birthday) {
    if (data.deathday) {
      personAttributes.push(
        intl.formatMessage(messages.lifespan, {
          birthdate: intl.formatDate(data.birthday, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC',
          }),
          deathdate: intl.formatDate(data.deathday, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC',
          }),
        })
      );
    } else {
      personAttributes.push(
        intl.formatMessage(messages.birthdate, {
          birthdate: intl.formatDate(data.birthday, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC',
          }),
        })
      );
    }
  }

  if (data.placeOfBirth) {
    personAttributes.push(data.placeOfBirth);
  }

  const isLoading = !combinedCredits && !errorCombinedCredits;

  const cast = (sortedCast ?? []).length > 0 && (
    <>
      <View className="slider-header">
        <ThemedText className="px-4 text-left text-2xl">
          {intl.formatMessage(messages.appearsin)}
        </ThemedText>
      </View>
      <View className="flex flex-row flex-wrap px-2">
        {sortedCast?.map((media, index) => {
          return (
            <View
              key={`list-cast-item-${media.id}-${index}`}
              className="w-1/2 p-2"
            >
              <TitleCard
                key={media.id}
                id={media.id}
                title={media.mediaType === 'movie' ? media.title : media.name}
                userScore={media.voteAverage}
                year={
                  media.mediaType === 'movie'
                    ? media.releaseDate
                    : media.firstAirDate
                }
                image={media.posterPath}
                summary={media.overview}
                mediaType={media.mediaType as 'movie' | 'tv'}
                status={media.mediaInfo?.status}
                canExpand
              />
              {media.character && (
                <ThemedText className="mt-2 w-full truncate text-center text-sm text-gray-300">
                  {intl.formatMessage(messages.ascharacter, {
                    character: media.character,
                  })}
                </ThemedText>
              )}
            </View>
          );
        })}
      </View>
    </>
  );

  const crew = (sortedCrew ?? []).length > 0 && (
    <>
      <View className="slider-header">
        <ThemedText className="px-4 text-left text-2xl">
          {intl.formatMessage(messages.crewmember)}
        </ThemedText>
      </View>
      <View className="flex flex-row flex-wrap px-2">
        {sortedCrew?.map((media, index) => {
          return (
            <View
              key={`list-crew-item-${media.id}-${index}`}
              className="w-1/2 p-2"
            >
              <TitleCard
                key={media.id}
                id={media.id}
                title={media.mediaType === 'movie' ? media.title : media.name}
                userScore={media.voteAverage}
                year={
                  media.mediaType === 'movie'
                    ? media.releaseDate
                    : media.firstAirDate
                }
                image={media.posterPath}
                summary={media.overview}
                mediaType={media.mediaType as 'movie' | 'tv'}
                status={media.mediaInfo?.status}
                canExpand
              />
              {media.job && (
                <ThemedText className="mt-2 w-full truncate text-center text-sm text-gray-300">
                  {media.job}
                </ThemedText>
              )}
            </View>
          );
        })}
      </View>
    </>
  );

  return (
    <ScrollView className="mt-16">
      {/* {(sortedCrew || sortedCast) && (
        <View className="absolute top-0 left-0 right-0 z-0 h-96">
          <ImageFader
            isDarker
            backgroundImages={[...(sortedCast ?? []), ...(sortedCrew ?? [])]
              .filter((media) => media.backdropPath)
              .map(
                (media) =>
                  `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${media.backdropPath}`
              )
              .slice(0, 6)}
          />
        </View>
      )} */}
      <View
        className={`relative z-10 my-4 flex flex-col items-center lg:flex-row ${
          data.biography ? 'lg:items-start' : ''
        }`}
      >
        {data.profilePath && (
          <View className="relative mb-6 mr-0 h-36 w-36 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-gray-700 lg:mb-0 lg:mr-6 lg:h-44 lg:w-44">
            <CachedImage
              type="tmdb"
              src={`https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.profilePath}`}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </View>
        )}
        <View className="px-2 lg:text-left">
          <ThemedText className="text-center text-3xl text-white lg:text-4xl">
            {data.name}
          </ThemedText>
          <View className="mb-2 mt-1 space-y-1 text-xs text-white sm:text-sm lg:text-base">
            <ThemedText className="text-center text-gray-300">
              {personAttributes.join(' | ')}
            </ThemedText>
            {(data.alsoKnownAs ?? []).length > 0 && (
              <ThemedText className="text-center text-gray-300">
                {intl.formatMessage(messages.alsoknownas, {
                  names: (data.alsoKnownAs ?? []).reduce((prev, curr) =>
                    intl.formatMessage(globalMessages.delimitedlist, {
                      a: prev,
                      b: curr,
                    })
                  ),
                })}
              </ThemedText>
            )}
          </View>
          {data.biography && (
            <View className="relative text-left">
              <Pressable
                className="group outline-none ring-0"
                onPress={() => setShowBio((show) => !show)}
                role="button"
                tabIndex={-1}
              >
                <ThemedText
                  className="pt-2 text-gray-300"
                  numberOfLines={showBio ? 200 : 6}
                >
                  {data.biography}
                </ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </View>
      {data.knownForDepartment === 'Acting' ? (
        <>
          {cast}
          {crew}
        </>
      ) : (
        <>
          {crew}
          {cast}
        </>
      )}
      {isLoading && <LoadingSpinner />}
    </ScrollView>
  );
};

export default PersonDetails;
