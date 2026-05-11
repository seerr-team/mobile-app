import { Text, type TextProps } from 'react-native';

export default function ThemedText({ style, className, ...rest }: TextProps) {
  const hasColorClass = className
    ?.trim()
    .split(/\s+/g)
    .some((c) => c.match(/^(\S+:)?text-\w+-\d+/));
  const hasTextWeightClass = className
    ?.trim()
    .split(/\s+/g)
    .some((c) =>
      c.match(
        /^(\S+:)?font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/
      )
    );
  return (
    <Text
      style={[
        style,
        hasTextWeightClass ? {} : { fontWeight: 'normal' },
        hasColorClass ? {} : { color: 'white' },
      ]}
      className={className}
      {...rest}
    >
      {rest.children}
    </Text>
  );
}
