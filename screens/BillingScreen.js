import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/Colors'; // Corrected import
import { typography } from '../constants/typography';
import { getBillingPortalSessionUrl } from '../api/billing'; // Assuming API helper exists
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message'; // Import Toast

function BillingScreen() {
  const { authToken, userStatus } = useAuth(); // Get authToken and userStatus
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [portalError, setPortalError] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

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
    setIsLoadingPortal(true);
    setPortalError(null);
    try {
      const response = await getBillingPortalSessionUrl(authToken);
      Linking.openURL(response.url);
      // Optionally show success Toast for initiating portal redirect
      Toast.show({
        type: 'success',
        text1: 'Redirecting',
        text2: 'Opening billing portal...'
      });
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      // setPortalError(error.message || 'Could not open billing portal.');
      const message = error.message || 'Could not open billing portal.';
      Toast.show({
        type: 'error',
        text1: 'Billing Portal Error',
        text2: message
      });
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Billing & Subscription</Text>

        {/* Display Current Subscription Status (Placeholder) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          {isLoadingStatus ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.statusText}>
              {subscriptionStatus || 'Checking status...'}
            </Text>
          )}
        </View>

        {/* Add more sections as needed: payment history, invoices, etc. */}

        {/* Manage Subscription Button */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Manage Your Subscription</Text>
          <Text style={styles.description}>
            Click below to manage your subscription details, view invoices, or update payment methods via the Stripe Customer Portal.
          </Text>
          <TouchableOpacity
            style={[styles.button, isLoadingPortal && styles.buttonDisabled]}
            onPress={handleManageSubscription}
            disabled={isLoadingPortal}
          >
            {isLoadingPortal ? (
              <ActivityIndicator size="small" color={colors.buttonTextPrimary} />
            ) : (
              <Text style={styles.buttonText}>Manage Subscription</Text>
            )}
          </TouchableOpacity>
          {/* Remove the text error display, rely on Toast now */}
          {/* {portalError && <Text style={styles.errorText}>{portalError}</Text>} */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Use colors.*
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: typography.fontSizes.h2,
    fontWeight: typography.fontWeights.bold,
    color: colors.text, // Use colors.*
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: colors.card, // Use colors.*
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.h4,
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary, // Use colors.*
    marginBottom: 10,
  },
  statusText: {
    fontSize: typography.fontSizes.body,
    color: colors.text, // Use colors.*
    fontStyle: 'italic',
  },
  description: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary, // Use colors.*
    marginBottom: 15,
    lineHeight: typography.lineHeights.body,
  },
  button: {
    backgroundColor: colors.primary, // Use colors.*
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.buttonTextPrimary, // Use colors.*
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold,
  },
  errorText: {
    color: colors.error,
    marginTop: 10,
    textAlign: 'center',
    fontSize: typography.fontSizes.small,
  },
});

export default BillingScreen; 