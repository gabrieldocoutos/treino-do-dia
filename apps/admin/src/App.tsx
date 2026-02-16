import { TamaguiProvider, Text, YStack } from 'tamagui'

import config from './tamagui.config'

function App() {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <YStack flex={1} alignItems="center" justifyContent="center" padding={20}>
        <Text fontSize={24} fontWeight="bold">Treino do Dia - Admin</Text>
      </YStack>
    </TamaguiProvider>
  )
}

export default App
