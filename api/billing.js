import { API_BASE_URL } from '../config/api';

/**
 * Calls the backend to verify a Google Play purchase.
 * @param {string} token - The JWT authentication token.
 * @param {string} purchaseToken - The purchase token received from Google Play.
 * @param {string} productId - The Google Play product ID (SKU).
 * @returns {Promise<object>} - The backend response containing verification status.
 * @throws {Error} - Throws an error if the request fails.
 */
export const verifyGooglePurchase = async (token, purchaseToken, productId) => {
  const url = `${API_BASE_URL}/api/billing/verify-google-purchase`;
  console.log(`Verifying Google Play purchase: token=${purchaseToken?.substring(0, 10)}..., sku=${productId} at ${url}`);

  if (!token) {
    throw new Error('Authentication token is required.');
  }
  if (!purchaseToken) {
    throw new Error('Google Play purchase token is required.');
  }
   if (!productId) {
    throw new Error('Google Play product ID (SKU) is required.');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        purchase_token: purchaseToken, 
        product_id: productId 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.detail || `HTTP error! status: ${response.status}`;
      console.error('Verify Google Purchase API error:', errorMessage, 'Status:', response.status, 'Data:', data);
      throw new Error(errorMessage);
    }

    console.log('Google Play purchase verification backend call successful:', data);
    return data; // Should contain { status: 'active' | 'pending' | 'expired' | 'canceled' | 'error' }

  } catch (error) {
    console.error('Verify Google Play purchase request failed:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}; 