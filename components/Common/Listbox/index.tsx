/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactElement, ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

type ListboxContextType<T> = {
  value: T;
  onChange: (val: T) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const ListboxContext = createContext<ListboxContextType<any> | null>(null);

function useListboxContext<T>() {
  const ctx = useContext(ListboxContext);
  if (!ctx) {
    throw new Error('Listbox subcomponents must be used within <Listbox>');
  }
  return ctx as ListboxContextType<T>;
}

type ListboxProps<T> = {
  value: T;
  onChange: (val: T) => void;
  children: (props: { open: boolean }) => ReactNode;
};

export function Listbox<T>({
  value,
  onChange,
  children,
}: ListboxProps<T>): ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <ListboxContext.Provider value={{ value, onChange, open, setOpen }}>
      {children({ open })}
    </ListboxContext.Provider>
  );
}

type ButtonProps = {
  children: ReactNode;
  className?: string;
  style?: any;
};
Listbox.Button = function ListboxButton({
  children,
  className,
  style,
}: ButtonProps) {
  const { setOpen } = useListboxContext<any>();

  return (
    <Pressable
      onPress={() => setOpen(true)}
      className={className}
      style={style}
    >
      {children}
    </Pressable>
  );
};

type OptionsProps = {
  children: ReactNode;
  static?: boolean;
};
Listbox.Options = function ListboxOptions({ children }: OptionsProps) {
  const { open, setOpen } = useListboxContext<any>();

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <View className="flex flex-1">
        <Pressable
          className="absolute inset-0 z-40 bg-gray-800/70"
          android_disableSound
          onPress={() => setOpen(false)}
        />
      </View>
      <View className="absolute inset-12 z-50 flex flex-row items-center justify-center">
        <ScrollView
          className="shadow-xs overflow-auto rounded-md border border-gray-700 bg-gray-800 py-1 shadow-lg"
          contentContainerClassName="flex flex-col justify-center items-stretch"
        >
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
};

type OptionProps<T> = {
  value: T;
  children: (props: { selected: boolean; active: boolean }) => ReactNode;
};
Listbox.Option = function ListboxOption<T>({
  value,
  children,
}: OptionProps<T>) {
  const { value: selectedValue, onChange, setOpen } = useListboxContext<T>();

  const selected = selectedValue === value;
  const active = false; // could track active state if desired

  const handlePress = useCallback(() => {
    onChange(value);
    setOpen(false);
  }, [onChange, value, setOpen]);

  return (
    <Pressable onPress={handlePress}>
      {children({ selected, active })}
    </Pressable>
  );
};
