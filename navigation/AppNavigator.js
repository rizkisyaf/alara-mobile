import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { View, ActivityIndicator, StyleSheet } from 'react-native'; // Import loading components
import { colors } from '../constants/colors'; // Import colors for loading screen

// Import screens here (we'll create these next)
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import PaywallScreen from '../screens/PaywallScreen';
import MainScreen from '../screens/MainScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { authToken, isLoading } = useAuth(); // Use the hook
  // TODO: Add subscription status logic here later
  const hasActiveSubscription = false; // Placeholder - This needs to come from user state/context

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authToken ? ( // Render based on authToken presence
          // User is logged in
          hasActiveSubscription ? (
            // Logged in and Subscribed: Show Main App
            <Stack.Screen name="Main" component={MainScreen} />
          ) : (
            // Logged in but NOT Subscribed: Show Paywall
            <Stack.Screen name="Paywall" component={PaywallScreen} />
          )
        ) : (
          // User is not logged in: Show Auth Screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default AppNavigator; 