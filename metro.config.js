const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

let config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});
config = withNativeWind(config, {
  input: './seerr/src/styles/globals.css',
});

// Package exports must stay enabled: since SDK 58, react-native/setup-env,
// expo/dom/global and others only resolve through them. swr is resolved
// without them, otherwise `swr` gets the ESM build while `swr/infinite` goes
// through its CJS package.json shim, bundling two copies of swr whose
// SWRConfig contexts differ (useSWRInfinite would lose the global fetcher).
const resolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const ctx = /^swr(\/|$)/.test(moduleName)
    ? { ...context, unstable_enablePackageExports: false }
    : context;
  return (resolveRequest ?? ctx.resolveRequest)(ctx, moduleName, platform);
};

module.exports = config;
