import ThemedText from '@/components/Common/ThemedText';
import {
  ExclamationTriangle,
  InformationCircle,
  XCircle,
} from '@nandorojo/heroicons/24/solid';
import { View } from 'react-native';

interface AlertProps {
  title?: React.ReactNode;
  type?: 'warning' | 'info' | 'error';
  children?: React.ReactNode;
}

const Alert = ({ title, children, type }: AlertProps) => {
  let design = {
    bgColor: 'border border-yellow-500 backdrop-blur bg-yellow-400/20',
    titleColor: 'text-yellow-100',
    textColor: 'text-yellow-300',
    svg: <ExclamationTriangle className="h-5 w-5" />,
  };

  switch (type) {
    case 'info':
      design = {
        bgColor: 'border border-indigo-500 backdrop-blur bg-indigo-400/20',
        titleColor: 'text-gray-100',
        textColor: 'text-gray-300',
        svg: <InformationCircle color="#ffffff" width={20} height={20} />,
      };
      break;
    case 'error':
      design = {
        bgColor: 'bg-red-600',
        titleColor: 'text-red-100',
        textColor: 'text-red-300',
        svg: <XCircle color="#ffffff" width={20} height={20} />,
      };
      break;
  }

  return (
    <View className={`mb-4 w-full rounded-md p-4 ${design.bgColor}`}>
      <View className="flex flex-row">
        <View className={`flex-shrink-0 ${design.titleColor}`}>
          {design.svg}
        </View>
        <View className="ml-3">
          {title && (
            <ThemedText className={`font-medium ${design.titleColor}`}>
              {title}
            </ThemedText>
          )}
          {children && (
            <View className={`mt-2 first:mt-0 ${design.textColor}`}>
              {children}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default Alert;
