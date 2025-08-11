import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from './FAIcon';

const ErrorMessage = ({ 
  message = 'Something went wrong',
  onRetry,
  retryText = 'Try Again',
  icon = 'exclamation',
  style,
  textStyle,
  fullScreen = false,
  showIcon = true
}) => {
  const containerStyle = [
    fullScreen ? styles.fullScreenContainer : styles.container,
    style
  ];

  return (
    <View style={containerStyle}>
      {showIcon && (
        <FAIcon name={icon} size={fullScreen ? 48 : 24} color={colors.ERROR} />
      )}
      <Text style={[
        styles.text,
        fullScreen && styles.textLarge,
        textStyle
      ]}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.BACKGROUND,
    paddingHorizontal: 20,
    gap: 16,
  },
  text: {
    fontSize: 14,
    color: colors.ERROR,
    textAlign: 'center',
    lineHeight: 20,
  },
  textLarge: {
    fontSize: 16,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  retryText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ErrorMessage;