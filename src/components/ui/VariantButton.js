import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import FAIcon from './FAIcon';
import { designTokens } from '../../constants/tokens';

/**
 * Variant Button Component
 * Comprehensive button system with consistent variants and sizes
 */
const VariantButton = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onPress,
  style,
  textStyle,
  ...props
}) => {
  const variants = {
    primary: {
      backgroundColor: designTokens.colors.BRG,
      borderColor: designTokens.colors.BRG,
      textColor: designTokens.colors.WHITE,
    },
    secondary: {
      backgroundColor: designTokens.colors.LIGHT_GRAY,
      borderColor: designTokens.colors.LIGHT_GRAY,
      textColor: designTokens.colors.TEXT_PRIMARY,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: designTokens.colors.BRG,
      textColor: designTokens.colors.BRG,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textColor: designTokens.colors.BRG,
    },
    danger: {
      backgroundColor: designTokens.colors.ERROR,
      borderColor: designTokens.colors.ERROR,
      textColor: designTokens.colors.WHITE,
    },
    success: {
      backgroundColor: designTokens.colors.SUCCESS,
      borderColor: designTokens.colors.SUCCESS,
      textColor: designTokens.colors.WHITE,
    },
    warning: {
      backgroundColor: designTokens.colors.WARNING,
      borderColor: designTokens.colors.WARNING,
      textColor: designTokens.colors.WHITE,
    },
  };

  const sizes = {
    small: {
      height: designTokens.components.button.height.sm,
      paddingHorizontal: designTokens.spacing.md,
      paddingVertical: designTokens.spacing.xs,
      fontSize: designTokens.typography.fontSize.sm,
      iconSize: 14,
      borderRadius: designTokens.layout.borderRadius.xs,
    },
    medium: {
      height: designTokens.components.button.height.md,
      paddingHorizontal: designTokens.spacing.lg,
      paddingVertical: designTokens.spacing.sm,
      fontSize: designTokens.typography.fontSize.md,
      iconSize: 16,
      borderRadius: designTokens.layout.borderRadius.sm,
    },
    large: {
      height: designTokens.components.button.height.lg,
      paddingHorizontal: designTokens.spacing.xl,
      paddingVertical: designTokens.spacing.md,
      fontSize: designTokens.typography.fontSize.lg,
      iconSize: 18,
      borderRadius: designTokens.layout.borderRadius.md,
    },
  };

  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes[size] || sizes.medium;

  const buttonStyle = [
    styles.base,
    {
      backgroundColor: variantStyle.backgroundColor,
      borderColor: variantStyle.borderColor,
      height: sizeStyle.height,
      paddingHorizontal: sizeStyle.paddingHorizontal,
      paddingVertical: sizeStyle.paddingVertical,
      borderRadius: sizeStyle.borderRadius,
      opacity: disabled ? designTokens.opacity.disabled : designTokens.opacity.opaque,
      width: fullWidth ? '100%' : 'auto',
    },
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color: variantStyle.textColor,
      fontSize: sizeStyle.fontSize,
      fontWeight: designTokens.typography.fontWeight.semibold,
    },
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={variantStyle.textColor}
        />
      );
    }

    const textElement = (
      <Text style={textStyles} numberOfLines={1}>
        {children}
      </Text>
    );

    if (!icon) {
      return textElement;
    }

    const iconElement = (
      <FAIcon
        name={icon}
        size={sizeStyle.iconSize}
        color={disabled ? designTokens.colors.GRAY : variantStyle.textColor}
        style={[
          iconPosition === 'left' ? { marginRight: designTokens.spacing.sm } : { marginLeft: designTokens.spacing.sm }
        ]}
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
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={disabled ? 1 : 0.7}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 32,
  },
  text: {
    textAlign: 'center',
  },
});

export default VariantButton;