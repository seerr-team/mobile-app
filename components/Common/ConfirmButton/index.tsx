import Button from '@/components/Common/Button';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, View } from 'react-native';

interface ConfirmButtonProps {
  onClick: () => void;
  confirmText: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export default function ConfirmButton({
  onClick,
  children,
  confirmText,
  className,
}: ConfirmButtonProps) {
  const [isClicked, setIsClicked] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const confirmTranslateY = useRef(new Animated.Value(40)).current;
  const confirmOpacity = useRef(new Animated.Value(0)).current;
  const buttonRef = useRef<View>(null);
  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const toValue = isClicked ? 1 : 0;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: isClicked ? -40 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isClicked ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(confirmTranslateY, {
        toValue: isClicked ? 0 : 40,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(confirmOpacity, {
        toValue: toValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isClicked]);

  const handlePress = () => {
    if (!isClicked) {
      buttonRef.current?.measureInWindow((x, y, width, height) => {
        setButtonLayout({ x, y, width, height });
      });
      setIsClicked(true);
    } else {
      setIsClicked(false);
      onClick();
    }
  };

  return (
    <>
      <View ref={buttonRef} className={`relative overflow-hidden ${className}`}>
        <Button
          buttonType="danger"
          className="relative overflow-hidden"
          onClick={handlePress}
        >
          <Animated.View
            className="flex w-full items-center justify-center"
            style={{ transform: [{ translateY }], opacity }}
          >
            {children}
          </Animated.View>
          <Animated.View
            className="absolute inset-0 flex w-full items-center justify-center"
            style={{
              transform: [{ translateY: confirmTranslateY }],
              opacity: confirmOpacity,
            }}
          >
            {confirmText}
          </Animated.View>
        </Button>
      </View>

      <Modal
        visible={isClicked}
        transparent
        animationType="none"
        onRequestClose={() => setIsClicked(false)}
      >
        <Pressable className="flex-1" onPress={() => setIsClicked(false)}>
          <View
            style={{
              position: 'absolute',
              left: buttonLayout.x,
              top: buttonLayout.y,
              width: buttonLayout.width,
              height: buttonLayout.height,
            }}
            pointerEvents="box-none"
          >
            <Button
              buttonType="danger"
              className="relative overflow-hidden"
              onClick={handlePress}
            >
              <Animated.View
                className="flex w-full items-center justify-center"
                style={{ transform: [{ translateY }], opacity }}
              >
                {children}
              </Animated.View>
              <Animated.View
                className="absolute inset-0 flex w-full items-center justify-center"
                style={{
                  transform: [{ translateY: confirmTranslateY }],
                  opacity: confirmOpacity,
                }}
              >
                {confirmText}
              </Animated.View>
            </Button>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
