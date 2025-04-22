import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { fetchUserStatus } from '../api/auth';

// 1. Create Context
const AuthContext = createContext(null);

// Define expected shape of userStatus (based on UserStatusResponse in backend)
// interface UserStatus {
//   id: string; // UUID is string in JS
//   email: string;
//   email_verified: boolean;
//   subscription_plan: string | null;
//   subscription_status: string | null;
//   subscription_expiry: string | null; // ISO Date string
// }

// 2. Create AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Internal function to fetch and set status, handling errors
  const loadUserStatus = useCallback(async (token) => {
    if (!token) return; // Don't fetch if no token
    console.log('AuthContext: Attempting to load user status...');
    try {
      const status = await fetchUserStatus(token);
      setUserStatus(status);
      console.log('AuthContext: User status loaded:', status?.subscription_status);
    } catch (error) {
      console.error('AuthContext: Failed to fetch user status:', error);
      // If token is invalid/expired (401/403), log out
      if (error.message.includes('Unauthorized')) {
        console.warn('AuthContext: Unauthorized fetching status, logging out.');
        await logout(); // Use internal logout which handles state updates
      } else {
        // For other errors, maybe clear status but keep token?
        setUserStatus(null);
      }
    }
  }, []); // useCallback dependency - empty as it doesn't depend on props/state outside

  // --- Logout function (defined before useEffect/login that might call it) ---
  const logout = useCallback(async () => {
    console.log('AuthContext: Initiating logout...');
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('authToken');
      setAuthToken(null);
      setUserStatus(null); // Clear user status on logout
      console.log('AuthContext: Token removed and state cleared.');
    } catch (error) {
      console.error('AuthContext: Error removing token during logout:', error);
    } finally {
      // Ensure loading stops even if logout fails
      setIsLoading(false);
    }
  }, []); // useCallback dependency

  // Check for token on initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      let storedToken = null;
      try {
        storedToken = await SecureStore.getItemAsync('authToken');
        if (storedToken) {
          console.log('AuthContext: Token found in SecureStore.');
          setAuthToken(storedToken);
          await loadUserStatus(storedToken); // Fetch status using the found token
        } else {
          console.log('AuthContext: No token found.');
          setAuthToken(null);
          setUserStatus(null);
        }
      } catch (error) {
        console.error('AuthContext: Error during initial load:', error);
        setAuthToken(null);
        setUserStatus(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
    // We only want loadUserStatus in the dependency array if it could change
    // Since it's wrapped in useCallback with [], it won't change, so useEffect runs once.
  }, [loadUserStatus]);

  // Login function
  const login = useCallback(async (token) => {
    setIsLoading(true);
    try {
      await SecureStore.setItemAsync('authToken', token);
      setAuthToken(token);
      console.log('AuthContext: Token stored, fetching user status...');
      await loadUserStatus(token); // Fetch status after setting token
    } catch (error) {
      console.error('AuthContext: Error during login process:', error);
      // Ensure cleanup if error occurs after setting token but before status fetch
      await logout();
    } finally {
      setIsLoading(false);
    }
  }, [loadUserStatus, logout]); // Dependencies for useCallback

  // Provide state and functions to children
  const value = {
    authToken,
    userStatus, // Expose user status
    isLoading,
    login,
    logout,
    // Derived state can be added here if needed, e.g.:
    // isSubscribed: userStatus?.subscription_status === 'active',
  };

  // Loading indicator handled by AppNavigator now

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Create useAuth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Optional: Loading indicator style
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background, // Use theme background
  },
}); 