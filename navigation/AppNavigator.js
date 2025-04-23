import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import * as SplashScreen from 'expo-splash-screen'; // Import SplashScreen

// Import screens here (we'll create these next)
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import PaywallScreen from '../screens/PaywallScreen';
import MainScreen from '../screens/MainScreen';
import ExchangeManagementScreen from '../screens/ExchangeManagementScreen'; // Import the new screen
import BillingScreen from '../screens/BillingScreen'; // Import BillingScreen
import SettingsScreen from '../screens/SettingsScreen'; // Import SettingsScreen
import OnboardingScreen from '../screens/OnboardingScreen'; // Import the Onboarding screen

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { authToken, isLoading: isAuthLoading, userStatus } = useAuth(); // Renamed isLoading to isAuthLoading
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false); // New state to track overall readiness

  // Determine subscription status based on context state
  const isSubscribed = userStatus?.subscription_status === 'active';

  useEffect(() => {
    const prepareApp = async () => {
      let onboardingCompleteFlag = false;
      console.log('AppNavigator: Checking onboarding status...'); // Log start
      try {
        // Check onboarding status
        const storedStatus = await AsyncStorage.getItem('onboardingComplete');
        console.log('AppNavigator: AsyncStorage onboardingComplete value:', storedStatus); // Log retrieved value
        onboardingCompleteFlag = storedStatus === 'true';
        setShowOnboarding(!onboardingCompleteFlag);
        console.log('AppNavigator: Setting showOnboarding to:', !onboardingCompleteFlag); // Log state set value
      } catch (e) {
        console.error("Failed to load onboarding status:", e);
        setShowOnboarding(true); // Default to showing onboarding on error
        console.log('AppNavigator: Error checking status, setting showOnboarding to true'); // Log error case
      } finally {
        setIsOnboardingLoading(false);
        // Don't hide splash screen yet, wait for auth check too
      }

      // Note: Auth loading state is handled by useAuth hook
      // We need to wait for BOTH onboarding check AND auth check to finish
    };

    prepareApp();
  }, []);

  // Effect to track when both checks are done and hide splash screen
  useEffect(() => {
    if (!isAuthLoading && !isOnboardingLoading) {
      setIsAppReady(true);
      console.log('App is ready, hiding splash screen.');
      SplashScreen.hideAsync();
    }
  }, [isAuthLoading, isOnboardingLoading]);

  // Show nothing until the app is ready (splash screen is visible)
  if (!isAppReady) {
    return null; // Return null while splash screen is visible and checks are running
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showOnboarding ? (
            // User needs to see onboarding first
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : authToken ? ( // Onboarding done, check auth
          // User is logged in
          isSubscribed ? (
            // Logged in and Subscribed: Show Main App Screens
            <>
                <Stack.Screen name="Main" component={MainScreen} />
                <Stack.Screen name="ExchangeManagement" component={ExchangeManagementScreen} />
                <Stack.Screen name="Billing" component={BillingScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                {/* Add other subscribed screens here */}
            </>
          ) : (
            // Logged in but NOT Subscribed: Show Paywall
            // We might need a separate stack or way to reach settings/billing from paywall
            <Stack.Screen name="Paywall" component={PaywallScreen} />
          )
        ) : (
          // Onboarding done, User is not logged in: Show Auth Screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Remove the loadingContainer style as it's no longer used
// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: colors.background,
//   },
// });

export default AppNavigator; 