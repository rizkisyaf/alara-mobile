import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { useAuth } from '../context/AuthContext'; // Import useAuth for logout
import { createSubscriptionIntent } from '../api/billing'; // Import the new API function

// TODO: Add navigation prop type if using TypeScript
function PaywallScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState(null); // 'monthly' or 'yearly'
  const [isSubscribing, setIsSubscribing] = useState(false); // Loading state for subscribe button
  const { logout, authToken, userStatus } = useAuth(); // Get token and userStatus
  const { initPaymentSheet, presentPaymentSheet } = useStripe(); // Stripe hooks

  // --- Fetch Subscription Intent and Initialize PaymentSheet ---
  const initializePaymentSheet = async () => {
    if (!selectedPlan || !authToken) {
      // Should not happen if button is disabled correctly, but good practice
      console.log('InitializePaymentSheet: Missing plan or auth token.');
      return false;
    }

    setIsSubscribing(true);
    try {
      console.log(`Calling createSubscriptionIntent for plan: ${selectedPlan}`);
      const { client_secret, subscription_id } = await createSubscriptionIntent(authToken, selectedPlan);

      console.log('Initializing Payment Sheet...');
      const { error } = await initPaymentSheet({
        // merchantDisplayName: "Alara Example, Inc.", // Optional: Your app name
        // customerId: customerId, // Optional: Can be pre-filled if you use Ephemeral Keys
        // customerEphemeralKeySecret: ephemeralKey, // Optional: Needed if using customerId
        paymentIntentClientSecret: client_secret,
        // setupIntentClientSecret: client_secret, // Use if it's a SetupIntent
        // customerId: userStatus?.stripe_customer_id, // This requires ephemeral key
        allowsDelayedPaymentMethods: false, // Or true if you allow bank transfers etc.
        returnURL: 'alara://stripe-redirect', // Optional: For specific redirect flows
        // defaultBillingDetails: { // Optional: Prefill billing details
        //   name: userStatus?.name,
        //   email: userStatus?.email,
        // }
      });

      if (error) {
        console.error('Stripe initPaymentSheet error:', error);
        Alert.alert(`Error initializing payment: ${error.code}`, error.message);
        setIsSubscribing(false);
        return false;
      }
      console.log('Payment Sheet initialized successfully.');
      return true; // Indicate success

    } catch (apiError) {
      console.error('API error creating subscription intent:', apiError);
      Alert.alert('Error Setting Up Subscription', apiError.message || 'Could not connect to server.');
      setIsSubscribing(false);
      return false;
    }
  };

  // --- Present PaymentSheet --- 
  const openPaymentSheet = async () => {
    console.log('Presenting Payment Sheet...');
    const { error } = await presentPaymentSheet();

    if (error) {
      console.log(`Stripe presentPaymentSheet error: ${error.code}`, error.message);
      if (error.code !== 'Canceled') { // Don't show error if user simply canceled
          Alert.alert(`Payment Error: ${error.code}`, error.message);
      }
    } else {
      console.log('Payment successful!');
      Alert.alert('Subscription Activated!', 'Your payment was successful. Welcome to Alara!');
      // IMPORTANT: The actual subscription status update relies on the backend webhook.
      // The AuthContext should ideally refetch user status or listen for an update
      // which will then trigger the AppNavigator to show the Main screen.
      // For now, the alert provides feedback, but the UI transition depends on context update.
    }
    setIsSubscribing(false); // Stop loading after payment sheet interaction
  };

  // --- Main Subscribe Handler --- 
  const handleSubscribe = async () => {
    if (!selectedPlan) {
      Alert.alert('Select a Plan', 'Please choose a subscription plan first.');
      return;
    }
    
    const initialized = await initializePaymentSheet();
    if (initialized) {
      await openPaymentSheet();
    }
    // Loading state is handled within initializePaymentSheet and openPaymentSheet
  };

  const handleLogout = async () => {
    await logout();
    // Navigation should automatically switch back to Auth stack via AppNavigator
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <Text style={styles.title}>Unlock Alara Access</Text>
        <Text style={styles.subtitle}>Choose your plan to continue:</Text>

        {/* Plan Options */}
        <View style={styles.planContainer}>
          {/* Monthly Plan */}
          <TouchableOpacity
            style={[
              styles.planOption,
              selectedPlan === 'monthly' && styles.planOptionSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
            disabled={isSubscribing} // Disable plan selection during subscribe process
          >
            <Text style={styles.planTitle}>Monthly</Text>
            <Text style={styles.planPrice}>$12</Text>
            <Text style={styles.planFrequency}>per month</Text>
          </TouchableOpacity>

          {/* Yearly Plan */}
          <TouchableOpacity
            style={[
              styles.planOption,
              selectedPlan === 'yearly' && styles.planOptionSelected,
            ]}
            onPress={() => setSelectedPlan('yearly')}
            disabled={isSubscribing}
          >
             <View style={styles.badgeContainer}> // Badge for Yearly
                <Text style={styles.badgeText}>SAVE 16%</Text>
            </View>
            <Text style={styles.planTitle}>Yearly</Text>
            <Text style={styles.planPrice}>$120</Text>
            <Text style={styles.planFrequency}>per year</Text>
            <Text style={styles.planEquivalent}>($10/month)</Text>
          </TouchableOpacity>
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.button, !selectedPlan && styles.buttonDisabled]} // Disable if no plan selected
          onPress={handleSubscribe}
          disabled={!selectedPlan}
        >
          <Text style={styles.buttonText}>Subscribe</Text>
        </TouchableOpacity>

        {/* TODO: Add Restore Purchases link */}
        {/* <TouchableOpacity style={styles.linkContainer}>
          <Text style={styles.linkText}>Restore Purchases</Text>
        </TouchableOpacity> */}

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingTop: 40, // Add padding at the top
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSizes.h1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSizes.large,
    color: colors.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  planContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  planOption: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '45%', // Adjust width for spacing
    backgroundColor: colors.card, // Use card background
  },
  planOptionSelected: {
    borderColor: colors.accent, // Highlight selected plan (using accent/primary)
    backgroundColor: '#222', // Slightly lighter background when selected
  },
  planTitle: {
    fontSize: typography.fontSizes.h4,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.cardText,
    marginBottom: 5,
  },
  planPrice: {
    fontSize: typography.fontSizes.h2,
    fontWeight: typography.fontWeights.bold,
    color: colors.cardText,
    marginBottom: 2,
  },
  planFrequency: {
    fontSize: typography.fontSizes.small,
    color: colors.text, // Slightly dimmer text
    marginBottom: 5,
  },
  planEquivalent: {
    fontSize: typography.fontSizes.small,
    color: colors.success, // Use success color
    marginTop: 5,
  },
  badgeContainer: {
      position: 'absolute',
      top: -12, // Adjust position
      // right: -10,
      backgroundColor: colors.success, // Badge color
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12, // Pill shape
      zIndex: 1,
  },
  badgeText: {
      color: '#fff', // White text for badge
      fontSize: typography.fontSizes.caption,
      fontWeight: typography.fontWeights.bold,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: colors.secondary,
    opacity: 0.5,
  },
  buttonText: {
    color: colors.buttonTextPrimary,
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold,
  },
  logoutButton: {
    position: 'absolute',
    bottom: 40,
    // alignSelf: 'center', // Center if needed
  },
  logoutButtonText: {
    color: colors.error, // Use error color for logout
    fontSize: typography.fontSizes.medium,
  },
  // Link styles if needed later
  // linkContainer: {
  //   marginTop: 20,
  // },
  // linkText: {
  //   color: colors.primary,
  //   fontSize: typography.fontSizes.medium,
  // },
});

export default PaywallScreen; 