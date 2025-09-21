import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors } from '../../constants/colors';

const FormOptionButtons = ({
  label,
  options = [],
  value,
  onValueChange,
  required = false,
  error,
  scrollable = true,
}) => {
  const renderOptions = () => {
    const optionButtons = options.map((option) => (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.optionButton,
          value === option.value && styles.optionButtonActive
        ]}
        onPress={() => onValueChange(option.value)}
      >
        <Text style={[
          styles.optionText,
          value === option.value && styles.optionTextActive
        ]}>
          {option.label}
        </Text>
      </TouchableOpacity>
    ));

    if (scrollable) {
      return (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.optionsScroll}
        >
          {optionButtons}
        </ScrollView>
      );
    }

    return (
      <View style={styles.optionsContainer}>
        {optionButtons}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}>*</Text>}
      </Text>
      {renderOptions()}
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
  optionsScroll: {
    flexDirection: 'row',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: colors.LIGHT_GRAY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  optionButtonActive: {
    backgroundColor: colors.BRG,
  },
  optionText: {
    fontSize: 14,
    color: colors.GRAY,
    fontWeight: '500',
    textAlign: 'center',
  },
  optionTextActive: {
    color: colors.WHITE,
  },
  errorText: {
    fontSize: 14,
    color: colors.ERROR,
    marginTop: 4,
  },
});

export default FormOptionButtons;