import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { colors } from '../constants/colors';

const FormTextArea = ({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  error,
  numberOfLines = 4,
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
          styles.textArea,
          error && styles.textAreaError,
          { minHeight: numberOfLines * 20 + 24 } // Approximate line height
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.TEXT_SECONDARY}
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
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
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  required: {
    color: colors.ERROR,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
    backgroundColor: colors.WHITE,
  },
  textAreaError: {
    borderColor: colors.ERROR,
  },
  errorText: {
    fontSize: 14,
    color: colors.ERROR,
    marginTop: 4,
  },
});

export default FormTextArea;