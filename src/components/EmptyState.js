import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from './FAIcon';

const EmptyState = ({ 
  title = 'No Items Found',
  message = 'There are no items to display.',
  icon = 'calendar',
  iconSize = 48,
  actionText,
  onAction,
  style,
  titleStyle,
  messageStyle,
  fullScreen = false
}) => {
  const containerStyle = [
    fullScreen ? styles.fullScreenContainer : styles.container,
    style
  ];

  return (
    <View style={containerStyle}>
      <FAIcon name={icon} size={iconSize} color={colors.TEXT_SECONDARY} />
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      <Text style={[styles.message, messageStyle]}>{message}</Text>
      {actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 12,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.BACKGROUND,
    paddingHorizontal: 20,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  actionText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EmptyState;