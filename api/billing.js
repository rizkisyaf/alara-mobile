import { API_BASE_URL } from '../config/api';

/**
 * Calls the backend to create a subscription intent.
 * @param {string} token - The JWT authentication token.
 * @param {string} planId - The identifier of the chosen plan ('monthly' or 'yearly').
 * @returns {Promise<object>} - The response containing subscription_id and client_secret.
 * @throws {Error} - Throws an error if the request fails.
 */
export const createSubscriptionIntent = async (token, planId) => {
  const url = `${API_BASE_URL}/api/billing/create-subscription`;
  console.log(`Creating subscription intent for plan: ${planId} at ${url}`);

  if (!token) {
    throw new Error('Authentication token is required.');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ plan_id: planId }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.detail || `HTTP error! status: ${response.status}`;
      console.error('Create Subscription Intent API error:', errorMessage, 'Status:', response.status);
      throw new Error(errorMessage);
    }

    if (!data.client_secret || !data.subscription_id) {
        console.error('API response missing client_secret or subscription_id:', data);
        throw new Error('Failed to initialize payment. Invalid response from server.');
    }

    console.log('Subscription intent created successfully.');
    return data; // { subscription_id: string, client_secret: string }

  } catch (error) {
    console.error('Create subscription intent request failed:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Calls the backend to create a Stripe Customer Portal session.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<{url: string}>} - Object containing the URL for the portal session.
 * @throws {Error} - Throws an error if the request fails.
 */
export const createBillingPortalSession = async (token) => {
  const url = `${API_BASE_URL}/api/billing/create-portal-session`;
  console.log(`Creating billing portal session at: ${url}`);

  if (!token) throw new Error('Authentication token is required.');

  try {
    const response = await fetch(url, {
      method: 'POST', // Use POST as defined in the backend router
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
         // No 'Content-Type' needed for POST without body
      },
      // No body needed for this request
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.detail || `HTTP error! status: ${response.status}`;
      console.error('Create Billing Portal Session API error:', errorMessage, 'Status:', response.status);
      throw new Error(errorMessage);
    }

    if (!data.url) {
        console.error('API response missing portal URL:', data);
        throw new Error('Failed to retrieve billing portal URL.');
    }

    console.log('Billing portal session created successfully.');
    return data; // { url: "..." }

  } catch (error) {
    console.error('Create billing portal session request failed:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}; 