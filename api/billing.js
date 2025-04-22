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