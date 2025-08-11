import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { AuthProvider } from './src/utils/AuthContext';
import { ModalProvider } from './src/contexts/ModalContext';
import MainNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ModalProvider>
          <StatusBar style="light" />
          <MainNavigator />
        </ModalProvider>
      </AuthProvider>
    </Provider>
  );
}
