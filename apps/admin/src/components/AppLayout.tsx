import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button, Separator, Text, XStack, YStack } from 'tamagui';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/', label: 'Painel' },
  { to: '/athletes', label: 'Atletas' },
  { to: '/programs', label: 'Programas' },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
      <XStack flex={1}>
        <YStack width={220} padding="$3" gap="$1" borderRightWidth={1} borderColor="$borderColor">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={{ textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <XStack
                  padding="$3"
                  borderRadius="$3"
                  backgroundColor={isActive ? '$color4' : 'transparent'}
                  hoverStyle={{ backgroundColor: isActive ? '$color4' : '$color2' }}
                  cursor="pointer"
                >
                  <Text fontWeight={isActive ? 'bold' : 'normal'}>{item.label}</Text>
                </XStack>
              )}
            </NavLink>
          ))}
        </YStack>
        <YStack flex={1} padding="$4">
          <Outlet />
        </YStack>
      </XStack>
    </YStack>
  );
}
