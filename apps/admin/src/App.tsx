import { Route, Routes } from 'react-router-dom'
import { TamaguiProvider } from 'tamagui'

import config from './tamagui.config'
import { AuthProvider } from './contexts/AuthContext'
import { AppLayout } from './components/AppLayout'
import { AuthLayout } from './components/AuthLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'

function App() {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
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
    </TamaguiProvider>
  )
}

export default App
