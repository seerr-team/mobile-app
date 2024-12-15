import cx from 'classnames';
import { Pressable, Text, type TextProps } from 'react-native';

export type ButtonProps = TextProps & {
  onClick: () => void;
};

export default function Button({
  onClick,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      onPress={onClick}
      className={cx(
        'focus:ring-indigo cursor-pointer self-start whitespace-nowrap rounded-md border border-indigo-500 bg-indigo-600 bg-opacity-80 px-4 py-2 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:border-indigo-500 hover:bg-opacity-100 focus:border-indigo-700 focus:outline-none active:border-indigo-700 active:bg-opacity-100 disabled:opacity-50',
        className
      )}
      disabled={disabled}
    >
      <Text
        className="inline-flex items-center justify-center text-white"
        {...rest}
      />
    </Pressable>
  );
}
