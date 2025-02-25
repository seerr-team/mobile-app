import { Pressable, Text, type TextProps } from 'react-native';

export type ButtonType = 'primary' | 'success' | 'danger' | 'ghost';

export type ButtonProps = TextProps & {
  onClick: () => void;
  forceClassName?: string;
  buttonType?: ButtonType;
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
  const baseClassName =
    'self-start whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium leading-5 transition duration-150 ease-in-out disabled:opacity-50';
  const typeClassNames = {
    primary:
      'border border-indigo-500 bg-indigo-600 bg-opacity-80 text-white hover:border-indigo-500 hover:bg-opacity-100 focus:border-indigo-700 focus:ring-indigo focus:outline-none active:border-indigo-700 active:bg-opacity-100',
    success:
      'border border-green-500 bg-green-600 bg-opacity-80 text-white hover:border-green-500 hover:bg-opacity-100 focus:border-green-700 focus:ring-green-500 focus:outline-none active:border-green-700 active:bg-opacity-100',
    danger:
      'border border-red-500 bg-red-600 bg-opacity-80 text-white hover:border-red-500 hover:bg-opacity-100 focus:border-red-700 focus:ring-red-500 focus:outline-none active:border-red-700 active:bg-opacity-100',
    ghost:
      'border border-gray-600 bg-transparent text-white hover:border-gray-200 focus:border-gray-100 focus:ring-indigo active:border-gray-100',
  };
  const buttonClassName =
    forceClassName ||
    `${baseClassName} ${typeClassNames[buttonType]} ${className}`;

  return (
    <Pressable
      onPress={onClick}
      className={buttonClassName}
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
