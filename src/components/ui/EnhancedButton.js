import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import FAIcon from './FAIcon';
import { createComponentStyles, createTextStyle, createStyles } from '../../utils/styleUtils';
import { designTokens } from '../../constants/tokens';

/**
 * Enhanced Button Component using Design Tokens
 * Provides consistent button styling with variant support
 */
const EnhancedButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'danger', 'ghost'
  size = 'md', // 'sm', 'md', 'lg'
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left', // 'left', 'right'
  style,
  textStyle,
  fullWidth = false,
  ...props
}) => {
  // Get base component styles
  const baseStyles = createComponentStyles('button', size);

  // Create button-specific styles
  const buttonStyles = createStyles({
    button: {
      ...baseStyles,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: designTokens.spacing.sm,
      ...(fullWidth && { width: '100%' }),
      ...(disabled && { opacity: designTokens.opacity.disabled }),
    },
    primary: {
      backgroundColor: designTokens.colors.BRG,
    },
    secondary: {
      backgroundColor: designTokens.colors.LIGHT_GRAY,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: designTokens.colors.BRG,
    },
    danger: {
      backgroundColor: designTokens.colors.ERROR,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  });

  // Create text styles based on variant and size
  const getTextColor = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return designTokens.colors.BRG;
      case 'secondary':
        return designTokens.colors.TEXT_PRIMARY;
      default:
        return designTokens.colors.WHITE;
    }
  };

  const textStyles = createTextStyle({
    size: size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md',
    weight: 'semibold',
    color: getTextColor(),
  });

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size={size === 'sm' ? 'small' : 'small'}
          color={getTextColor()}
        />
      );
    }

    const textElement = (
      <Text style={[textStyles, textStyle]} numberOfLines={1}>
        {title}
      </Text>
    );

    if (!icon) {
      return textElement;
    }

    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
    const iconElement = (
      <FAIcon
        name={icon}
        size={iconSize}
        color={disabled ? designTokens.colors.GRAY : getTextColor()}
      />
    );

    return (
      <>
        {iconPosition === 'left' && iconElement}
        {textElement}
        {iconPosition === 'right' && iconElement}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[
        buttonStyles.button,
        buttonStyles[variant],
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={disabled ? 1 : 0.7}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

export default EnhancedButton;