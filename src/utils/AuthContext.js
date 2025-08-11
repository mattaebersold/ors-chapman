import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStoredToken, restoreSession } from '../store/authSlice';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isLoggedIn, loading, userInfo } = useSelector((state) => state.auth);

  // Restore session on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = await getStoredToken();
      if (token) {
        dispatch(restoreSession(token));
      }
    };

    initializeAuth();
  }, [dispatch]);

  const contextValue = {
    isLoggedIn,
    loading,
    userInfo,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};