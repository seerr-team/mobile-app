import { Text, type TextProps } from 'react-native';

export default function ThemedText({
  style,
  className,
  ...rest
}: TextProps) {
  const hasColorClass = className?.trim().split(/\s+/g).some((c) => c.match(/^text-\w+-\d+/));
  return (
    <Text
      style={[style, hasColorClass ? {} : { color: 'white' }]}
      className={className}
      {...rest}
    />
  );
}