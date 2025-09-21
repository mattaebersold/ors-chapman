import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import BaseModal from './BaseModal';
import Button from '../ui/Button';
import FAIcon from '../ui/FAIcon';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/layout';

/**
 * ConfirmationModal - A specialized modal for confirmations and alerts
 * Provides consistent confirmation patterns with customizable actions
 */
const ConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmButtonText = 'Confirm',
  confirmButtonVariant = 'primary',
  cancelButtonText = 'Cancel',
  showCancelButton = true,
  icon,
  iconColor = colors.INFO,
  danger = false,
  loading = false,
  ...baseModalProps
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      try {
        await onConfirm();
        onClose();
      } catch (error) {
        // Error handling should be done by the caller
        console.error('Confirmation error:', error);
      }
    }
  };

  // Auto-configure for danger mode
  const finalConfirmVariant = danger ? 'danger' : confirmButtonVariant;
  const finalIcon = icon || (danger ? 'exclamation-triangle' : 'question-circle');
  const finalIconColor = danger ? colors.ERROR : iconColor;

  const renderContent = () => (
    <View style={styles.content}>
      {finalIcon && (
        <View style={styles.iconContainer}>
          <FAIcon
            name={finalIcon}
            size={48}
            color={finalIconColor}
          />
        </View>
      )}

      {message && (
        <Text style={styles.message}>{message}</Text>
      )}

      <View style={styles.buttonContainer}>
        {showCancelButton && (
          <Button
            title={cancelButtonText}
            onPress={onClose}
            variant="outline"
            style={[styles.button, styles.cancelButton]}
            disabled={loading}
          />
        )}

        <Button
          title={confirmButtonText}
          onPress={handleConfirm}
          variant={finalConfirmVariant}
          style={[styles.button, styles.confirmButton]}
          loading={loading}
        />
      </View>
    </View>
  );

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={title}
      presentationStyle="formSheet"
      scrollable={false}
      contentStyle={styles.modalContent}
      {...baseModalProps}
    >
      {renderContent()}
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 50,
    backgroundColor: colors.LIGHT_GRAY,
  },
  message: {
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    marginRight: spacing.sm,
  },
  confirmButton: {
    marginLeft: spacing.sm,
  },
});

export default ConfirmationModal;