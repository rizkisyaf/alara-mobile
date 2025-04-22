// Remove default Expo content 
// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import AppNavigator from './navigation/AppNavigator'; // Import the navigator
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { StripeProvider } from '@stripe/stripe-react-native'; // Import StripeProvider
import { STRIPE_PUBLISHABLE_KEY } from './config/stripe'; // Import key from config
import { colors } from './constants/colors'; // Import colors
import { MenuProvider } from 'react-native-popup-menu'; // Import MenuProvider

// // Replace with your actual publishable key (use environment variables ideally)
// const STRIPE_PUBLISHABLE_KEY = 'pk_test_51N9hXsAUFhzONqTbyG574zOqL65nFTrUpvO3AZX7VtoHrbTnm18DYuI4tDZoknsIkG3k9E1U2DzoAKfzI6zOKVxR00TBKqM77i';

export default function App() {
  if (!STRIPE_PUBLISHABLE_KEY) {
      console.error("Stripe Publishable Key is not set! Please check config/stripe.js or environment variables.");
      // Optionally return a loading/error state or null
      // return null;
  }

  return (
    <MenuProvider>
      <StripeProvider
        publishableKey={STRIPE_PUBLISHABLE_KEY}
        // urlScheme="your-url-scheme" // Required for specific flows like Alipay
        // merchantIdentifier="merchant.com.{{YOUR_APP_NAME}}" // Required for Apple Pay
      >
        <AuthProvider>
          <View style={styles.container}>
            <AppNavigator />
            <StatusBar style="auto" />
          </View>
        </AuthProvider>
      </StripeProvider>
    </MenuProvider>
    // <View style={styles.container}>
    //   <Text>Open up App.js to start working on your app!</Text>
    //   <StatusBar style="auto" />
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Use background color from constants
    // Add padding top if needed for status bar overlap, handled by SafeAreaView usually
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
}); 