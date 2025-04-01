import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';

export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

export function initSentry() {
  Sentry.init({
    dsn: 'https://1e6465a455824f20ad7687530dbf7827@sentry.jellyseerr.dev/1',
    debug: __DEV__,
    tracesSampleRate: 1.0,
    integrations: [navigationIntegration],
    enableNativeFramesTracking: !isRunningInExpoGo(),
  });
}

export function disableSentry() {
  Sentry.init({
    dsn: '',
    debug: __DEV__,
    tracesSampleRate: 0,
    integrations: [navigationIntegration],
  });
}
