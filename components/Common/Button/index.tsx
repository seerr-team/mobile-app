import cx from 'classnames';
import { Pressable, Text, type TextProps } from 'react-native';

export type ButtonProps = TextProps & {
  onClick: () => void;
  forceClassName?: string;
  buttonType?: 'primary' | 'ghost';
};

export default function Button({
  onClick,
  className,
  disabled,
  forceClassName,
  children,
  buttonType = 'primary',
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      onPress={onClick}
      className={
        forceClassName
          ? forceClassName
          : cx(
              buttonType === 'primary'
                ? 'focus:ring-indigo cursor-pointer self-start whitespace-nowrap rounded-md border border-indigo-500 bg-indigo-600 bg-opacity-80 px-4 py-2 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:border-indigo-500 hover:bg-opacity-100 focus:border-indigo-700 focus:outline-none active:border-indigo-700 active:bg-opacity-100 disabled:opacity-50'
                : 'focus:ring-indigo cursor-pointer self-start whitespace-nowrap rounded-md border border-gray-600 bg-transparent px-4 py-2 text-sm font-medium leading-5 text-white hover:border-gray-200 focus:border-gray-100 active:border-gray-100',
              className
            )
      }
      disabled={disabled}
    >
      {typeof children === 'string' ? (
        <Text
          className="inline-flex items-center justify-center text-white"
          {...rest}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
