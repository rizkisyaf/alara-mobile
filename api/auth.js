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
        'Accept': 'application/json', // Indicate we prefer JSON responses
      },
      body: formData.toString(),
    });

    // Check if the request was successful FIRST
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      // Try to parse error detail if response seems like JSON, otherwise use status
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (parseError) {
        // If parsing fails, stick with the HTTP status error message
        console.warn('Could not parse error response body as JSON.');
      }
      console.error('Login API error:', errorMessage, 'Status:', response.status);
      throw new Error(errorMessage); // Throw error with API message or status
    }

    // If response.ok is true, *then* parse the JSON body
    const data = await response.json();
    console.log('Login successful, token received.');
    return data; // Should contain access_token and token_type

  } catch (error) {
    console.error('Login request failed:', error);
    // Check if it's the error we threw above or a network/fetch error
    if (error instanceof Error) {
        // Re-throw the specific error (could be the one from !response.ok or a network error)
        throw error;
    } else {
        // Handle unexpected error types
        throw new Error('An unexpected error occurred during login.');
    }
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

/**
 * Fetches the status (verification, subscription) of the currently authenticated user.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - The user status object from the API (matching UserStatusResponse).
 * @throws {Error} - Throws an error if the request fails or returns an error status.
 */
export const fetchUserStatus = async (token) => {
  const statusUrl = `${API_BASE_URL}/api/users/me/status`;
  console.log(`Fetching user status from: ${statusUrl}`);

  if (!token) {
    throw new Error('Authentication token is required to fetch user status.');
  }

  try {
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.detail || `HTTP error! status: ${response.status}`;
      console.error('Fetch User Status API error:', errorMessage, 'Status:', response.status);
      // If unauthorized, maybe the token expired
      if (response.status === 401 || response.status === 403) {
        throw new Error('Unauthorized: Invalid or expired token.');
      }
      throw new Error(errorMessage);
    }

    console.log('User status fetched successfully:', data);
    return data; // Should contain user status details

  } catch (error) {
    console.error('Fetch user status request failed:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Calls the backend to request a password reset email.
 * @param {string} email - The user's email address.
 * @returns {Promise<object>} - The success message from the API.
 * @throws {Error} - Throws an error if the request fails.
 */
export const requestPasswordReset = async (email) => {
    const url = `${API_BASE_URL}/api/auth/forgot-password`;
    console.log(`Requesting password reset for: ${email} at ${url}`);

    if (!email) throw new Error('Email address is required.');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email: email }),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.detail || `HTTP error! status: ${response.status}`;
            console.error('Request Password Reset API error:', errorMessage, 'Status:', response.status);
            // Handle specific errors? e.g., user not found (backend might not reveal this)
            throw new Error(errorMessage);
        }

        console.log('Request password reset success.');
        return data; // Expecting { status: 'success', message: '...' }

    } catch (error) {
        console.error('Request password reset failed:', error);
        throw error instanceof Error ? error : new Error(String(error));
    }
};

// TODO: Implement registerUser function after checking backend requirements 