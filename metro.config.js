const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

let config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});
config = getSentryExpoConfig(__dirname, config);
config = withNativeWind(config, {
  input: './jellyseerr/src/styles/globals.css',
});
// config.resolver.resolverMainFields = ['react-native', 'browser', 'module', 'main'];
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
