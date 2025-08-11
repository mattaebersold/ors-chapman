import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from './FAIcon';

const LoadingIndicator = ({ 
  size = 'small', 
  text = 'Loading...', 
  color = colors.BRG,
  variant = 'activity', // 'activity' or 'spinner'
  style,
  textStyle,
  fullScreen = false
}) => {
  const containerStyle = [
    fullScreen ? styles.fullScreenContainer : styles.container,
    style
  ];

  const loadingElement = variant === 'spinner' ? (
    <FAIcon name="spinner" size={size === 'large' ? 32 : 20} color={color} />
  ) : (
    <ActivityIndicator size={size} color={color} />
  );

  return (
    <View style={containerStyle}>
      {loadingElement}
      {text && (
        <Text style={[
          styles.text, 
          size === 'large' && styles.textLarge,
          textStyle
        ]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.BACKGROUND,
    gap: 12,
  },
  text: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
  textLarge: {
    fontSize: 16,
    marginTop: 4,
  },
});

export default LoadingIndicator;