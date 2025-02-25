import { TextInput as RNTextInput, type TextInputProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

export default function TextInput({ className, ...rest }: TextInputProps) {
  return (
    <RNTextInput
      className={twMerge(
        'h-10 w-full rounded-md border border-gray-500 bg-gray-700 px-4 py-2 text-sm leading-5 text-white placeholder:text-gray-500 focus:border-blue-500',
        className
      )}
      {...rest}
    />
  );
}
