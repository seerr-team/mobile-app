import { TextInput as RNTextInput, type TextInputProps } from 'react-native';
import cx from 'classnames';

export default function TextInput({ className, ...rest }: TextInputProps) {
  return (
    <RNTextInput
      className={cx(
        'w-full h-10 px-4 py-2 rounded-md border border-gray-500 focus:border-blue-500 bg-gray-700 text-white placeholder:text-gray-500 text-sm leading-5',
        className
      )}
      {...rest}
    />
  );
}