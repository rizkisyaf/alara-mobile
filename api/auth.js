import { API_BASE_URL } from '../config/api';

/**
 * Logs in a user using email (as username) and password.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - The JSON response from the API (e.g., { access_token: string, token_type: string }).
 * @throws {Error} - Throws an error if the login fails or the network request fails.
 */
export const loginUser = async (email, password) => {
  const loginUrl = `${API_BASE_URL}/api/auth/login`;
  console.log(`Attempting login to: ${loginUrl}`);

  // FastAPI's OAuth2PasswordRequestForm expects form data
  const formData = new URLSearchParams();
  formData.append('username', email); // Use email as the username
  formData.append('password', password);

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      // Throw an error with the message from the API if available
      const errorMessage = data.detail || `HTTP error! status: ${response.status}`;
      console.error('Login API error:', errorMessage, 'Status:', response.status);
      throw new Error(errorMessage);
    }

    console.log('Login successful, token received.');
    return data; // Should contain access_token and token_type
  } catch (error) {
    console.error('Login request failed:', error);
    // Re-throw the error to be caught by the calling component
    throw error; 
  }
};

/**
 * Registers a new user.
 * @param {string} name - The user's full name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's chosen password (min 8 chars).
 * @returns {Promise<object>} - The JSON response from the API (e.g., { message: string }).
 * @throws {Error} - Throws an error if registration fails or the network request fails.
 */
export const registerUser = async (name, email, password) => {
  const registerUrl = `${API_BASE_URL}/api/auth/register`;
  console.log(`Attempting registration to: ${registerUrl}`);

  const userData = {
    name,
    email,
    password,
  };

  try {
    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Explicitly accept JSON
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.detail || `HTTP error! status: ${response.status}`;
      console.error('Registration API error:', errorMessage, 'Status:', response.status);
      // Specific check for email already registered error
      if (response.status === 400 && errorMessage.toLowerCase().includes('email address is already registered')) {
        throw new Error('This email address is already registered. Please login.');
      } else {
        throw new Error(errorMessage);
      }
    }

    console.log('Registration successful:', data.message);
    return data; // Should contain success message

  } catch (error) {
    console.error('Registration request failed:', error);
    // Re-throw the error to be caught by the calling component
    // Make sure it's an actual Error object
    throw error instanceof Error ? error : new Error(String(error));
  }
};

// TODO: Implement registerUser function after checking backend requirements 