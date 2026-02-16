import { Card, H2, Separator, Text, YStack } from 'tamagui'
import { useAuth } from '../contexts/AuthContext'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <YStack gap="$4">
      <H2>Bem-vindo, {user?.name}</H2>
      <Card padded>
        <YStack gap="$2">
          <Text fontWeight="bold">Suas informações:</Text>
          <Separator />
          <Text>Email: {user?.email}</Text>
          <Text>
            Perfil: {user?.role === 'COACH' ? 'Treinador' : 'Atleta'}
          </Text>
        </YStack>
      </Card>
    </YStack>
  )
}
