import { H2, Text, YStack } from 'tamagui'

export default function WorkoutsScreen() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
      <H2>Treinos</H2>
      <Text color="$gray10">Seus treinos (em breve)</Text>
    </YStack>
  )
}
