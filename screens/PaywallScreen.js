import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { useAuth } from '../context/AuthContext'; // Import useAuth for logout

// TODO: Add navigation prop type if using TypeScript
function PaywallScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState(null); // 'monthly' or 'yearly'
  const { logout } = useAuth(); // Get logout function

  const handleSubscribe = () => {
    if (!selectedPlan) {
      Alert.alert('Select a Plan', 'Please choose a subscription plan first.');
      return;
    }
    // TODO: Implement Stripe Payment Flow
    console.log('Attempting to subscribe to:', selectedPlan);
    Alert.alert('Subscribe Pressed', `Plan: ${selectedPlan}`); // Placeholder
    // On success, Stripe webhook should update status, and context should reflect it,
    // causing AppNavigator to switch to Main screen automatically.
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