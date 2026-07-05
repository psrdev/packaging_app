import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/hooks/useAuth';
import { AppNavigator } from './src/navigation/AppNavigator';

// Configure TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

// Configure Custom Material Theme matching Filament Indigo palette
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3F51B5', // Indigo
    secondary: '#1A237E', // Navy
    tertiary: '#4CAF50', // Green
    background: '#FAFAFA',
    surface: '#FFFFFF',
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <AuthProvider>
            <NavigationContainer>
              <AppNavigator />
              <StatusBar style="light" backgroundColor="#3F51B5" translucent={false} />
            </NavigationContainer>
          </AuthProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
