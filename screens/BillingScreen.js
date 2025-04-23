import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/Colors'; // Corrected import
import { typography } from '../constants/typography';
import { verifyGooglePurchase } from '../api/billing';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message'; // Import Toast

// --- react-native-iap Imports ---
import {
  initConnection,
  endConnection,
  getSubscriptions,
  requestSubscription,
  purchaseErrorListener,
  purchaseUpdatedListener,
  flushFailedPurchasesCachedAsPendingAndroid,
  finishTransaction,
  // Removed type imports for JS compatibility
  // type SubscriptionPurchase,
  // type PurchaseError,
  // type Subscription,
} from 'react-native-iap';
// --- End react-native-iap Imports ---

// --- Define Subscription SKUs (Replace with your actual Google Play SKUs) ---
const subscriptionSkus = Platform.select({
  ios: [
    // 'com.example.alara.monthly', // Add your iOS SKUs here if needed
    // 'com.example.alara.yearly',
  ],
  android: [
    'monthly_subscription_test', // Replace with your actual monthly SKU
    'yearly_subscription_test', // Replace with your actual yearly SKU
  ],
  default: [],
});
// --- End Subscription SKUs ---

function BillingScreen() {
  const { authToken, userStatus, refreshUserStatus } = useAuth();
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]); // Use empty array for JS
  const [isPurchasing, setIsPurchasing] = useState(false);

  const currentStatus = userStatus?.google_play_status || 'unknown';
  const currentPlanSku = userStatus?.google_play_product_id || 'N/A';
  const currentExpiry = userStatus?.google_play_expiry_time
    ? new Date(userStatus.google_play_expiry_time).toLocaleDateString()
    : 'N/A';
  const isSubActive = currentStatus === 'active';

  // --- Initialize IAP Connection ---
  useEffect(() => {
    const initialize = async () => {
      try {
        await initConnection();
        if (Platform.OS === 'android') {
          await flushFailedPurchasesCachedAsPendingAndroid();
        }
        fetchAvailableSubscriptions();
      } catch (error) {
        console.error('Error initializing IAP connection:', error);
        Toast.show({
          type: 'error',
          text1: 'Store Connection Error',
          text2: 'Could not connect to the store.',
        });
      }
    };
    initialize();

    // --- Setup Purchase Listeners ---
    const purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase /* : SubscriptionPurchase */) => { // Removed TS type
        console.log('purchaseUpdatedListener triggered', purchase);
        const receipt = purchase.transactionReceipt;

        if (receipt) {
          try {
            setIsPurchasing(true);
            const parsedReceipt = Platform.OS === 'android' ? JSON.parse(receipt) : receipt;
            const purchaseToken = Platform.OS === 'android' ? parsedReceipt.purchaseToken : null;
            const productId = purchase.productId;

            if (!purchaseToken || !productId) {
                throw new Error('Missing purchase token or product ID in receipt.');
            }

            if (!authToken) {
                 throw new Error('Authentication token not available for verification.');
            }

            console.log(`Verifying purchase: Token=${purchaseToken.substring(0,10)}..., SKU=${productId}`);
            const verificationResult = await verifyGooglePurchase(
              authToken,
              purchaseToken,
              productId,
            );
            console.log('Backend Verification Result:', verificationResult);

            if (verificationResult && verificationResult.status === 'active') {
              Toast.show({
                type: 'success',
                text1: 'Purchase Successful!',
                text2: 'Your subscription is now active.',
              });
              await finishTransaction({ purchase, isConsumable: false });
              refreshUserStatus();
              console.log('Transaction finished successfully.');
            } else {
              throw new Error(
                verificationResult.message || 'Backend verification failed.',
              );
            }
          } catch (error) {
            console.error('Error during purchase verification or finishing:', error);
            Toast.show({
              type: 'error',
              text1: 'Purchase Error',
              text2: error.message || 'Could not complete purchase.',
            });
          } finally {
            setIsPurchasing(false);
          }
        } else {
          console.warn('Purchase update received without transactionReceipt.');
        }
      },
    );

    const purchaseErrorSubscription = purchaseErrorListener(
      (error /* : PurchaseError */) => { // Removed TS type
        console.warn('purchaseErrorListener triggered:', error);
        if (error.code !== 'E_USER_CANCELLED') {
          Toast.show({
            type: 'error',
            text1: 'Purchase Error',
            text2: error.message || 'An unknown error occurred.',
          });
        }
        setIsPurchasing(false);
      },
    );
    // --- End Listeners ---

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
      endConnection();
    };
  }, [authToken, refreshUserStatus]);
  // --- End IAP Connection & Listeners ---

  // --- Fetch Subscriptions ---
  const fetchAvailableSubscriptions = useCallback(async () => {
    if (!subscriptionSkus || subscriptionSkus.length === 0) {
      console.warn('No subscription SKUs defined for this platform.');
      return;
    }
    setIsLoadingProducts(true);
    try {
      console.log('Fetching subscriptions for SKUs:', subscriptionSkus);
      // const fetchedSubscriptions: Subscription[] = await getSubscriptions({ skus: subscriptionSkus }); // Removed TS type
      const fetchedSubscriptions = await getSubscriptions({ skus: subscriptionSkus });
      console.log('Fetched Subscriptions:', JSON.stringify(fetchedSubscriptions, null, 2));
      setSubscriptions(fetchedSubscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      Toast.show({
        type: 'error',
        text1: 'Store Error',
        text2: 'Could not load subscription options.',
      });
      setSubscriptions([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);
  // --- End Fetch Subscriptions ---

  // --- Handle Purchase Request ---
  const handlePurchaseSubscription = useCallback(async (sku /* : string */) => { // Removed TS type
    if (isPurchasing) return;
    setIsPurchasing(true);
    try {
      console.log(`Requesting subscription for SKU: ${sku}`);
      await requestSubscription({ sku });
    } catch (error) {
      console.error(`Error requesting subscription for SKU ${sku}:`, error);
      if (error.code !== 'E_USER_CANCELLED') {
          Toast.show({
            type: 'error',
            text1: 'Purchase Error',
            text2: error.message || 'Could not initiate purchase.',
          });
      }
      setIsPurchasing(false);
    }
  }, [isPurchasing]);
  // --- End Handle Purchase Request ---

  // --- Render Subscription Options ---
  const renderSubscriptionOption = (sub /* : Subscription */) => { // Removed TS type
    const planTitle = sub.title || sub.productId;
    const price = sub.localizedPrice || 'Price not available';
    const description = sub.description || '';
    const sku = sub.productId;
    
    const introPrice = sub.subscriptionOfferDetails?.[0]?.pricingPhases?.pricingPhaseList?.[0]?.formattedPrice;
    const introPeriod = sub.subscriptionOfferDetails?.[0]?.pricingPhases?.pricingPhaseList?.[0]?.billingPeriod;

    return (
      <TouchableOpacity
        key={sku}
        style={[styles.button, styles.subscriptionButton, (isPurchasing || isSubActive) && styles.buttonDisabled]}
        onPress={() => handlePurchaseSubscription(sku)}
        disabled={isPurchasing || isSubActive}
      >
        <Text style={styles.buttonText}>{planTitle}</Text>
        <Text style={styles.priceText}>{price}</Text>
        {introPrice && introPeriod && (
          <Text style={styles.introPriceText}>Intro: {introPrice} / {introPeriod}</Text>
        )}
        {description && <Text style={styles.subDescriptionText}>{description}</Text>}
      </TouchableOpacity>
    );
  };
  // --- End Render Subscription Options ---

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Billing & Subscription</Text>

        {/* Display Current Subscription Status (Placeholder) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          {/* Display simplified status for now */}
          <Text style={styles.statusText}>
            Status: <Text style={styles.statusValue}>{currentStatus}</Text>
          </Text>
           <Text style={styles.statusText}>
            Plan SKU: <Text style={styles.statusValue}>{currentPlanSku}</Text>
          </Text>
           <Text style={styles.statusText}>
            Expires: <Text style={styles.statusValue}>{currentExpiry}</Text>
          </Text>
          {isSubActive && (
            <Text style={[styles.statusText, styles.activeText]}>Subscription Active</Text>
          )}
        </View>

        {/* Subscription Options */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Choose a Plan</Text>
          {isLoadingProducts ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : subscriptions.length > 0 ? (
            // *** USE renderSubscriptionOption HERE ***
            subscriptions.map(renderSubscriptionOption) 
          ) : (
            <Text style={styles.description}>No subscription plans found.</Text>
          )}
          {isPurchasing && (
            <View style={styles.loadingOverlay}> 
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Processing purchase...</Text>
            </View>
          )}
          {isSubActive && (
            <Text style={styles.description}>You already have an active subscription.</Text>
          )}
        </View>

        {/* Removed the incorrect Manage Subscription section */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, 
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50, // Added padding back
  },
  title: {
    fontSize: typography.fontSizes.h2,
    fontWeight: typography.fontWeights.bold,
    color: colors.text, 
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: colors.card, 
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.h4,
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary, 
    marginBottom: 10,
  },
  statusText: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
    marginBottom: 5,
  },
   statusValue: { // Added style for value
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
  },
   activeText: { // Added style for active status
    color: colors.success, 
    fontWeight: typography.fontWeights.bold,
    marginTop: 10,
  },
  description: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary, 
    marginBottom: 15,
    lineHeight: typography.lineHeights.body,
  },
  button: {
    backgroundColor: colors.primary, 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
   subscriptionButton: { // Added back/kept style
    marginBottom: 15,
    alignItems: 'flex-start', 
    padding: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: colors.grey, // Use grey when disabled
  },
  buttonText: {
    color: colors.buttonTextPrimary, 
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold,
  },
  priceText: {
    color: colors.textSecondary, // Consistent with description
    fontSize: typography.fontSizes.body,
    marginTop: 4,
  },
  introPriceText: {
    color: colors.primary, // Highlight intro price
    fontSize: typography.fontSizes.small,
    fontWeight: typography.fontWeights.medium,
    marginTop: 4,
  },
  subDescriptionText: { // Added back/kept style
     color: colors.textSecondary, 
     fontSize: typography.fontSizes.small,
     marginTop: 6,
  },
  loadingOverlay: { // Added style
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: { // Added style
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: typography.fontSizes.body,
  },
  errorText: { // Kept for potential future use
    color: colors.error,
    marginTop: 10,
    textAlign: 'center',
    fontSize: typography.fontSizes.small,
  },
});

export default BillingScreen; 