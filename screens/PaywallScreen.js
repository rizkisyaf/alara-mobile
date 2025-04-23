import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
  Platform,
  Image
} from 'react-native';
import Toast from 'react-native-toast-message'; // Import Toast
import { useStripe } from '@stripe/stripe-react-native';
import { colors } from '../constants/Colors';
import { typography } from '../constants/typography';
import { useAuth } from '../context/AuthContext'; // Import useAuth for logout
import { createSubscriptionIntent } from '../api/billing'; // Import the new API function
import { Ionicons } from '@expo/vector-icons'; // <-- Import icons
import Collapsible from 'react-native-collapsible'; // <-- Import Collapsible

// --- Define Prices --- >
const MONTHLY_PRICE_USD = 12;
const YEARLY_PRICE_USD = 120;
const YEARLY_MONTHLY_EQUIVALENT_USD = Math.round(YEARLY_PRICE_USD / 12);
// --- < -------------

// --- FAQ Data --- >
const faqData = [
  {
    id: 1,
    question: 'Q: What do I get with Alara Access?',
    answer: 'Unlimited AI chat & analysis tools, connections to all supported exchanges, portfolio tracking, market scanners, and premium indicators.'
  },
  {
    id: 2,
    question: 'Q: How does Alara help my trading?',
    answer: 'Alara provides data-driven insights from your exchanges and market data (without financial advice). It helps research, monitor, and stay informed based on your trading goals.'
  },
  {
    id: 3,
    question: 'Q: Can I cancel anytime?',
    answer: 'Yes, manage your subscription anytime via the billing portal (link in settings). Access continues until the end of your current paid period.'
  },
  {
    id: 4,
    question: 'Q: Is my exchange data secure?',
    answer: 'Yes. Your API keys are encrypted and only used by the secure backend to fetch data or execute actions you request.'
  },
  // Add more questions here
];
// --- < --------

