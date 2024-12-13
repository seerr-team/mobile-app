import { Pressable, Text, type TextProps } from 'react-native';
import cx from 'classnames';

export type ButtonProps = TextProps & {
  onClick: () => void;
};

export default function Button({ onClick, className, disabled, ...rest }: ButtonProps) {
  return (
    <Pressable
      onPress={onClick}
      className={cx(
        'border leading-5 font-medium rounded-md focus:outline-none transition ease-in-out duration-150 cursor-pointer disabled:opacity-50 whitespace-nowrap text-white border-indigo-500 bg-indigo-600 bg-opacity-80 hover:bg-opacity-100 hover:border-indigo-500 focus:border-indigo-700 focus:ring-indigo active:bg-opacity-100 active:border-indigo-700 px-4 py-2 text-sm self-start',
        className
      )}
      disabled={disabled}
    >
      <Text
        className="text-white inline-flex items-center justify-center"
        {...rest}
      />
    </Pressable>
  );
}