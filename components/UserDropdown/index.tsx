import CachedImage from '@/components/Common/CachedImage';
import { useUser } from '@/hooks/useUser';
// import getJellyseerrMessages from '@/utils/getJellyseerrMessages';
// import { useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';

// const messages = getJellyseerrMessages('components.Layout.UserDropdown');

const UserDropdown = () => {
  // const intl = useIntl();
  const { user } = useUser();

  // const logout = async () => {
  //   const res = await fetch('/api/v1/auth/logout', {
  //     method: 'POST',
  //   });
  //   if (!res.ok) throw new Error();
  //   const data = await res.json();

  //   if (data?.status === 'ok') {
  //     // dispatch(logoutUser());
  //   }
  // };

  return (
    <View className="flex flex-1 items-center justify-center">
      <Pressable className="flex items-center justify-center overflow-hidden rounded-full border border-gray-700 bg-gray-700 hover:border-gray-500 focus:border-gray-500 focus:outline-none">
        <CachedImage
          type="avatar"
          style={{ width: 40, height: 40 }}
          src={user ? user.avatar : ''}
          contentFit="cover"
          placeholder={null}
          alt=""
        />
      </Pressable>
    </View>
  );
};

export default UserDropdown;
