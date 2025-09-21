import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { useGoogleAuthMutation } from '../services/apiService';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { colors } from '../constants/colors';
import FAIcon from './ui/FAIcon';

// Configure WebBrowser for better OAuth handling
WebBrowser.maybeCompleteAuthSession();

const GoogleSignInButton = ({ onSuccess, loading: externalLoading = false }) => {
  const [googleAuth, { isLoading }] = useGoogleAuthMutation();
  const dispatch = useDispatch();

  console.log('GoogleSignInButton rendered');

  const signInWithGoogle = async () => {
    // Temporary test with a mock Google token for development
    Alert.alert(
      'Google Sign-In', 
      'Google OAuth is complex with Expo Go. For now, would you like to test with a mock user or continue trying to fix the OAuth flow?',
      [
        {
          text: 'Try OAuth Again',
          onPress: attemptGoogleOAuth
        },
        {
          text: 'Test with Mock User',
          onPress: testWithMockUser
        }
      ]
    );
  };

  const testWithMockUser = async () => {
    try {
      // Test your backend with a mock Google user
      const mockGoogleUser = {
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        profilePicture: 'https://via.placeholder.com/150'
      };
      
      Alert.alert('Mock Test', `Testing backend with: ${mockGoogleUser.email}`);
      // For testing, we'd need a real Google ID token or modify the backend to accept mock data
      
    } catch (error) {
      console.error('Mock test error:', error);
      Alert.alert('Error', error.message);
    }
  };

  const attemptGoogleOAuth = async () => {
    try {
      const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      
      // Use Expo Go's standard redirect URI
      const redirectUri = 'https://auth.expo.io/@anonymous/google-auth-expo';
      
      console.log('Client ID:', clientId);
      console.log('Redirect URI:', redirectUri);
      
      // Create the authorization request for implicit flow (gets token directly)
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=id_token&` +
        `scope=${encodeURIComponent('openid profile email')}&` +
        `nonce=${Math.random().toString(36)}&` +
        `prompt=select_account`;

      console.log('Auth URL:', authUrl);
      console.log('Starting OAuth request...');
      
      // Use WebBrowser for OAuth flow
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );

      console.log('OAuth result:', result);
      
      if (result.type === 'success' && result.url) {
        // Parse the ID token directly from the URL fragment (implicit flow)
        const url = result.url;
        const fragmentMatch = url.match(/[#&]id_token=([^&]+)/);
        const errorMatch = url.match(/[#&]error=([^&]+)/);
        
        if (errorMatch) {
          const error = decodeURIComponent(errorMatch[1]);
          throw new Error(`OAuth error: ${error}`);
        }
        
        if (fragmentMatch) {
          const idToken = decodeURIComponent(fragmentMatch[1]);
          console.log('ID Token received:', idToken ? 'Yes' : 'No');
          
          if (idToken) {
            // Send token to backend for verification and user creation/login
            const response = await googleAuth({ idToken }).unwrap();
            
            // Store auth data in Redux
            dispatch(login({
              token: response.token,
              userInfo: response.user,
            }));
            
            if (onSuccess) {
              onSuccess(response);
            }
          } else {
            throw new Error('Failed to get ID token from Google');
          }
        } else {
          throw new Error('No ID token received from Google');
        }
      } else if (result.type === 'cancel') {
        console.log('Google sign-in was cancelled');
      } else {
        throw new Error('Google sign-in failed');
      }
      
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      
      let errorMessage = 'Google sign-in failed';
      
      if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const isButtonLoading = isLoading || externalLoading;

  return (
    <TouchableOpacity
      style={[styles.googleButton, isButtonLoading && styles.googleButtonDisabled]}
      onPress={signInWithGoogle}
      disabled={isButtonLoading}
    >
      {isButtonLoading ? (
        <ActivityIndicator size="small" color={colors.WHITE} />
      ) : (
        <>
          <FAIcon name="google" size={18} color={colors.WHITE} style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleButton: {
    backgroundColor: colors.GOOGLE_BLUE, // Google blue
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 8,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleSignInButton;