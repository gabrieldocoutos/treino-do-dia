import { Separator, Text, YStack } from 'tamagui';

import EditScreenInfo from '@/components/EditScreenInfo';

export default function TabOneScreen() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center">
      <Text fontSize={20} fontWeight="bold">Tab One</Text>
      <Separator marginVertical={30} width="80%" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </YStack>
  );
}
