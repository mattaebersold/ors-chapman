import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from './FAIcon';

const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'danger'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left', // 'left', 'right'
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.buttonSmall);
        break;
      case 'large':
        baseStyle.push(styles.buttonLarge);
        break;
      default:
        baseStyle.push(styles.buttonMedium);
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.buttonSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.buttonOutline);
        break;
      case 'danger':
        baseStyle.push(styles.buttonDanger);
        break;
      default:
        baseStyle.push(styles.buttonPrimary);
    }

    // State styles
    if (disabled || loading) {
      baseStyle.push(styles.buttonDisabled);
    }

    if (fullWidth) {
      baseStyle.push(styles.buttonFullWidth);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText];
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.textSmall);
        break;
      case 'large':
        baseStyle.push(styles.textLarge);
        break;
      default:
        baseStyle.push(styles.textMedium);
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.textSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.textOutline);
        break;
      case 'danger':
        baseStyle.push(styles.textDanger);
        break;
      default:
        baseStyle.push(styles.textPrimary);
    }

    if (disabled) {
      baseStyle.push(styles.textDisabled);
    }

    return baseStyle;
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={variant === 'outline' ? colors.BRG : colors.WHITE} />;
    }

    const textElement = <Text style={[...getTextStyle(), textStyle]}>{title}</Text>;
    
    if (!icon) {
      return textElement;
    }

    const iconColor = variant === 'outline' ? colors.BRG : colors.WHITE;
    const iconElement = (
      <FAIcon 
        name={icon} 
        size={size === 'small' ? 14 : size === 'large' ? 18 : 16} 
        color={disabled ? colors.GRAY : iconColor} 
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
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 8,
  },
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonMedium: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonLarge: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonPrimary: {
    backgroundColor: colors.BRG,
  },
  buttonSecondary: {
    backgroundColor: colors.LIGHT_GRAY,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.BRG,
  },
  buttonDanger: {
    backgroundColor: colors.ERROR,
  },
  buttonDisabled: {
    backgroundColor: colors.GRAY,
    borderColor: colors.GRAY,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 12,
  },
  textMedium: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 16,
  },
  textPrimary: {
    color: colors.WHITE,
  },
  textSecondary: {
    color: colors.TEXT_PRIMARY,
  },
  textOutline: {
    color: colors.BRG,
  },
  textDanger: {
    color: colors.WHITE,
  },
  textDisabled: {
    color: colors.WHITE,
  },
});

export default Button;