// WARNING: Hardcoding keys is insecure. Use environment variables for production.
const hardcodedPublishableKey = 'pk_test_51N9hXsAUFhzONqTblR3yUfFqL4M2O5qP9j5tV3sN7qR8zL3eK9uA0dJ6gH9sO7rC2tX1zI9fJ0gX3mN00aBcDefGh'; // Replace if this is not your key

if (!hardcodedPublishableKey) {
  console.error('Error: Hardcoded Stripe publishable key is missing or empty in config/stripe.js');
}

export default {
  publishableKey: hardcodedPublishableKey,
  // merchantIdentifier: 'merchant.identifier', // Optional: for Apple Pay
}; 