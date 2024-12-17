import CachedImage from '@/components/Common/CachedImage';
import { useUser } from '@/hooks/useUser';
import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
import { useIntl } from 'react-intl';
import { Pressable } from 'react-native';

const messages = getJellyseerrMessages('components.Layout.UserDropdown');

const UserDropdown = () => {
  const intl = useIntl();
  const { user } = useUser();

  const logout = async () => {
    const res = await fetch('/api/v1/auth/logout', {
      method: 'POST',
    });
    if (!res.ok) throw new Error();
    const data = await res.json();

    if (data?.status === 'ok') {
      // dispatch(logoutUser());
    }
  };

  return (
    <Pressable className="flex flex-1 items-center justify-center rounded-full text-sm ring-1 ring-gray-700 hover:ring-gray-500 focus:outline-none focus:ring-gray-500">
      <CachedImage
        type="avatar"
        style={{ width: 42, height: 42, borderRadius: 21 }}
        src={user ? user.avatar : ''}
        contentFit="cover"
        transition={1000}
        alt=""
        onError={(e) => console.log(e)}
      />
    </Pressable>
  );
};

export default UserDropdown;
