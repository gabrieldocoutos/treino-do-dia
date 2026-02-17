import { Navigate, Outlet } from 'react-router-dom';
import { Spinner, YStack } from 'tamagui';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="100vh">
        <Spinner size="large" />
      </YStack>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
