import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type DisclosureContextType = {
  isOpen: boolean;
  toggle: () => void;
};

const DisclosureContext = createContext<DisclosureContextType | null>(null);

export function Disclosure({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode | ((state: { open: boolean }) => React.ReactNode);
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <DisclosureContext.Provider value={{ isOpen, toggle }}>
      {typeof children === 'function' ? children({ open: isOpen }) : children}
    </DisclosureContext.Provider>
  );
}

export function DisclosureButton({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}) {
  const ctx = useContext(DisclosureContext);
  if (!ctx) throw new Error('DisclosureButton must be inside Disclosure');

  return (
    <Pressable
      onPress={ctx.toggle}
      style={[styles.button, style]}
      className={className}
    >
      {children}
    </Pressable>
  );
}

export function DisclosurePanel({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}) {
  const ctx = useContext(DisclosureContext);
  if (!ctx) throw new Error('DisclosurePanel must be inside Disclosure');

  if (!ctx.isOpen) return null;

  return (
    <View style={[style]} className={className}>
      <View style={styles.panelWrapper}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    // padding: 12,
    // backgroundColor: "#2d2d2d",
    // borderRadius: 8,
    // flexDirection: "row",
    // alignItems: "center",
    // justifyContent: "space-between",
  },
  panelWrapper: {
    // You can adjust styles as needed
  },
});
