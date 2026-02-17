import { Route, Routes } from 'react-router-dom';
import { TamaguiProvider } from 'tamagui';
import { AppLayout } from './components/AppLayout';
import { AuthLayout } from './components/AuthLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import config from './tamagui.config';

function App() {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <ErrorBoundary>
        <AuthProvider>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ErrorBoundary>
    </TamaguiProvider>
  );
}

export default App;
