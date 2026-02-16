import { Text, type TextProps } from 'tamagui';

export function MonoText(props: TextProps) {
  return <Text fontFamily="$mono" {...props} />;
}
