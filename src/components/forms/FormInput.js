import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/layout';

const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  error,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.TEXT_SECONDARY}
        {...props}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.ERROR,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
    backgroundColor: colors.WHITE,
  },
  inputError: {
    borderColor: colors.ERROR,
  },
  errorText: {
    fontSize: 14,
    color: colors.ERROR,
    marginTop: spacing.xs,
  },
});

export default FormInput;