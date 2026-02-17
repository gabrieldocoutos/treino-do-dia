import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';
import { Spinner, TamaguiProvider, YStack } from 'tamagui';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import config from '../tamagui.config';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const tamaguiTheme = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <TamaguiProvider config={config} defaultTheme={tamaguiTheme}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}

function AuthGate() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" />
      </YStack>
    );
  }

  return (
    <>
      <Slot />
      {!isAuthenticated && <Redirect href="/(auth)/login" />}
      {isAuthenticated && user?.role === 'COACH' && <Redirect href="/(coach)" />}
      {isAuthenticated && user?.role === 'ATHLETE' && <Redirect href="/(athlete)" />}
    </>
  );
}
