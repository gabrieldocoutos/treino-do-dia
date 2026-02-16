import { Separator, Text, YStack } from 'tamagui';

import EditScreenInfo from '@/components/EditScreenInfo';

export default function TabTwoScreen() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center">
      <Text fontSize={20} fontWeight="bold">Tab Two</Text>
      <Separator marginVertical={30} width="80%" />
      <EditScreenInfo path="app/(tabs)/two.tsx" />
    </YStack>
  );
}
