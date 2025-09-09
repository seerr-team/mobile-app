import type { ButtonType } from '@/components/Common/Button';
import Button from '@/components/Common/Button';
import CachedImage from '@/components/Common/CachedImage';
// import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ThemedText from '@/components/Common/ThemedText';
import globalMessages from '@/utils/globalMessages';
import { LinearGradient } from 'expo-linear-gradient';
import type { MouseEvent } from 'react';
import React from 'react';
import { useIntl } from 'react-intl';
import { Pressable, Modal as RNModal, ScrollView, View } from 'react-native';

interface ModalProps {
  show: boolean;
  title?: string;
  subTitle?: string;
  onCancel?: (e?: MouseEvent<HTMLElement>) => void;
  onOk?: (e?: MouseEvent<HTMLButtonElement>) => void;
  onSecondary?: (e?: MouseEvent<HTMLButtonElement>) => void;
  onTertiary?: (e?: MouseEvent<HTMLButtonElement>) => void;
  cancelText?: string;
  okText?: string;
  secondaryText?: string;
  tertiaryText?: string;
  okDisabled?: boolean;
  cancelButtonType?: ButtonType;
  okButtonType?: ButtonType;
  secondaryButtonType?: ButtonType;
  secondaryDisabled?: boolean;
  tertiaryDisabled?: boolean;
  tertiaryButtonType?: ButtonType;
  disableScrollLock?: boolean;
  backgroundClickable?: boolean;
  loading?: boolean;
  backdrop?: string;
  children?: React.ReactNode;
}

const Modal = ({
  show,
  title,
  subTitle,
  onCancel,
  onOk,
  cancelText,
  okText,
  okDisabled = false,
  cancelButtonType = 'ghost',
  okButtonType = 'primary',
  children,
  disableScrollLock,
  backgroundClickable = true,
  secondaryButtonType = 'ghost',
  secondaryDisabled = false,
  onSecondary,
  secondaryText,
  tertiaryButtonType = 'ghost',
  tertiaryDisabled = false,
  tertiaryText,
  loading = false,
  onTertiary,
  backdrop,
}: ModalProps) => {
  const intl = useIntl();

  return (
    <View className="relative">
      <RNModal
        visible={show}
        transparent
        animationType="fade"
        onRequestClose={() => onCancel && onCancel()}
      >
        <View
          className="absolute inset-0 flex h-screen w-screen items-center justify-center"
          style={{ zIndex: 999 }}
        >
          <ScrollView
            className="w-full"
            contentContainerClassName="flex justify-center pb-12 flex-grow"
          >
            <Pressable
              android_disableSound
              className="absolute inset-0 h-screen w-screen bg-gray-800/70"
              onPress={() => backgroundClickable && onCancel && onCancel()}
            />
            <View className="hide-scrollbar relative inline-block w-full scale-100 overflow-auto border border-gray-700 bg-gray-800 pb-4 pt-4 text-left opacity-100 transition-all sm:my-8 sm:max-w-3xl sm:rounded-lg">
              {backdrop && (
                <View className="absolute left-0 right-0 top-0 z-0 h-64 max-h-full w-full">
                  <CachedImage
                    type="tmdb"
                    alt=""
                    src={backdrop}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <LinearGradient
                    colors={['rgba(31, 41, 55, 0.75)', 'rgba(31, 41, 55, 1)']}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      height: '100%',
                    }}
                  />
                </View>
              )}
              <View className="relative -mx-4 overflow-x-hidden px-4 pt-0.5 sm:flex sm:flex-row sm:items-center">
                <View className={`mt-3 truncate sm:mt-0 sm:text-left`}>
                  {(title || subTitle) && (
                    <View className="flex flex-col space-y-1">
                      {title && (
                        <ThemedText className="truncate pb-0.5 text-center text-3xl font-bold text-indigo-400">
                          {title}
                        </ThemedText>
                      )}
                      {subTitle && (
                        <ThemedText className="truncate text-center text-lg font-semibold leading-6 text-gray-200">
                          {subTitle}
                        </ThemedText>
                      )}
                    </View>
                  )}
                </View>
              </View>
              {children && (
                <View
                  className={`relative mx-4 mt-4 text-sm leading-5 ${
                    !(onCancel || onOk || onSecondary || onTertiary)
                      ? 'mb-3'
                      : ''
                  }`}
                >
                  {children}
                </View>
              )}
              {(onCancel || onOk || onSecondary || onTertiary) && (
                <View className="relative mx-4 mt-5 flex flex-row-reverse justify-center sm:mt-4 sm:justify-start">
                  {typeof onOk === 'function' && (
                    <Button
                      buttonType={okButtonType}
                      onClick={onOk}
                      className="ml-3"
                      disabled={okDisabled}
                      data-testid="modal-ok-button"
                    >
                      {okText ? okText : 'Ok'}
                    </Button>
                  )}
                  {typeof onSecondary === 'function' && secondaryText && (
                    <Button
                      buttonType={secondaryButtonType}
                      onClick={onSecondary}
                      className="ml-3"
                      disabled={secondaryDisabled}
                      data-testid="modal-secondary-button"
                    >
                      {secondaryText}
                    </Button>
                  )}
                  {typeof onTertiary === 'function' && tertiaryText && (
                    <Button
                      buttonType={tertiaryButtonType}
                      onClick={onTertiary}
                      className="ml-3"
                      disabled={tertiaryDisabled}
                    >
                      {tertiaryText}
                    </Button>
                  )}
                  {typeof onCancel === 'function' && (
                    <Button
                      buttonType={cancelButtonType}
                      onClick={onCancel}
                      className="ml-3 sm:ml-0"
                      data-testid="modal-cancel-button"
                    >
                      {cancelText
                        ? cancelText
                        : intl.formatMessage(globalMessages.cancel)}
                    </Button>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </RNModal>
    </View>
  );
};

export default Modal;
