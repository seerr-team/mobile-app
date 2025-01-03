import { withProperties } from '@/utils/typeHelpers';
import { ChevronDown } from '@nandorojo/heroicons/24/solid';
import type { LinkProps } from 'expo-router';
import { Link } from 'expo-router';
import { useState } from 'react';
import type { PressableProps } from 'react-native';
import { Pressable, View } from 'react-native';
import Popover, { PopoverPlacement } from 'react-native-popover-view';

interface DropdownItemProps extends PressableProps {
  buttonType?: 'primary' | 'ghost';
}

const DropdownItem = ({
  children,
  buttonType = 'primary',
  ...props
}: DropdownItemProps) => {
  let styleClass = 'button-md text-white';

  switch (buttonType) {
    case 'ghost':
      styleClass +=
        ' bg-transparent rounded hover:bg-gradient-to-br from-indigo-600 to-purple-600 text-white focus:border-gray-500 focus:text-white';
      break;
    default:
      styleClass +=
        ' bg-indigo-600 rounded hover:bg-indigo-500 focus:border-indigo-700 focus:text-white';
  }
  return (
    <Pressable
      className={`flex cursor-pointer flex-row items-center gap-4 px-4 py-2 text-sm leading-5 focus:outline-none ${styleClass}`}
      {...props}
    >
      {children}
    </Pressable>
  );
};

interface ButtonWithDropdownProps {
  text: React.ReactNode;
  dropdownIcon?: React.ReactNode;
  buttonType?: 'primary' | 'ghost';
}
interface ButtonProps extends PressableProps, ButtonWithDropdownProps {
  children?: React.ReactNode;
  as?: 'button';
}
interface AnchorProps extends LinkProps, ButtonWithDropdownProps {
  as: 'link';
}

const ButtonWithDropdown = ({
  as,
  text,
  children,
  dropdownIcon,
  className,
  buttonType = 'primary',
  ...props
}: ButtonProps | AnchorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const styleClasses = {
    mainButtonClasses: 'button-md text-white border',
    dropdownSideButtonClasses: 'button-md border',
    dropdownClasses: 'button-md',
  };

  switch (buttonType) {
    case 'ghost':
      styleClasses.mainButtonClasses +=
        ' bg-transparent border-gray-600 hover:border-gray-200 focus:border-gray-100 active:border-gray-100';
      styleClasses.dropdownSideButtonClasses = styleClasses.mainButtonClasses;
      styleClasses.dropdownClasses +=
        ' bg-gray-800 border border-gray-700 bg-opacity-80 p-1 backdrop-blur';
      break;
    default:
      styleClasses.mainButtonClasses +=
        ' bg-indigo-600 border-indigo-500 bg-opacity-80 hover:bg-opacity-100 hover:border-indigo-500 active:bg-indigo-700 active:border-indigo-700 focus:ring-blue';
      styleClasses.dropdownSideButtonClasses +=
        ' bg-indigo-600 bg-opacity-80 border-indigo-500 hover:bg-opacity-100 active:bg-opacity-100 focus:ring-blue';
      styleClasses.dropdownClasses += ' bg-indigo-600 p-1';
  }

  return (
    <View className="relative inline-flex flex-row rounded-md shadow-sm">
      {as === 'link' ? (
        <Link {...(props as LinkProps)} asChild>
          <Pressable
            className={`relative z-10 inline-flex flex-row items-center justify-center gap-2 px-4 py-2 text-sm font-medium leading-5 transition duration-150 ease-in-out hover:z-20 focus:z-20 focus:outline-none ${
              styleClasses.mainButtonClasses
            } ${children ? 'rounded-l-md' : 'rounded-md'} ${className}`}
          >
            {text}
          </Pressable>
        </Link>
      ) : (
        <Pressable {...(props as PressableProps)}>
          <View
            className={`relative z-10 inline-flex flex-row items-center gap-2 px-4 py-2 text-sm font-medium leading-5 transition duration-150 ease-in-out hover:z-20 focus:z-20 focus:outline-none ${
              styleClasses.mainButtonClasses
            } ${children ? 'rounded-l-md' : 'rounded-md'} ${className}`}
          >
            {text}
          </View>
        </Pressable>
      )}
      {children && (
        <View className="relative -ml-px block">
          <Popover
            isVisible={isOpen}
            onRequestClose={() => setIsOpen(false)}
            placement={PopoverPlacement.FLOATING}
            popoverShift={{ x: 0, y: 0 }}
            from={
              <Pressable
                onPressIn={() => setIsOpen(true)}
                className={`relative z-20 inline-flex flex-row items-center rounded-r-md px-2 py-2 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:z-20 focus:z-20 ${styleClasses.dropdownSideButtonClasses}`}
              >
                {dropdownIcon ? dropdownIcon : <ChevronDown color="#ffffff" />}
              </Pressable>
            }
            popoverStyle={{
              backgroundColor: 'transparent',
              marginTop: 112,
              marginLeft: 32,
            }}
            arrowSize={{ width: 0, height: 0 }}
            animationConfig={{ duration: 0 }}
          >
            <View className="z-40 w-56 rounded-md shadow-lg">
              <View
                className={`rounded-md ring-1 ring-black ring-opacity-5 ${styleClasses.dropdownClasses}`}
              >
                <View className="py-1">{children}</View>
              </View>
            </View>
          </Popover>
        </View>
      )}
    </View>
  );
};
export default withProperties(ButtonWithDropdown, { Item: DropdownItem });
