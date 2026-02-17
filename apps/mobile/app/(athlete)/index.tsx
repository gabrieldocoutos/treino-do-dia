import { Button, Card, H2, Separator, Text, YStack } from 'tamagui';
import { useAuth } from '@/contexts/AuthContext';

export default function AthleteDashboardScreen() {
  const { user, logout } = useAuth();

  return (
    <YStack flex={1} padding="$4" gap="$4">
      <H2>Bem-vindo, {user?.name}</H2>
      <Card padded>
        <YStack gap="$2">
          <Text fontWeight="bold">Suas informações:</Text>
          <Separator />
          <Text>Email: {user?.email}</Text>
          <Text>Perfil: Atleta</Text>
        </YStack>
      </Card>
      <Button themeInverse onPress={logout}>
        Sair
      </Button>
    </YStack>
  );
}
