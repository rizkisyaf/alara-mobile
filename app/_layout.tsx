import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { MenuProvider } from 'react-native-popup-menu';

import { AuthProvider, useAuth } from '@/context/AuthContext'; // Adjust path if needed
import stripeConfig from '@/config/stripe'; // Adjust path if needed
import { Colors } from '@/constants/Colors'; // Adjust path if needed

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  console.log('--- InitialLayout Render ---'); // Log render
  const auth = useAuth(); // Get the whole context first
  const segments = useSegments();
  const router = useRouter();

  // Add a check for auth context existence
  if (!auth) {
     console.warn('Auth context not available yet in InitialLayout');
     return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.dark.tint} />
        </View>
     );
  }

  // Now destructure safely
  const { authToken, isLoading, userStatus } = auth;
  console.log(`InitialLayout State: isLoading=${isLoading}, authToken=${!!authToken}`); // Log state

  useEffect(() => {
    console.log('--- InitialLayout useEffect Triggered ---'); // Log effect trigger
    // Wait until loading is finished
    if (isLoading) {
        console.log('useEffect: Still loading auth state, returning...');
        return;
    }
    console.log('useEffect: Auth state loaded.');

    // Cast segment to string for comparison to satisfy linter
    const currentSegment = String(segments[0]);
    const inAuthGroup = currentSegment === '(auth)';
    const inAppGroup = currentSegment === '(tabs)';

    // Use type assertion for userStatus temporarily
    const subscriptionStatus = (userStatus as any)?.subscription_status;
    console.log(`useEffect Check: authToken=${!!authToken}, status=${subscriptionStatus}, currentSegment=${currentSegment}`);

    if (authToken) {
      console.log('useEffect: User is authenticated.');
      // User is authenticated
      if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
        console.log('useEffect: User is subscribed/trialing.');
        // User is subscribed or trialing, navigate to main app
        if (!inAppGroup) {
            console.log('>>> Redirecting to (tabs)...');
             // Use type assertion for route temporarily
            router.replace('/(tabs)/' as any);
        }
      } else {
        console.log('useEffect: User NOT subscribed/trialing.');
        // User is authenticated but not subscribed, navigate to paywall
        // Check if already on paywall to prevent loop
        // Cast segment to string for comparison
        if (currentSegment !== 'paywall') {
            console.log('>>> Redirecting to /paywall...');
             // Use type assertion for route temporarily
            router.replace('/paywall' as any);
        }
      }
    } else {
      console.log('useEffect: User is NOT authenticated.');
      // User is not authenticated, navigate to auth flow
      if (!inAuthGroup) {
          console.log('>>> Redirecting to /login...');
           // Use type assertion for route temporarily
          router.replace('/(auth)/login' as any);
      }
    }
  }, [isLoading, authToken, userStatus, segments, router]);

  if (isLoading) {
    console.log('InitialLayout: Rendering loading indicator because isLoading is true.');
    // Optionally return a loading spinner or splash screen component
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.dark.tint} />
        </View>
    );
  }

  console.log('InitialLayout: Rendering Stack because isLoading is false.');
  // This layout component renders the stack navigator defined below
  return (
      <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="paywall" />
          {/* Add other modal screens or full-screen routes outside tabs/auth here if needed */}
          <Stack.Screen name="+not-found" />
      </Stack>
  );
};

export default function RootLayout() {
  // Load custom fonts (optional)
  const [loaded, error] = useFonts({
    // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // Add other fonts here
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded && !error) { // Show loading indicator until fonts load OR an error occurs
     return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.dark.tint} />
        </View>
    );
  }

  return (
    <AuthProvider>
      <StripeProvider publishableKey={stripeConfig.publishableKey}>
        <MenuProvider>
           {/* The InitialLayout component handles the actual navigation stack based on auth */}
           <InitialLayout />
           {/* Set status bar style globally */}
           <StatusBar style="light" />
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
        backgroundColor: Colors.dark.background,
    }
});

