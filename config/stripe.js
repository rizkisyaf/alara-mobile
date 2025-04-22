// TODO: Use environment variables for Stripe keys in production builds
import { STRIPE_PUBLISHABLE_KEY as ENV_STRIPE_KEY } from '@env'; // Import from @env

// Your Stripe Publishable Key (Loaded from .env.local via react-native-dotenv)
export const STRIPE_PUBLISHABLE_KEY = ENV_STRIPE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn(
    'Stripe Publishable Key is missing. Make sure it is set in your .env.local file '
    + 'and you have restarted the Metro bundler.'
  );
}

// Add other Stripe-related config if needed 