// TODO: Add navigation prop type if using TypeScript
function PaywallScreen({ navigation }) {
  // const [selectedPlan, setSelectedPlan] = useState(null); // Remove this
  const [isYearly, setIsYearly] = useState(false); // <-- Add state for toggle (false = monthly)
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null); // <-- State for accordion
  const { authToken, userStatus } = useAuth(); // Get token and userStatus
  const { initPaymentSheet, presentPaymentSheet } = useStripe(); // Stripe hooks

  // --- Fetch Subscription Intent and Initialize PaymentSheet ---
  const initializePaymentSheet = async (plan_id) => {
    if (!plan_id || !authToken) {
      console.log('InitializePaymentSheet: Missing plan_id or auth token.');
      return false;
    }

    setIsSubscribing(true);
    try {
      console.log(`Calling createSubscriptionIntent for plan: ${plan_id}`);
      const { client_secret, subscription_id } = await createSubscriptionIntent(authToken, plan_id);

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
        // Alert.alert(`Error initializing payment: ${error.code}`, error.message);
        Toast.show({
          type: 'error',
          text1: 'Payment Setup Failed',
          text2: `Error: ${error.code}. ${error.message}`
        });
        setIsSubscribing(false);
        return false;
      }
      console.log('Payment Sheet initialized successfully.');
      return true; // Indicate success

    } catch (apiError) {
      console.error('API error creating subscription intent:', apiError);
      // Alert.alert('Error Setting Up Subscription', apiError.message || 'Could not connect to server.');
      const message = apiError instanceof Error ? apiError.message : 'Could not connect to server.';
      Toast.show({
          type: 'error',
          text1: 'Subscription Setup Failed',
          text2: message
      });
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
          // Alert.alert(`Payment Error: ${error.code}`, error.message);
          Toast.show({
            type: 'error',
            text1: 'Payment Failed',
            text2: `Error: ${error.code}. ${error.message}`
          });
      }
    } else {
      console.log('Payment successful!');
      // Alert.alert('Subscription Activated!', 'Your payment was successful. Welcome to Alara!');
      Toast.show({
        type: 'success',
        text1: 'Payment Successful!',
        text2: 'Your subscription is being activated.'
        // Visibility time can be adjusted if needed
        // visibilityTime: 4000 
      });
      // IMPORTANT: Actual status update relies on backend webhook + AuthContext refresh.
    }
    setIsSubscribing(false); // Stop loading after payment sheet interaction
  };

  // --- Main Subscribe Handler --- 
  const handleSubscribe = async () => {
    // Remove check for selectedPlan, button disabled state handles this
    // if (!selectedPlan) { ... }
    
    // Determine plan_id based on toggle state
    const plan_id = isYearly ? 'yearly' : 'monthly';

    // Pass the determined plan_id to initializePaymentSheet
    const initialized = await initializePaymentSheet(plan_id); 
    if (initialized) {
      await openPaymentSheet();
    }
    // Loading state is handled within initializePaymentSheet and openPaymentSheet
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Unlock Alara Access</Text>
        {/* Subtitle can be removed or kept */} 
        {/* <Text style={styles.subtitle}>Choose your plan:</Text> */}

        {/* --- New Segmented Control Plan Display --- */}
        <View style={styles.planDisplayContainer}>
          
          {/* Segmented Control */}
          <View style={styles.segmentedControlContainer}>
            <TouchableOpacity 
              style={[styles.segment, !isYearly && styles.segmentActive]} 
              onPress={() => setIsYearly(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, !isYearly && styles.segmentTextActive]}>Monthly</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.segment, isYearly && styles.segmentActive]} 
              onPress={() => setIsYearly(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, isYearly && styles.segmentTextActive]}>Yearly</Text>
            </TouchableOpacity>
          </View>

          {/* Integrated Price Display */} 
          <View style={styles.priceInfoContainer}> 
            <Text style={styles.priceText}>
              ${isYearly ? YEARLY_MONTHLY_EQUIVALENT_USD : MONTHLY_PRICE_USD}
              <Text style={styles.priceUnit}> / month</Text> { /* Always show / month */}
            </Text>
            <Text style={styles.billingCycleText}> 
              {isYearly ? `Billed annually` : 'Billed monthly'}
            </Text>
          </View>

        </View>
        {/* --- End New Plan Display --- */}

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.button, isSubscribing && styles.buttonDisabled]} // Disable only when subscribing
          onPress={handleSubscribe}
          disabled={isSubscribing} // Disable only when subscribing
        >
          {isSubscribing ? (
             <ActivityIndicator size="small" color={colors.buttonTextPrimary} />
           ) : (
             <Text style={styles.buttonText}>Subscribe</Text>
           )}
        </TouchableOpacity>

        {/* --- FAQ Section --- */}
        <View style={styles.faqContainer}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            
            {faqData.map((item, index) => {
              const isCollapsed = expandedFaqIndex !== index;
              return (
                <View key={item.id} style={styles.faqItem}>
                  <TouchableOpacity 
                    style={styles.faqQuestionRow} 
                    onPress={() => setExpandedFaqIndex(isCollapsed ? index : null)} // Updated logic slightly for clarity
                    activeOpacity={0.7} 
                  >
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                    <Ionicons 
                      name={isCollapsed ? "chevron-forward" : "chevron-down"} // Icon reflects collapsed state
                      style={styles.faqIcon} 
                    />
                  </TouchableOpacity>
                  
                  {/* --- Wrap answer in Collapsible --- */}
                  <Collapsible collapsed={isCollapsed} align="center">
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  </Collapsible>
                  {/* --- End Collapsible --- */}
                </View>
              );
            })}
        </View>
        {/* --- End FAQ Section --- */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1, // Allow container to grow
    justifyContent: 'center', // Center content vertically
    padding: 20,
    paddingBottom: 40,
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
  // --- Styles for Segmented Control / Dynamic Display / FAQ --- >
  planDisplayContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  segmentedControlContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card, // Background for the whole control
    borderRadius: 25, // Fully rounded ends
    overflow: 'hidden', // Clip segment backgrounds
    borderWidth: 1,
    borderColor: colors.border, // Optional border
    marginBottom: 20,
    width: '80%', // Adjust width as needed
    alignSelf: 'center',
  },
  segment: {
    flex: 1, // Each segment takes half the space
    paddingVertical: 10,
    alignItems: 'center', // Center text horizontally
    justifyContent: 'center', // Center text vertically
  },
  segmentActive: {
    backgroundColor: colors.primary, // Active background
  },
  segmentText: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.buttonTextPrimary, // Use button text color on active background
    fontWeight: typography.fontWeights.bold,
  },
  priceInfoContainer: {
    alignItems: 'center', 
    marginTop: 10,
  },
  priceText: {
    fontSize: typography.fontSizes.h1, 
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 2,
  },
  priceUnit: { // Renamed from priceFrequency
    fontSize: typography.fontSizes.large, // Slightly larger than billingCycleText
    color: colors.text,
    fontWeight: typography.fontWeights.regular,
  },
  billingCycleText: {
    fontSize: typography.fontSizes.small,
    color: colors.textSecondary, // Less prominent color
    marginTop: 4, // Increased spacing
  },
  faqContainer: {
    marginTop: 60, // Increased top margin
    marginBottom: 40, // Add bottom margin
    marginHorizontal: 10, // Add horizontal margin
    width: 'auto', // Adjust width based on horizontal margin
    // width: '100%', 
  },
  faqTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  faqItem: {
    marginBottom: 10, // Reduced bottom margin
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10, // Reduced bottom padding
  },
  faqQuestionRow: { // New style for the touchable row
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5, // Add some padding to the row
  },
  faqQuestion: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
    flex: 1, // Allow question text to wrap
    marginRight: 10, // Space between text and icon
    // Remove marginBottom as answer is now conditional
  },
  faqIcon: { // New style for the +/- icon
    fontSize: 22,
    color: colors.textSecondary,
  },
  faqAnswer: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
    lineHeight: 20, 
    marginTop: 8, // Add margin when visible
    paddingLeft: 5, // Indent answer slightly
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
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  buttonText: {
    color: colors.buttonTextPrimary,
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold,
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