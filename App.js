// Remove default Expo content 
// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

import React from 'react';
import AppNavigator from './navigation/AppNavigator'; // Import the navigator
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { StripeProvider } from '@stripe/stripe-react-native'; // Import StripeProvider
import { STRIPE_PUBLISHABLE_KEY } from './config/stripe'; // Import key from config

// // Replace with your actual publishable key (use environment variables ideally)
// const STRIPE_PUBLISHABLE_KEY = 'pk_test_51N9hXsAUFhzONqTbyG574zOqL65nFTrUpvO3AZX7VtoHrbTnm18DYuI4tDZoknsIkG3k9E1U2DzoAKfzI6zOKVxR00TBKqM77i';

export default function App() {
  if (!STRIPE_PUBLISHABLE_KEY) {
      console.error("Stripe Publishable Key is not set! Please check config/stripe.js or environment variables.");
      // Optionally return a loading/error state or null
      // return null;
  }

  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      // urlScheme="your-url-scheme" // Required for specific flows like Alipay
      // merchantIdentifier="merchant.com.{{YOUR_APP_NAME}}" // Required for Apple Pay
    >
      <AuthProvider> // Wrap with AuthProvider
        <AppNavigator /> // Render the navigator
      </AuthProvider>
    </StripeProvider>
    // <View style={styles.container}>
    //   <Text>Open up App.js to start working on your app!</Text>
    //   <StatusBar style="auto" />
    // </View>
  );
}

// Remove default styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// }); 