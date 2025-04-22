import { API_BASE_URL } from '../config/api';

/**
 * Fetches the list of connected exchange keys for the user.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - An array of exchange connection objects.
 * @throws {Error} - Throws an error if the request fails.
 */
export const listExchangeKeys = async (token) => {
  const url = `${API_BASE_URL}/api/exchange-keys`;
  console.log(`Fetching exchange keys from: ${url}`);

  if (!token) throw new Error('Authentication token is required.');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data.detail || `HTTP error! status: ${response.status}`;
      console.error('List Exchange Keys API error:', errorMessage, 'Status:', response.status);
      throw new Error(errorMessage);
    }
    console.log('Exchange keys fetched successfully.');
    return data; // Expecting an array of key objects
  } catch (error) {
    console.error('List exchange keys request failed:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Deletes a specific exchange key connection.
 * @param {string} token - The JWT authentication token.
 * @param {string} connectionId - The ID of the connection to delete.
 * @returns {Promise<object>} - The success message from the API.
 * @throws {Error} - Throws an error if the request fails.
 */
export const deleteExchangeKey = async (token, connectionId) => {
  const url = `${API_BASE_URL}/api/exchange-keys/${connectionId}`;
  console.log(`Deleting exchange key: ${connectionId} at ${url}`);

  if (!token) throw new Error('Authentication token is required.');
  if (!connectionId) throw new Error('Connection ID is required to delete.');

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    const data = await response.json(); // Might just be a status or simple message
    if (!response.ok) {
      const errorMessage = data.detail || `HTTP error! status: ${response.status}`;
      console.error('Delete Exchange Key API error:', errorMessage, 'Status:', response.status);
      throw new Error(errorMessage);
    }
    console.log(`Exchange key ${connectionId} deleted successfully.`);
    return data; // Expecting { message: "..." } or similar
  } catch (error) {
    console.error('Delete exchange key request failed:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Adds a new exchange key connection.
 * @param {string} token - The JWT authentication token.
 * @param {string} exchangeId - The ID of the exchange (e.g., 'binance', 'kucoin'). Used in the URL.
 * @param {object} credentials - Object containing { api_key, api_secret, passphrase?, nickname? }.
 * @returns {Promise<object>} - The connection info object from the API.
 * @throws {Error} - Throws an error if the request fails.
 */
export const addExchangeKey = async (token, exchangeId, credentials) => {
  if (!token) throw new Error('Authentication token is required.');
  if (!exchangeId) throw new Error('Exchange ID is required.');
  if (!credentials || !credentials.api_key || !credentials.api_secret) {
      throw new Error('API Key and Secret are required.');
  }

  // Ensure exchangeId is lowercase for consistency if backend expects it
  const formattedExchangeId = exchangeId.toLowerCase().trim();
  const url = `${API_BASE_URL}/api/exchange-keys/${formattedExchangeId}`;
  console.log(`Adding exchange key for ${formattedExchangeId} at ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      // Send only the expected fields for ExchangeCredentials
      body: JSON.stringify({
          api_key: credentials.api_key,
          api_secret: credentials.api_secret,
          passphrase: credentials.passphrase || null, // Send null if empty/undefined
          nickname: credentials.nickname || null,   // Send null if empty/undefined
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.detail || `HTTP error! status: ${response.status}`;
      console.error('Add Exchange Key API error:', errorMessage, 'Status:', response.status);
      // Provide more specific feedback for common errors if possible
      if (response.status === 401) {
          throw new Error(`Authentication failed for ${formattedExchangeId}. Check your API key/secret/passphrase.`);
      }
      throw new Error(errorMessage);
    }
    
    console.log(`Exchange key for ${formattedExchangeId} added successfully.`);
    return data; // Expecting ExchangeConnectionInfo object

  } catch (error) {
    console.error('Add exchange key request failed:', error);
    // Rethrow specific error messages if caught
    throw error instanceof Error ? error : new Error(String(error));
  }
};

// TODO: Add function for adding an exchange key (POST /api/exchange-keys) 