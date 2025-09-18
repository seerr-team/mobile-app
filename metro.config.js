const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

let config = getSentryExpoConfig(__dirname, getDefaultConfig(__dirname));
config = withNativeWind(config, {
  input: './jellyseerr/src/styles/globals.css',
});
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
