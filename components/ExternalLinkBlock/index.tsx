import EmbyLogo from '@app/assets/services/emby.png';
import ImdbLogo from '@app/assets/services/imdb.png';
import JellyfinLogo from '@app/assets/services/jellyfin.png';
import LetterboxdLogo from '@app/assets/services/letterboxd.png';
import PlexLogo from '@app/assets/services/plex.png';
import RTLogo from '@app/assets/services/rt.png';
import TmdbLogo from '@app/assets/services/tmdb.png';
import TraktLogo from '@app/assets/services/trakt.png';
import TvdbLogo from '@app/assets/services/tvdb.png';
import useLocale from '@app/hooks/useLocale';
import useSettings from '@app/hooks/useSettings';
import { MediaType } from '@server/constants/media';
import { MediaServerType } from '@server/constants/server';
import { Image } from 'expo-image';
import { Linking, Pressable, View } from 'react-native';

type ExternalLinkType = 'movie' | 'tv' | 'person';

interface ExternalLinkBlockProps {
  mediaType: ExternalLinkType;
  tmdbId?: number;
  tvdbId?: number;
  imdbId?: string;
  rtUrl?: string;
  mediaUrl?: string;
}

const ExternalLinkBlock = ({
  mediaType,
  tmdbId,
  tvdbId,
  imdbId,
  rtUrl,
  mediaUrl,
}: ExternalLinkBlockProps) => {
  const settings = useSettings();
  const { locale } = useLocale();

  return (
    <View className="flex w-full flex-row items-center justify-center gap-4 space-x-5">
      {mediaUrl && (
        <Pressable
          className="opacity-50 transition duration-300 hover:opacity-100"
          onPress={() => Linking.openURL(mediaUrl)}
        >
          {settings.currentSettings.mediaServerType === MediaServerType.PLEX ? (
            <Image
              source={PlexLogo}
              contentFit="contain"
              style={{ width: 48, height: 48 }}
            />
          ) : settings.currentSettings.mediaServerType ===
            MediaServerType.EMBY ? (
            <Image
              source={EmbyLogo}
              contentFit="contain"
              style={{ width: 48, height: 48 }}
            />
          ) : (
            <Image
              source={JellyfinLogo}
              contentFit="contain"
              style={{ width: 48, height: 48 }}
            />
          )}
        </Pressable>
      )}
      {tmdbId && (
        <Pressable
          className="opacity-50 transition duration-300 hover:opacity-100"
          onPress={() =>
            Linking.openURL(
              `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=${locale}`
            )
          }
        >
          <Image
            source={TmdbLogo}
            contentFit="contain"
            style={{ width: 32, height: 32 }}
          />
        </Pressable>
      )}
      {tvdbId && mediaType === MediaType.TV && (
        <Pressable
          className="opacity-50 transition duration-300 hover:opacity-100"
          onPress={() =>
            Linking.openURL(`http://www.thetvdb.com/?tab=series&id=${tvdbId}`)
          }
        >
          <Image
            source={TvdbLogo}
            contentFit="contain"
            style={{ width: 36, height: 36 }}
          />
        </Pressable>
      )}
      {imdbId && mediaType !== 'person' && (
        <Pressable
          className="opacity-50 transition duration-300 hover:opacity-100"
          onPress={() =>
            Linking.openURL(`https://www.imdb.com/title/${imdbId}`)
          }
        >
          <Image
            source={ImdbLogo}
            contentFit="contain"
            style={{ width: 32, height: 32 }}
          />
        </Pressable>
      )}
      {imdbId && mediaType === 'person' && (
        <Pressable
          className="opacity-50 transition duration-300 hover:opacity-100"
          onPress={() => Linking.openURL(`https://www.imdb.com/name/${imdbId}`)}
        >
          <Image
            source={ImdbLogo}
            contentFit="contain"
            style={{ width: 32, height: 32 }}
          />
        </Pressable>
      )}
      {rtUrl && (
        <Pressable
          className="opacity-50 transition duration-300 hover:opacity-100"
          onPress={() => Linking.openURL(rtUrl)}
        >
          <Image
            source={RTLogo}
            contentFit="contain"
            style={{ width: 56, height: 56 }}
          />
        </Pressable>
      )}
      {tmdbId && mediaType !== 'person' && (
        <Pressable
          className="opacity-50 transition duration-300 hover:opacity-100"
          onPress={() =>
            Linking.openURL(
              `https://trakt.tv/search/tmdb/${tmdbId}?id_type=${mediaType === 'movie' ? 'movie' : 'show'}`
            )
          }
        >
          <Image
            source={TraktLogo}
            contentFit="contain"
            style={{ width: 32, height: 32 }}
          />
        </Pressable>
      )}
      {tmdbId && mediaType === MediaType.MOVIE && (
        <Pressable
          className="opacity-50 transition duration-300 hover:opacity-100"
          onPress={() =>
            Linking.openURL(`https://letterboxd.com/tmdb/${tmdbId}`)
          }
        >
          <Image
            source={LetterboxdLogo}
            contentFit="contain"
            style={{ width: 32, height: 32 }}
          />
        </Pressable>
      )}
    </View>
  );
};

export default ExternalLinkBlock;
