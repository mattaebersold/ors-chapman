import React from 'react';
import { View, StyleSheet } from 'react-native';
import BaseCard from './BaseCard';
import { designTokens } from '../../constants/tokens';

/**
 * Variant Card Component
 * Provides different card styles and layouts using the design token system
 */
const VariantCard = ({
  variant = 'default',
  size = 'medium',
  elevation = 'medium',
  children,
  style,
  ...props
}) => {
  const variants = {
    default: {
      backgroundColor: designTokens.colors.WHITE,
      borderColor: designTokens.colors.BORDER,
      borderWidth: 1,
    },
    elevated: {
      backgroundColor: designTokens.colors.WHITE,
      borderColor: 'transparent',
      borderWidth: 0,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: designTokens.colors.BORDER,
      borderWidth: 2,
    },
    filled: {
      backgroundColor: designTokens.colors.LIGHT_GRAY,
      borderColor: 'transparent',
      borderWidth: 0,
    },
    dark: {
      backgroundColor: designTokens.colors.CARD_DARK,
      borderColor: designTokens.colors.CARD_DARK,
      borderWidth: 1,
    },
    accent: {
      backgroundColor: designTokens.colors.BRG + '10', // 10% opacity
      borderColor: designTokens.colors.BRG,
      borderWidth: 1,
    },
  };

  const sizes = {
    compact: {
      padding: designTokens.spacing.sm,
      borderRadius: designTokens.layout.borderRadius.xs,
    },
    medium: {
      padding: designTokens.spacing.lg,
      borderRadius: designTokens.layout.borderRadius.md,
    },
    large: {
      padding: designTokens.spacing.xl,
      borderRadius: designTokens.layout.borderRadius.lg,
    },
  };

  const elevations = {
    none: {},
    low: designTokens.shadows.sm,
    medium: designTokens.shadows.md,
    high: designTokens.shadows.lg,
  };

  const variantStyle = variants[variant] || variants.default;
  const sizeStyle = sizes[size] || sizes.medium;
  const elevationStyle = elevations[elevation] || elevations.medium;

  const cardStyle = [
    styles.base,
    variantStyle,
    sizeStyle,
    elevationStyle,
    style,
  ];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

// For cards that need BaseCard functionality with variants
export const VariantBaseCard = ({
  variant = 'default',
  size = 'medium',
  elevation = 'medium',
  ...props
}) => {
  const variants = {
    default: {
      backgroundColor: designTokens.colors.WHITE,
      borderColor: designTokens.colors.BORDER,
      borderWidth: 1,
    },
    elevated: {
      backgroundColor: designTokens.colors.WHITE,
      borderColor: 'transparent',
      borderWidth: 0,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: designTokens.colors.BORDER,
      borderWidth: 2,
    },
    filled: {
      backgroundColor: designTokens.colors.LIGHT_GRAY,
      borderColor: 'transparent',
      borderWidth: 0,
    },
    dark: {
      backgroundColor: designTokens.colors.CARD_DARK,
      borderColor: designTokens.colors.CARD_DARK,
      borderWidth: 1,
    },
    accent: {
      backgroundColor: designTokens.colors.BRG + '10',
      borderColor: designTokens.colors.BRG,
      borderWidth: 1,
    },
  };

  const sizes = {
    compact: {
      borderRadius: designTokens.layout.borderRadius.xs,
    },
    medium: {
      borderRadius: designTokens.layout.borderRadius.md,
    },
    large: {
      borderRadius: designTokens.layout.borderRadius.lg,
    },
  };

  const elevations = {
    none: {},
    low: designTokens.shadows.sm,
    medium: designTokens.shadows.md,
    high: designTokens.shadows.lg,
  };

  const variantStyle = variants[variant] || variants.default;
  const sizeStyle = sizes[size] || sizes.medium;
  const elevationStyle = elevations[elevation] || elevations.medium;

  const cardStyle = [
    variantStyle,
    sizeStyle,
    elevationStyle,
    props.cardStyle,
  ];

  return (
    <BaseCard
      {...props}
      cardStyle={cardStyle}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

export default VariantCard;