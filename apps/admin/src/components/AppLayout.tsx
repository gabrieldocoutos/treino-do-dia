import { Outlet, useNavigate } from 'react-router-dom'
import { Button, Separator, Text, XStack, YStack } from 'tamagui'
import { useAuth } from '../contexts/AuthContext'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <YStack flex={1} minHeight="100vh">
      <XStack
        padding="$4"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="$background"
      >
        <Text fontSize={18} fontWeight="bold">
          Treino do Dia - Admin
        </Text>
        <XStack alignItems="center" gap="$3">
          <Text>{user?.name}</Text>
          <Button size="$3" onPress={handleLogout}>
            Sair
          </Button>
        </XStack>
      </XStack>
      <Separator />
      <YStack flex={1} padding="$4">
        <Outlet />
      </YStack>
    </YStack>
  )
}
