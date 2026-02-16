import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { Separator, Text, YStack } from 'tamagui';

import EditScreenInfo from '@/components/EditScreenInfo';

export default function ModalScreen() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center">
      <Text fontSize={20} fontWeight="bold">Modal</Text>
      <Separator marginVertical={30} width="80%" />
      <EditScreenInfo path="app/modal.tsx" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </YStack>
  );
}
