import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import ErrorPage from '@app/components/ErrorPage';
import useDiscover from '@app/hooks/useDiscover';
import { useUser } from '@app/hooks/useUser';
import getSeerrMessages from '@app/utils/getSeerrMessages';
import type { WatchlistItem } from '@server/interfaces/api/discoverInterfaces';
import { useIntl } from 'react-intl';

const messages = getSeerrMessages('components.Discover.DiscoverWatchlist');

const DiscoverWatchlist = () => {
  const intl = useIntl();
  // const { user } = useUser({
  //   id: Number(router.query.userId),
  // });
  const { user: currentUser } = useUser();

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
    mutate,
  } = useDiscover<WatchlistItem>(
    // `/api/v1/${
    //   router.pathname.startsWith('/profile')
    //     ? `user/${currentUser?.id}`
    //     : router.query.userId
    //       ? `user/${router.query.userId}`
    //       : 'discover'
    // }/watchlist`
    `/api/v1/user/${currentUser?.id}/watchlist`
  );

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  const title = intl.formatMessage(
    // router.query.userId ? messages.watchlist : messages.discoverwatchlist
    messages.discoverwatchlist
  );

  return (
    <>
      <ListView
        header={
          <Header
          // subtext={
          //   router.query.userId ? (
          //     <Link href={`/users/${user?.id}`} className="hover:underline">
          //       {user?.displayName}
          //     </Link>
          //   ) : (
          //     ''
          //   )
          // }
          >
            {title}
          </Header>
        }
        plexItems={titles}
        isEmpty={isEmpty}
        isLoading={
          isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
        }
        isReachingEnd={isReachingEnd}
        onScrollBottom={fetchMore}
        mutateParent={mutate}
      />
    </>
  );
};

export default DiscoverWatchlist;
