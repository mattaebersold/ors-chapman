import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { designTokens } from '../../constants/tokens';

/**
 * Variant Badge Component
 * Provides different badge styles using the design token system
 */
const VariantBadge = ({
  children,
  variant = 'default',
  size = 'medium',
  color,
  style,
  textStyle,
  ...props
}) => {
  const variants = {
    default: {
      backgroundColor: designTokens.colors.GRAY,
      textColor: designTokens.colors.WHITE,
    },
    primary: {
      backgroundColor: designTokens.colors.BRG,
      textColor: designTokens.colors.WHITE,
    },
    secondary: {
      backgroundColor: designTokens.colors.LIGHT_GRAY,
      textColor: designTokens.colors.TEXT_PRIMARY,
    },
    success: {
      backgroundColor: designTokens.colors.SUCCESS,
      textColor: designTokens.colors.WHITE,
    },
    warning: {
      backgroundColor: designTokens.colors.WARNING,
      textColor: designTokens.colors.WHITE,
    },
    danger: {
      backgroundColor: designTokens.colors.ERROR,
      textColor: designTokens.colors.WHITE,
    },
    info: {
      backgroundColor: designTokens.colors.INFO,
      textColor: designTokens.colors.WHITE,
    },
    outline: {
      backgroundColor: 'transparent',
      textColor: designTokens.colors.BRG,
      borderWidth: 1,
      borderColor: designTokens.colors.BRG,
    },
    subtle: {
      backgroundColor: designTokens.colors.LIGHT_GRAY,
      textColor: designTokens.colors.TEXT_SECONDARY,
    },
  };

  const sizes = {
    small: {
      paddingHorizontal: designTokens.spacing.xs,
      paddingVertical: 2,
      fontSize: designTokens.typography.fontSize.xs,
      borderRadius: designTokens.layout.borderRadius.xs,
      minHeight: 16,
    },
    medium: {
      paddingHorizontal: designTokens.spacing.sm,
      paddingVertical: designTokens.spacing.xs,
      fontSize: designTokens.typography.fontSize.sm,
      borderRadius: designTokens.layout.borderRadius.xs,
      minHeight: 20,
    },
    large: {
      paddingHorizontal: designTokens.spacing.md,
      paddingVertical: designTokens.spacing.sm,
      fontSize: designTokens.typography.fontSize.md,
      borderRadius: designTokens.layout.borderRadius.sm,
      minHeight: 28,
    },
  };

  const variantStyle = variants[variant] || variants.default;
  const sizeStyle = sizes[size] || sizes.medium;

  // Allow color override
  const backgroundColor = color || variantStyle.backgroundColor;
  const textColor = color
    ? (designTokens.colors.getContrastTextColor?.(color) || designTokens.colors.WHITE)
    : variantStyle.textColor;

  const badgeStyle = [
    styles.base,
    {
      backgroundColor,
      paddingHorizontal: sizeStyle.paddingHorizontal,
      paddingVertical: sizeStyle.paddingVertical,
      borderRadius: sizeStyle.borderRadius,
      minHeight: sizeStyle.minHeight,
      borderWidth: variantStyle.borderWidth || 0,
      borderColor: variantStyle.borderColor,
    },
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color: textColor,
      fontSize: sizeStyle.fontSize,
      fontWeight: designTokens.typography.fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    textStyle,
  ];

  return (
    <View style={badgeStyle} {...props}>
      <Text style={textStyles} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
};

// Specialized badge variants for common use cases
export const StatusBadge = ({ status, ...props }) => {
  const statusVariants = {
    active: 'success',
    inactive: 'subtle',
    pending: 'warning',
    error: 'danger',
    draft: 'secondary',
    published: 'primary',
  };

  return (
    <VariantBadge
      variant={statusVariants[status] || 'default'}
      {...props}
    >
      {status}
    </VariantBadge>
  );
};

export const PriorityBadge = ({ priority, ...props }) => {
  const priorityVariants = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger',
  };

  const priorityColors = {
    low: designTokens.colors.PRIORITY_COMPLETED,
    medium: designTokens.colors.PRIORITY_MEDIUM,
    high: designTokens.colors.PRIORITY_HIGH,
    critical: designTokens.colors.PRIORITY_HIGH,
  };

  return (
    <VariantBadge
      variant={priorityVariants[priority] || 'default'}
      color={priorityColors[priority]}
      {...props}
    >
      {priority}
    </VariantBadge>
  );
};

export const CategoryBadge = ({ category, ...props }) => {
  const categoryColor = designTokens.colors.getCategoryColor?.(category) || designTokens.colors.GRAY;

  return (
    <VariantBadge
      variant="default"
      color={categoryColor}
      {...props}
    >
      {category}
    </VariantBadge>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default VariantBadge;