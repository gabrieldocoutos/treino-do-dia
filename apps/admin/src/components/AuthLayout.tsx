import { Outlet } from 'react-router-dom'
import { YStack } from 'tamagui'

export function AuthLayout() {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      backgroundColor="$background"
    >
      <Outlet />
    </YStack>
  )
}
