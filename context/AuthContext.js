import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

// 1. Create Context
const AuthContext = createContext(null);

// 2. Create AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading until token check is done
  // TODO: Add user state and subscription status state later

  // Check for token on initial load
  useEffect(() => {
    const loadToken = async () => {
      setIsLoading(true);
      try {
        const storedToken = await SecureStore.getItemAsync('authToken');
        if (storedToken) {
          console.log('AuthContext: Token found in SecureStore.');
          setAuthToken(storedToken);
          // TODO: Optionally validate token with backend here (/api/users/me)
        } else {
          console.log('AuthContext: No token found in SecureStore.');
          setAuthToken(null);
        }
      } catch (error) {
        console.error('AuthContext: Error loading token from SecureStore:', error);
        setAuthToken(null); // Assume logged out if error occurs
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Login function
  const login = async (token) => {
    setIsLoading(true);
    try {
      await SecureStore.setItemAsync('authToken', token);
      setAuthToken(token);
      console.log('AuthContext: Token stored and state updated.');
      // TODO: Fetch user details/subscription status after login
    } catch (error) {
      console.error('AuthContext: Error saving token:', error);
      // Handle error appropriately, maybe logout?
      setAuthToken(null);
      await SecureStore.deleteItemAsync('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('authToken');
      setAuthToken(null);
      console.log('AuthContext: Token removed and state updated.');
      // Clear any other user-related state here
    } catch (error) {
      console.error('AuthContext: Error removing token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Provide state and functions to children
  const value = {
    authToken,
    isLoading, // Expose loading state for splash screen/navigator logic
    login,
    logout,
    // TODO: Add user, subscriptionStatus later
  };

  // Display loading indicator while checking token initially
  // This can interfere with navigator logic, better handled in AppNavigator
  // if (isLoading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color={colors.primary} />
  //     </View>
  //   );
  // }

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