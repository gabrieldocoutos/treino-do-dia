import { Route, Routes } from 'react-router-dom';
import { TamaguiProvider } from 'tamagui';
import { AppLayout } from './components/AppLayout';
import { AuthLayout } from './components/AuthLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { AthleteDetailPage } from './pages/AthleteDetailPage';
import { AthletesPage } from './pages/AthletesPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ProgramFormPage } from './pages/ProgramFormPage';
import { ProgramsPage } from './pages/ProgramsPage';
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
                <Route path="/athletes" element={<AthletesPage />} />
                <Route path="/athletes/:id" element={<AthleteDetailPage />} />
                <Route path="/programs" element={<ProgramsPage />} />
                <Route path="/programs/new" element={<ProgramFormPage />} />
                <Route path="/programs/:id" element={<ProgramFormPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ErrorBoundary>
    </TamaguiProvider>
  );
}

export default App;
