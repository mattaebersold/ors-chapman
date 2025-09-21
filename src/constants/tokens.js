import { colors } from './colors';
import { spacing, layout, shadows } from './layout';

/**
 * Design Tokens System
 * Centralized design system tokens for consistent UI patterns
 */

// Typography tokens
export const typography = {
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    xxxxl: 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// Component tokens
export const components = {
  button: {
    height: {
      sm: 32,
      md: 44,
      lg: 56,
    },
    padding: {
      sm: { horizontal: spacing.md, vertical: spacing.xs },
      md: { horizontal: spacing.lg, vertical: spacing.sm },
      lg: { horizontal: spacing.xl, vertical: spacing.md },
    },
    borderRadius: {
      sm: layout.borderRadius.xs,
      md: layout.borderRadius.sm,
      lg: layout.borderRadius.md,
    },
    fontSize: {
      sm: typography.fontSize.sm,
      md: typography.fontSize.md,
      lg: typography.fontSize.lg,
    },
  },
  card: {
    padding: spacing.lg,
    borderRadius: layout.borderRadius.md,
    shadow: shadows.md,
    backgroundColor: colors.WHITE,
    borderColor: colors.BORDER,
  },
  input: {
    height: 44,
    padding: { horizontal: spacing.md, vertical: spacing.md },
    borderRadius: layout.borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.BORDER,
    backgroundColor: colors.WHITE,
    fontSize: typography.fontSize.md,
  },
  modal: {
    borderRadius: layout.borderRadius.lg,
    padding: spacing.lg,
    backgroundColor: colors.WHITE,
    shadow: shadows.lg,
  },
  badge: {
    padding: { horizontal: spacing.sm, vertical: spacing.xs },
    borderRadius: layout.borderRadius.xs,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
};

// Animation tokens
export const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    linear: 'linear',
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
  },
};

// Z-index tokens
export const zIndex = {
  base: 0,
  elevated: 10,
  overlay: 100,
  modal: 1000,
  toast: 9000,
  tooltip: 9999,
};

// Opacity tokens
export const opacity = {
  disabled: 0.4,
  muted: 0.6,
  emphasized: 0.8,
  opaque: 1,
};

// Responsive breakpoints (for future use)
export const breakpoints = {
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1200,
};

// Theme variants
export const themes = {
  light: {
    background: colors.WHITE,
    surface: colors.LIGHT_GRAY,
    text: colors.TEXT_PRIMARY,
    textSecondary: colors.TEXT_SECONDARY,
    border: colors.BORDER,
    accent: colors.BRG,
  },
  dark: {
    background: colors.CARD_DARK,
    surface: colors.DARK_GRAY,
    text: colors.TEXT_LIGHT,
    textSecondary: colors.TEXT_MUTED,
    border: colors.DARK_GRAY,
    accent: colors.BRG,
  },
};

// Consolidated design system
export const designTokens = {
  colors,
  typography,
  spacing,
  layout,
  shadows,
  components,
  animations,
  zIndex,
  opacity,
  breakpoints,
  themes,
};

export default designTokens;