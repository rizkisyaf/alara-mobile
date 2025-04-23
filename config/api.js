import Constants from 'expo-constants';

// Check if in development mode (Expo Go or development build)
const isDevelopment = __DEV__;

// TODO: Potentially use release channels or environment variables for staging/prod
const LOCAL_API_URL = 'https://alara-mcp.skolp.com'; // Your local MCP address
const PRODUCTION_API_URL = 'https://alara-mcp.skolp.com'; // Your production MCP address

export const API_BASE_URL = isDevelopment ? LOCAL_API_URL : PRODUCTION_API_URL;

console.log(`API Base URL set to: ${API_BASE_URL}`); 