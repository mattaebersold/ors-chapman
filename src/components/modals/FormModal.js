import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import BaseModal from './BaseModal';
import Button from '../ui/Button';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/layout';

/**
 * FormModal - A specialized modal for forms that extends BaseModal
 * Provides consistent form layout, validation, and submission patterns
 */
const FormModal = ({
  visible,
  onClose,
  onSubmit,
  title,
  subtitle,
  children,
  submitButtonText = 'Submit',
  submitButtonVariant = 'primary',
  cancelButtonText = 'Cancel',
  showCancelButton = true,
  submitDisabled = false,
  loading = false,
  validationError,
  ...baseModalProps
}) => {
  const handleSubmit = async () => {
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    if (onSubmit) {
      try {
        await onSubmit();
      } catch (error) {
        Alert.alert('Error', error.message || 'An error occurred');
      }
    }
  };

  const renderFooter = () => (
    <View style={styles.footer}>
      {validationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{validationError}</Text>
        </View>
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
          title={submitButtonText}
          onPress={handleSubmit}
          variant={submitButtonVariant}
          style={[styles.button, styles.submitButton]}
          disabled={submitDisabled || loading}
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
      subtitle={subtitle}
      contentStyle={styles.content}
      {...baseModalProps}
    >
      <View style={styles.formContainer}>
        {children}
      </View>
      {renderFooter()}
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 0, // Remove default padding to control it precisely
  },
  formContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
    backgroundColor: colors.WHITE,
  },
  errorContainer: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.ERROR_LIGHT + '20', // 20% opacity
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.ERROR,
  },
  errorText: {
    color: colors.ERROR,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    marginRight: spacing.sm,
  },
  submitButton: {
    marginLeft: spacing.sm,
  },
});

export default FormModal;