/**
 * useAuth.js — Custom hook to access authentication context
 */
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Graceful fallback when rendered outside provider
    return {
      user: null,
      isLoggedIn: false,
      initializing: false,
      login: async () => {
        throw new Error('useAuth() called outside <AuthProvider>');
      },
      signup: async () => {
        throw new Error('useAuth() called outside <AuthProvider>');
      },
      logout: async () => {},
      setUser: () => {},
    };
  }
  return context;
}

export default useAuth;
