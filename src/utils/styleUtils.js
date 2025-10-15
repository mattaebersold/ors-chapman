import { StyleSheet } from 'react-native';
import { designTokens } from '../constants/tokens';

/**
 * Style Utilities
 * Helper functions for applying design tokens consistently
 */

// Create component styles with design tokens
export const createComponentStyles = (componentType, variant = 'md') => {
  const component = designTokens.components[componentType];
  if (!component) return {};

  const baseStyles = {};

  // Apply common properties based on component type
  switch (componentType) {
    case 'button':
      baseStyles.height = component.height[variant];
      baseStyles.paddingHorizontal = component.padding[variant].horizontal;
      baseStyles.paddingVertical = component.padding[variant].vertical;
      baseStyles.borderRadius = component.borderRadius[variant];
      baseStyles.fontSize = component.fontSize[variant];
      break;
    case 'card':
      baseStyles.padding = component.padding;
      baseStyles.borderRadius = component.borderRadius;
      baseStyles.backgroundColor = component.backgroundColor;
      baseStyles.borderColor = component.borderColor;
      baseStyles.borderWidth = 1;
      Object.assign(baseStyles, component.shadow);
      break;
    case 'input':
      baseStyles.height = component.height;
      baseStyles.paddingHorizontal = component.padding.horizontal;
      baseStyles.paddingVertical = component.padding.vertical;
      baseStyles.borderRadius = component.borderRadius;
      baseStyles.borderWidth = component.borderWidth;
      baseStyles.borderColor = component.borderColor;
      baseStyles.backgroundColor = component.backgroundColor;
      baseStyles.fontSize = component.fontSize;
      break;
    case 'modal':
      baseStyles.borderRadius = component.borderRadius;
      baseStyles.padding = component.padding;
      baseStyles.backgroundColor = component.backgroundColor;
      Object.assign(baseStyles, component.shadow);
      break;
    case 'badge':
      baseStyles.paddingHorizontal = component.padding.horizontal;
      baseStyles.paddingVertical = component.padding.vertical;
      baseStyles.borderRadius = component.borderRadius;
      baseStyles.fontSize = component.fontSize;
      baseStyles.fontWeight = component.fontWeight;
      break;
  }

  return baseStyles;
};

// Typography utilities
export const createTextStyle = ({
  size = 'md',
  weight = 'normal',
  color = 'primary',
  lineHeight = 'normal',
  letterSpacing = 'normal',
}) => {
  const colorValue = designTokens.themes.light[`text${color.charAt(0).toUpperCase() + color.slice(1)}`] ||
                   designTokens.colors[color.toUpperCase()] ||
                   color;

  return {
    fontSize: designTokens.typography.fontSize[size],
    fontWeight: designTokens.typography.fontWeight[weight],
    color: colorValue,
    lineHeight: designTokens.typography.fontSize[size] * designTokens.typography.lineHeight[lineHeight],
    letterSpacing: designTokens.typography.letterSpacing[letterSpacing],
  };
};

// Spacing utilities
export const spacing = (top = 0, right = top, bottom = top, left = right) => {
  const getValue = (value) => {
    if (typeof value === 'string' && designTokens.spacing[value]) {
      return designTokens.spacing[value];
    }
    return value;
  };

  return {
    paddingTop: getValue(top),
    paddingRight: getValue(right),
    paddingBottom: getValue(bottom),
    paddingLeft: getValue(left),
  };
};

export const margin = (top = 0, right = top, bottom = top, left = right) => {
  const getValue = (value) => {
    if (typeof value === 'string' && designTokens.spacing[value]) {
      return designTokens.spacing[value];
    }
    return value;
  };

  return {
    marginTop: getValue(top),
    marginRight: getValue(right),
    marginBottom: getValue(bottom),
    marginLeft: getValue(left),
  };
};

// Layout utilities
export const flexCenter = {
  justifyContent: 'center',
  alignItems: 'center',
};

export const flexBetween = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const flexColumn = {
  flexDirection: 'column',
};

export const flexRow = {
  flexDirection: 'row',
  alignItems: 'center',
};

// Shadow utilities
export const applyShadow = (size = 'md') => {
  return designTokens.shadows[size] || designTokens.shadows.md;
};

// Border radius utilities
export const borderRadius = (size = 'md') => {
  return {
    borderRadius: designTokens.layout.borderRadius[size] || size,
  };
};

// Theme utilities
export const applyTheme = (theme = 'light') => {
  return designTokens.themes[theme] || designTokens.themes.light;
};

// Animation utilities
export const animationConfig = (duration = 'normal', easing = 'easeInOut') => {
  return {
    duration: designTokens.animations.duration[duration] || duration,
    easing: designTokens.animations.easing[easing] || easing,
  };
};

// Responsive utilities (for future use)
export const responsive = (styles) => {
  // This would be expanded for responsive design
  return styles;
};

// Style composition utility
export const composeStyles = (...styles) => {
  return StyleSheet.flatten(styles);
};

// Create style sheet with design tokens
export const createStyles = (styleObject) => {
  return StyleSheet.create(styleObject);
};

const truncateText = (text, maxLength = 8) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};


export default {
  createComponentStyles,
  createTextStyle,
  spacing,
  margin,
  flexCenter,
  flexBetween,
  flexColumn,
  flexRow,
  applyShadow,
  borderRadius,
  applyTheme,
  animationConfig,
  responsive,
  composeStyles,
  createStyles,
  truncateText,
};