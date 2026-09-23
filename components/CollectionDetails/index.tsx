// import BlocklistModal from '@app/components/BlocklistModal';
// import Button from '@app/components/Common/Button';
import ButtonWithDropdown from '@app/components/Common/ButtonWithDropdown';
import CachedImage from '@app/components/Common/CachedImage';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import ThemedText from '@app/components/Common/ThemedText';
// import Tooltip from '@app/components/Common/Tooltip';
import ErrorPage from '@app/components/ErrorPage';
import RequestModal from '@app/components/RequestModal';
import Slider from '@app/components/Slider';
import StatusBadge from '@app/components/StatusBadge';
import TitleCard from '@app/components/TitleCard';
import useServerUrl from '@app/hooks/useServerUrl';
import useSettings from '@app/hooks/useSettings';
import { Permission, useUser } from '@app/hooks/useUser';
import getSeerrMessages from '@app/utils/getSeerrMessages';
import globalMessages from '@app/utils/globalMessages';
import { ArrowDownTray } from '@nandorojo/heroicons/24/outline';
import { MediaStatus } from '@server/constants/media';
import type { Collection } from '@server/models/Collection';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams } from 'expo-router';
import { uniq } from 'lodash';
import { Fragment, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { ScrollView, View } from 'react-native';
import useSWR from 'swr';

const messages = getSeerrMessages('components.CollectionDetails');

const CollectionDetails = () => {
  const serverUrl = useServerUrl();
  const searchParams = useLocalSearchParams();
  const intl = useIntl();
  const settings = useSettings();
  const { hasPermission } = useUser();
  const [requestModal, setRequestModal] = useState(false);
  const [is4k, setIs4k] = useState(false);
  // const [showBlocklistModal, setShowBlocklistModal] = useState(false);
  // const [isBlocklistUpdating, setIsBlocklistUpdating] = useState(false);

  const returnCollectionDownloadItems = (data: Collection | undefined) => {
    const [downloadStatus, downloadStatus4k] = [
      data?.parts.flatMap((item) =>
        item.mediaInfo?.downloadStatus ? item.mediaInfo?.downloadStatus : []
      ),
      data?.parts.flatMap((item) =>
        item.mediaInfo?.downloadStatus4k ? item.mediaInfo?.downloadStatus4k : []
      ),
    ];

    return { downloadStatus, downloadStatus4k };
  };

  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<Collection>(
    `${serverUrl}/api/v1/collection/${searchParams.collectionId}`
    // {
    //   fallbackData: collection,
    //   revalidateOnMount: true,
    //   refreshInterval: refreshIntervalHelper(
    //     returnCollectionDownloadItems(collection),
    //     15000
    //   ),
    // }
  );

  const { data: genres } = useSWR<{ id: number; name: string }[]>(
    `${serverUrl}/api/v1/genres/movie`
  );

  // const onClickHideItemBtn = async (): Promise<void> => {
  //   setIsBlocklistUpdating(true);

  //   try {
  //     await axios.post(`${serverUrl}/api/v1/blocklist/collection/${data?.id}`);

  //     addToast(
  //       <span>
  //         {intl.formatMessage(globalMessages.blocklistSuccess, {
  //           title: data?.name,
  //           strong: (msg: React.ReactNode) => <strong>{msg}</strong>,
  //         })}
  //       </span>,
  //       { appearance: 'success', autoDismiss: true }
  //     );

  //     revalidate();
  //   } catch {
  //     addToast(intl.formatMessage(globalMessages.blocklistError), {
  //       appearance: 'error',
  //       autoDismiss: true,
  //     });
  //   }

  //   setIsBlocklistUpdating(false);
  //   setShowBlocklistModal(false);
  // };

  // const onClickUnblocklistBtn = async (): Promise<void> => {
  //   if (!data) return;

  //   setIsBlocklistUpdating(true);

  //   try {
  //     await axios.delete(`${serverUrl}/api/v1/blocklist/collection/${data.id}`);

  //     addToast(
  //       <span>
  //         {intl.formatMessage(globalMessages.removeFromBlocklistSuccess, {
  //           title: data.name,
  //           strong: (msg: React.ReactNode) => <strong>{msg}</strong>,
  //         })}
  //       </span>,
  //       { appearance: 'success', autoDismiss: true }
  //     );

  //     revalidate();
  //   } catch {
  //     addToast(intl.formatMessage(globalMessages.blocklistError), {
  //       appearance: 'error',
  //       autoDismiss: true,
  //     });
  //   }

  //   setIsBlocklistUpdating(false);
  // };

  const [downloadStatus, downloadStatus4k] = useMemo(() => {
    const downloadItems = returnCollectionDownloadItems(data);
    return [downloadItems.downloadStatus, downloadItems.downloadStatus4k];
  }, [data]);

  const [titles, titles4k] = useMemo(() => {
    return [
      data?.parts
        .filter((media) => (media.mediaInfo?.downloadStatus ?? []).length > 0)
        .map((title) => title.title),
      data?.parts
        .filter((media) => (media.mediaInfo?.downloadStatus4k ?? []).length > 0)
        .map((title) => title.title),
    ];
  }, [data?.parts]);

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <ErrorPage statusCode={404} />;
  }

  let collectionStatus = MediaStatus.UNKNOWN;
  let collectionStatus4k = MediaStatus.UNKNOWN;

  const blocklistedParts = data.parts.filter(
    (part) =>
      part.mediaInfo && part.mediaInfo.status === MediaStatus.BLOCKLISTED
  );
  const isCollectionBlocklisted = blocklistedParts.length > 0;
  const isCollectionPartiallyBlocklisted =
    blocklistedParts.length > 0 && blocklistedParts.length < data.parts.length;

  if (isCollectionBlocklisted) {
    collectionStatus = MediaStatus.BLOCKLISTED;
  } else if (
    data.parts.length > 0 &&
    data.parts.every(
      (part) =>
        part.mediaInfo && part.mediaInfo.status === MediaStatus.AVAILABLE
    )
  ) {
    collectionStatus = MediaStatus.AVAILABLE;
  } else if (
    data.parts.some(
      (part) =>
        part.mediaInfo && part.mediaInfo.status === MediaStatus.AVAILABLE
    )
  ) {
    collectionStatus = MediaStatus.PARTIALLY_AVAILABLE;
  }

  if (
    data.parts.length > 0 &&
    data.parts.every(
      (part) =>
        part.mediaInfo && part.mediaInfo.status4k === MediaStatus.AVAILABLE
    )
  ) {
    collectionStatus4k = MediaStatus.AVAILABLE;
  } else if (
    data.parts.some(
      (part) =>
        part.mediaInfo && part.mediaInfo.status4k === MediaStatus.AVAILABLE
    )
  ) {
    collectionStatus4k = MediaStatus.PARTIALLY_AVAILABLE;
  }

  const hasRequestable =
    hasPermission([Permission.REQUEST, Permission.REQUEST_MOVIE], {
      type: 'or',
    }) &&
    data.parts.filter(
      (part) => !part.mediaInfo || part.mediaInfo.status === MediaStatus.UNKNOWN
    ).length > 0;

  const hasRequestable4k =
    settings.currentSettings.movie4kEnabled &&
    hasPermission([Permission.REQUEST_4K, Permission.REQUEST_4K_MOVIE], {
      type: 'or',
    }) &&
    data.parts.filter(
      (part) =>
        !part.mediaInfo || part.mediaInfo.status4k === MediaStatus.UNKNOWN
    ).length > 0;

  const blocklistVisibility = hasPermission(
    [Permission.MANAGE_BLOCKLIST, Permission.VIEW_BLOCKLIST],
    { type: 'or' }
  );

  const collectionAttributes: React.ReactNode[] = [];

  collectionAttributes.push(
    intl.formatMessage(messages.numberofmovies, {
      count: data.parts.length,
    })
  );

  if (genres && data.parts.some((part) => part.genreIds.length)) {
    collectionAttributes.push(
      uniq(
        data.parts.reduce(
          (genresList: number[], curr) => genresList.concat(curr.genreIds),
          []
        )
      )
        .map((genreId) => (
          <Link
            href={`/discover/movies/genre/${genreId}`}
            key={`genre-${genreId}`}
            className="text-center text-gray-300 hover:underline focus:underline"
          >
            {genres.find((g) => g.id === genreId)?.name}
          </Link>
        ))
        .reduce((prev, curr) => (
          <ThemedText
            className="text-center text-gray-300"
            key={`genre-separator-${prev}-${curr}`}
          >
            {intl.formatMessage(globalMessages.delimitedlist, {
              a: prev,
              b: curr,
            })}
          </ThemedText>
        ))
    );
  }

  return (
    <ScrollView contentContainerClassName="pb-4">
      {data.backdropPath && (
        <View className="absolute inset-0 -z-10 h-full w-full">
          <CachedImage
            type="tmdb"
            alt=""
            src={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${data.backdropPath}`}
            style={{ width: '100%', height: 400 }}
            contentFit="cover"
          />
          {/* <View
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(17, 24, 39, 0.47) 0%, rgba(17, 24, 39, 1) 100%)',
            }}
          /> */}
          <LinearGradient
            colors={['rgba(17, 24, 39, 0.47)', 'rgba(17, 24, 39, 1)']}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 400,
            }}
          />
        </View>
      )}
      <RequestModal
        tmdbId={data.id}
        show={requestModal}
        type="collection"
        is4k={is4k}
        onComplete={() => {
          revalidate();
          setRequestModal(false);
        }}
        onCancel={() => setRequestModal(false)}
      />
      {/* <BlocklistModal
        tmdbId={data.id}
        type="collection"
        show={showBlocklistModal}
        onCancel={() => setShowBlocklistModal(false)}
        onComplete={onClickHideItemBtn}
        isUpdating={isBlocklistUpdating}
      /> */}
      <View className="mt-4 flex flex-col items-center px-6 pt-2 xl:flex-row xl:items-end">
        <View className="overflow-hidden rounded shadow md:rounded-lg md:shadow-2xl xl:mr-4">
          <CachedImage
            type="tmdb"
            src={
              data.posterPath
                ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.posterPath}`
                : '/images/seerr_poster_not_found.png'
            }
            alt=""
            style={{ width: 150, height: 225 }}
          />
        </View>
        <View className="mt-4 flex flex-1 flex-col text-center text-white xl:mr-4 xl:mt-0 xl:text-left">
          <View className="space-x-2xl:items-start mb-2 flex flex-row items-center justify-center gap-2">
            <StatusBadge
              status={collectionStatus}
              downloadItem={downloadStatus}
              title={titles}
              statusLabelOverride={
                isCollectionPartiallyBlocklisted
                  ? intl.formatMessage(globalMessages.partiallyblocklisted)
                  : undefined
              }
              inProgress={data.parts.some(
                (part) => (part.mediaInfo?.downloadStatus ?? []).length > 0
              )}
            />
            {settings.currentSettings.movie4kEnabled &&
              hasPermission(
                [Permission.REQUEST_4K, Permission.REQUEST_4K_MOVIE],
                {
                  type: 'or',
                }
              ) && (
                <StatusBadge
                  status={collectionStatus4k}
                  downloadItem={downloadStatus4k}
                  title={titles4k}
                  is4k
                  inProgress={data.parts.some(
                    (part) =>
                      (part.mediaInfo?.downloadStatus4k ?? []).length > 0
                  )}
                />
              )}
          </View>
          <ThemedText className="mt-2 text-center text-3xl xl:text-left">
            {data.name}
          </ThemedText>
          <View className="flex flex-row flex-wrap items-center justify-center xl:justify-start">
            {collectionAttributes.length > 0 &&
              collectionAttributes
                .map((t, k) => <ThemedText key={k}>{t}</ThemedText>)
                .reduce((prev, curr) => (
                  <Fragment key={`${prev.key}-${curr.key}`}>
                    {prev}
                    <ThemedText className="mx-1.5">|</ThemedText>
                    {curr}
                  </Fragment>
                ))}
          </View>
        </View>
        <View className="media-actions flex flex-row justify-stretch gap-4">
          {/* {hasPermission([Permission.MANAGE_BLOCKLIST], { type: 'or' }) &&
            (isCollectionBlocklisted ? (
              <Tooltip
                content={
                  blocklistedParts.length === data.parts.length
                    ? intl.formatMessage(globalMessages.removefromBlocklist)
                    : intl.formatMessage(
                        messages.removefromblocklistpartialcount,
                        {
                          removeLabel: intl.formatMessage(
                            globalMessages.removefromBlocklist
                          ),
                          count: blocklistedParts.length,
                        }
                      )
                }
              >
                <Button
                  buttonType="ghost"
                  className="z-40 mr-2"
                  buttonSize="md"
                  onClick={onClickUnblocklistBtn}
                  disabled={isBlocklistUpdating}
                >
                  <EyeIcon />
                </Button>
              </Tooltip>
            ) : (
              <Tooltip
                content={intl.formatMessage(globalMessages.addToBlocklist)}
              >
                <Button
                  buttonType="ghost"
                  className="z-40 mr-2"
                  buttonSize="md"
                  onClick={() => setShowBlocklistModal(true)}
                  disabled={isBlocklistUpdating}
                >
                  <EyeSlashIcon />
                </Button>
              </Tooltip>
            ))} */}
          {(hasRequestable || hasRequestable4k) && (
            <ButtonWithDropdown
              buttonType="primary"
              onPress={() => {
                setRequestModal(true);
                setIs4k(!hasRequestable);
              }}
              text={
                <>
                  <ArrowDownTray color="#ffffff" />
                  <ThemedText>
                    {intl.formatMessage(
                      hasRequestable
                        ? messages.requestcollection
                        : messages.requestcollection4k
                    )}
                  </ThemedText>
                </>
              }
              popoverStyle={{ marginTop: 112, marginLeft: 32 }}
            >
              {hasRequestable && hasRequestable4k && (
                <ButtonWithDropdown.Item
                  buttonType="primary"
                  onPress={() => {
                    setRequestModal(true);
                    setIs4k(true);
                  }}
                >
                  <ArrowDownTray />
                  <ThemedText>
                    {intl.formatMessage(messages.requestcollection4k)}
                  </ThemedText>
                </ButtonWithDropdown.Item>
              )}
            </ButtonWithDropdown>
          )}
        </View>
      </View>
      {data.overview && (
        <View className="media-overview px-4">
          <View className="flex-1">
            <ThemedText className="text-2xl">
              {intl.formatMessage(messages.overview)}
            </ThemedText>
            <ThemedText className="pt-2 text-gray-400">
              {data.overview}
            </ThemedText>
          </View>
        </View>
      )}
      <ThemedText className="my-6 px-4 text-2xl">
        {intl.formatMessage(globalMessages.movies)}
      </ThemedText>
      <View className="px-2">
        <Slider
          sliderKey="collection-movies"
          isLoading={false}
          isEmpty={data.parts.length === 0}
          items={data.parts
            .filter((title) => {
              if (!blocklistVisibility) {
                return title.mediaInfo?.status !== MediaStatus.BLOCKLISTED;
              }
              return title;
            })
            .map((title) => (
              <TitleCard
                key={`collection-movie-${title.id}`}
                id={title.id}
                isAddedToWatchlist={title.mediaInfo?.watchlists?.length ?? 0}
                image={title.posterPath}
                status={title.mediaInfo?.status}
                summary={title.overview}
                title={title.title}
                userScore={title.voteAverage}
                year={title.releaseDate}
                mediaType={title.mediaType}
                mutateParent={revalidate}
              />
            ))}
        />
      </View>
    </ScrollView>
  );
};

export default CollectionDetails;
