import { API_BASE_URL } from '../config/api';

/**
 * Sends a message to the backend chat endpoint and gets the LLM response.
 * @param {string} token - The JWT authentication token.
 * @param {string} messageText - The user's message text.
 * @returns {Promise<object>} - The response object from the backend, expected to contain the AI's reply.
 *                               Example: { reply: "AI response text" }
 * @throws {Error} - Throws an error if the request fails.
 */
export const sendMessage = async (token, messageText) => {
  const url = `${API_BASE_URL}/api/chat`; // TODO: Confirm backend endpoint path
  console.log(`Sending message to: ${url}`);

  if (!token) {
    throw new Error('Authentication token is required for chat.');
  }
  if (!messageText || messageText.trim().length === 0) {
      throw new Error('Cannot send an empty message.');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ message: messageText }), // Send message in expected format
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.detail || `HTTP error! status: ${response.status}`;
      console.error('Send Message API error:', errorMessage, 'Status:', response.status);
      // Handle specific errors if needed (e.g., rate limiting)
      throw new Error(errorMessage);
    }

    // Assuming the backend returns { reply: "..." }
    if (!data.reply) {
        console.error('API response missing reply:', data);
        throw new Error('Received an invalid response from the AI.');
    }

    console.log('Received reply from backend.');
    return data; // { reply: "..." }

  } catch (error) {
    console.error('Send message request failed:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}; 