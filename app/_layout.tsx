import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { MenuProvider } from 'react-native-popup-menu';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseToastProps } from 'react-native-toast-message';

import { AuthProvider, useAuth } from '@/context/AuthContext'; // Adjust path if needed
import stripeConfig from '@/config/stripe'; // Adjust path if needed
import { colors } from '@/constants/Colors'; // Adjust path if needed
// Import custom toast components
import { SuccessToast, ErrorToast } from '@/components/toast/CustomToast'; // Adjust path if needed

// Prevent the splash screen from auto-hiding.
SplashScreen.preventAutoHideAsync();

// Define the toast config with explicit types
const toastConfig = {
  success: (props: BaseToastProps) => <SuccessToast {...props} />,
  error: (props: BaseToastProps) => <ErrorToast {...props} />,
  /*
    Optionally override other types or define custom types:
    info: (props) => <InfoToast {...props} />,
    any_custom_type: (props) => <CustomToast {...props} />
  */
};

const InitialLayout = () => {
  console.log('--- InitialLayout Render ---');
  const auth = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Add state for onboarding check
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Add a check for auth context existence
  if (!auth) {
     console.warn('Auth context not available yet in InitialLayout');
     return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
     );
  }

  const { authToken, isLoading: isAuthLoading, userStatus } = auth;
  console.log(`InitialLayout State: isAuthLoading=${isAuthLoading}, isOnboardingLoading=${isOnboardingLoading}, authToken=${!!authToken}`);

  useEffect(() => {
    const checkAppStatusAndNavigate = async () => {
      console.log('--- checkAppStatusAndNavigate useEffect Triggered ---');

      // 1. Check Onboarding Status
      let onboardingComplete = false;
      try {
        const storedStatus = await AsyncStorage.getItem('onboardingComplete');
        onboardingComplete = storedStatus === 'true';
        setShowOnboarding(!onboardingComplete);
        console.log('Onboarding check complete. Value:', storedStatus, ', Show onboarding:', !onboardingComplete);
      } catch (e) {
        console.error("Failed to load onboarding status:", e);
        setShowOnboarding(true); // Default to show onboarding on error
      } finally {
        setIsOnboardingLoading(false);
      }

      // 2. Wait until auth is also loaded
      if (isAuthLoading) {
          console.log('Auth state still loading, waiting...');
          return; // Exit effect if auth isn't loaded yet
      }

      // 3. Both checks are done, hide splash screen
      console.log('Auth & Onboarding checks complete. Hiding splash screen.');
      await SplashScreen.hideAsync();

      // 4. Perform Routing Logic
      console.log('Performing routing logic...');
      const currentSegment = String(segments[0]);
      const inAuthGroup = currentSegment === '(auth)';
      const inAppGroup = currentSegment === '(tabs)';
      const inOnboarding = currentSegment === 'onboarding';
      const subscriptionStatus = (userStatus as any)?.subscription_status;

      if (!onboardingComplete) {
        // Needs onboarding
        if (!inOnboarding) {
            console.log('>>> Redirecting to /onboarding...');
            router.replace('/onboarding' as any);
        }
      } else if (authToken) {
        // Onboarding done, user is authenticated
        if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
          // Subscribed/Trialing -> App
          if (!inAppGroup) {
            console.log('>>> Redirecting to (tabs)...');
            router.replace('/(tabs)' as any);
          }
        } else {
          // Not Subscribed -> Paywall
          if (currentSegment !== 'paywall') {
            console.log('>>> Redirecting to /paywall...');
            router.replace('/paywall' as any);
          }
        }
      } else {
        // Onboarding done, user NOT authenticated -> Auth
        if (!inAuthGroup) {
          console.log('>>> Redirecting to /login...');
          router.replace('/(auth)/login' as any);
        }
      }
    };

    checkAppStatusAndNavigate();

  }, [isAuthLoading, authToken, userStatus, segments, router]); // Rerun when auth state changes or navigation potentially changes

  // Render Stack only after checks are done AND splash screen is hidden
  // While checks run, RootLayout shows loading/null, splash stays visible
  // We return Stack immediately here, the useEffect handles redirection
  console.log('InitialLayout: Rendering Stack Navigator.');
  return (
      <Stack screenOptions={{
          headerShown: false,
          animation: 'fade', // Use fade animation for smoother transitions
          animationDuration: 250, // Adjust duration as needed (default is ~350ms)
      }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="paywall" />
          <Stack.Screen name="onboarding" />{/* Add onboarding route */}
          <Stack.Screen name="+not-found" />
      </Stack>
  );
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // Add other fonts here
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Remove splash screen hiding based on font loading
  // useEffect(() => {
  //   if (loaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [loaded]);

  // Show loading indicator only while fonts are loading
  if (!loaded && !error) {
     return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
  }

  // Fonts are loaded, render the rest
  return (
    <AuthProvider>
      <StripeProvider publishableKey={stripeConfig.publishableKey}>
        <MenuProvider>
           <InitialLayout />
           <StatusBar style="light" />
           <Toast config={toastConfig} />
        </MenuProvider>
      </StripeProvider>
    </AuthProvider>
  );
}
const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    }
});

