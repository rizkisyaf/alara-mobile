module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env.local', // Specify .env.local explicitly
          // Optional: blacklist/whitelist variables
          // blocklist: null,
          // allowlist: ['STRIPE_PUBLISHABLE_KEY'],
          // safe: false, // Don't error if .env file is missing
          // allowUndefined: true, // Allow undefined variables
        },
      ],
      // Add other Babel plugins here if needed
    ],
  };
}; 