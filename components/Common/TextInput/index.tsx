import cx from 'classnames';
import { TextInput as RNTextInput, type TextInputProps } from 'react-native';

export default function TextInput({ className, ...rest }: TextInputProps) {
  return (
    <RNTextInput
      className={cx(
        'h-10 w-full rounded-md border border-gray-500 bg-gray-700 px-4 py-2 text-sm leading-5 text-white placeholder:text-gray-500 focus:border-blue-500',
        className
      )}
      {...rest}
    />
  );
}
