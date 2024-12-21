import AntDesign from '@expo/vector-icons/AntDesign';
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import ThemedText from '../ThemedText';

const LoadingSpinner = () => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );
    spinAnimation.start();
    return () => spinAnimation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ThemedText className="text-center text-3xl">
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <AntDesign name="loading1" size={32} color="white" />
      </Animated.View>
    </ThemedText>
  );
};

export default LoadingSpinner;
