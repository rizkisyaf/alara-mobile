import React, { useState } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Linking // Import Linking
} from 'react-native';
import { Colors } from '../constants/Colors';
import { typography } from '../constants/typography';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { createBillingPortalSession } from '../api/billing'; // Import the new API helper
import * as WebBrowser from 'expo-web-browser'; // Use Expo WebBrowser for better in-app experience

function BillingScreen() {
  const { authToken, userStatus } = useAuth(); // Get authToken and userStatus
  const [isLoading, setIsLoading] = useState(false);

  // Extract relevant subscription info from userStatus
  const status = userStatus?.subscription_status || 'unknown';
  const plan = userStatus?.subscription_plan || 'N/A'; // Or map price ID to name
  const expiry = userStatus?.subscription_expiry 
                 ? new Date(userStatus.subscription_expiry).toLocaleDateString()
                 : 'N/A';

  const handleManageSubscription = async () => {
    if (!authToken) {
      Alert.alert('Error', 'Authentication required.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await createBillingPortalSession(authToken);
      // Use Expo WebBrowser for a better in-app browser experience
      await WebBrowser.openBrowserAsync(response.url);
      // Linking.openURL(response.url); // Alternative if not using Expo WebBrowser
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      Alert.alert('Error', error.message || 'Could not open billing portal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Billing & Subscription</Text>

      {/* Display Subscription Status */}
      <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={[styles.infoValue, styles[`status_${status}`]]}>{status.replace('_', ' ').toUpperCase()}</Text> 
      </View>
      <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Current Plan:</Text>
          <Text style={styles.infoValue}>{plan}</Text>
      </View>
      <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Renews/Expires On:</Text>
          <Text style={styles.infoValue}>{expiry}</Text>
      </View>

      {/* Manage Subscription Button */}
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleManageSubscription}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.buttonTextPrimary} />
        ) : (
          <Text style={styles.buttonText}>Manage Subscription</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.infoText}>Manage your payment methods, view invoices, or cancel your subscription via the Stripe Customer Portal.</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center', // Remove center alignment to place content normally
    alignItems: 'center',
    padding: 30, // Increase padding
    paddingTop: 60, // Add more top padding
    backgroundColor: Colors.dark.background,
  },
  title: {
    fontSize: typography.fontSizes.h2, // Adjust size
    fontWeight: typography.fontWeights.bold,
    color: Colors.dark.text,
    marginBottom: 40, // Increase spacing
  },
  infoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%', // Take full width
      marginBottom: 15,
      paddingVertical: 10,
      paddingHorizontal: 15,
      backgroundColor: Colors.dark.card, // Add card background
      borderRadius: 8,
  },
  infoLabel: {
      fontSize: typography.fontSizes.body,
      color: Colors.dark.textSecondary,
      fontWeight: typography.fontWeights.medium,
  },
  infoValue: {
      fontSize: typography.fontSizes.body,
      color: Colors.dark.text,
      fontWeight: typography.fontWeights.regular,
  },
  // Status-specific styling (add more as needed)
  status_active: {
      color: Colors.success || 'green',
      fontWeight: 'bold',
  },
  status_canceled: {
       color: Colors.error || 'red',
       fontWeight: 'bold',
  },
   status_active_grace: {
      color: Colors.warning || 'orange',
      fontWeight: 'bold',
  },
    status_past_due: {
      color: Colors.error || 'red',
      fontWeight: 'bold',
  },
   status_unknown: {
      color: Colors.dark.textSecondary,
      fontStyle: 'italic',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.dark.tint,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 30, // Add margin top
    marginBottom: 20,
  },
  buttonDisabled: {
      opacity: 0.6,
  },
  buttonText: {
    color: Colors.dark.background,
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold,
  },
  infoText: {
      fontSize: typography.fontSizes.small,
      color: Colors.dark.textSecondary,
      textAlign: 'center',
      marginTop: 10,
      lineHeight: 18,
  },
});

export default BillingScreen; 