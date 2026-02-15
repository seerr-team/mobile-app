import { ActivityIndicator } from 'react-native';

// This component is used as a compatibility layer for the Seerr web app loading spinner.
const LoadingSpinner = ({ size = 32 }: { size?: number }) => {
  if (size == 12) {
    return (
      <ActivityIndicator
        size="small"
        color="#ffffff"
        style={{ height: 12, width: 12, transform: [{ scale: 0.7 }] }}
      />
    );
  } else if (size < 24) {
    return <ActivityIndicator size="small" color="#ffffff" />;
  } else {
    return <ActivityIndicator size="large" color="#ffffff" />;
  }
};

export default LoadingSpinner;
