import CollectionRequestModal from '@/components/RequestModal/CollectionRequestModal';
import MovieRequestModal from '@/components/RequestModal/MovieRequestModal';
import TvRequestModal from '@/components/RequestModal/TvRequestModal';
import type { MediaStatus } from '@/jellyseerr/server/constants/media';
import type { MediaRequest } from '@/jellyseerr/server/entity/MediaRequest';
import type { NonFunctionProperties } from '@/jellyseerr/server/interfaces/api/common';

interface RequestModalProps {
  show: boolean;
  type: 'movie' | 'tv' | 'collection';
  tmdbId: number;
  is4k?: boolean;
  editRequest?: NonFunctionProperties<MediaRequest>;
  onComplete?: (newStatus: MediaStatus) => void;
  onCancel?: () => void;
  onUpdating?: (isUpdating: boolean) => void;
}

const RequestModal = ({
  type,
  show,
  tmdbId,
  is4k,
  editRequest,
  onComplete,
  onUpdating,
  onCancel,
}: RequestModalProps) => {
  return type === 'movie' ? (
    <MovieRequestModal
      show={show}
      onComplete={onComplete}
      onCancel={onCancel}
      tmdbId={tmdbId}
      onUpdating={onUpdating}
      is4k={is4k}
      editRequest={editRequest}
    />
  ) : type === 'tv' ? (
    <TvRequestModal
      show={show}
      onComplete={onComplete}
      onCancel={onCancel}
      tmdbId={tmdbId}
      onUpdating={onUpdating}
      is4k={is4k}
      editRequest={editRequest}
    />
  ) : (
    <CollectionRequestModal
      show={show}
      onComplete={onComplete}
      onCancel={onCancel}
      tmdbId={tmdbId}
      onUpdating={onUpdating}
      is4k={is4k}
    />
  );
};

export default RequestModal;
