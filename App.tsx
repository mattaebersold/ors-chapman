import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store/store';
import { AuthProvider } from './src/utils/AuthContext';
import { ModalProvider } from './src/contexts/ModalContext';
import { BannerProvider } from './src/contexts/BannerContext';
import MainNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AuthProvider>
          <ModalProvider>
            <BannerProvider>
              <StatusBar style="light" />
              <MainNavigator />
            </BannerProvider>
          </ModalProvider>
        </AuthProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
