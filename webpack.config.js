const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: [
        'react-native-maps',
      ],
    },
  }, argv);

  // Customize the config for web
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'react-native-maps': path.resolve(__dirname, './src/components/maps'),
    // Add any other native modules that cause issues on web
  };

  return config;
}; 