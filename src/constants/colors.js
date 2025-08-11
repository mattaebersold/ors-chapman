export const colors = {
  // Primary brand colors
  BRG: '#1C3738',
  SPEED: '#FEB829',
  
  // Common colors
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: '#808080',
  LIGHT_GRAY: '#F5F5F5',
  DARK_GRAY: '#333333',
  
  // Status colors
  SUCCESS: '#28A745',
  ERROR: '#DC3545',
  WARNING: '#FFC107',
  INFO: '#17A2B8',
  
  // Additional status colors
  GREEN: '#28A745',
  YELLOW: '#FFC107',
  ORANGE: '#FF6B35',
  BLUE: '#17A2B8',
  
  // Additional brand colors (you can add more as needed)
  ACCENT: '#2E5E60',
  LIGHT_BRG: '#3A5A5C',
  BACKGROUND: '#F8F9FA',
  BORDER: '#E9ECEF',
  
  // Text colors
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#666666',
};

// Post type color mapping
export const getPostTypeColor = (type) => {
  const typeColors = {
    'listing': '#FF6B35', // Orange for marketplace listings
    'record': '#4CAF50', // Green for car records
    'spot': '#9C27B0', // Purple for car spots
    'project': '#2196F3', // Blue for projects
    'event': '#FF9800', // Amber for events
    'post': '#607D8B', // Blue Grey for general posts
    'article': '#795548', // Brown for articles
    'default': colors.BRG, // Default app color
  };
  return typeColors[type?.toLowerCase()] || typeColors.default;
};

// Category color mapping
export const getCategoryColor = (category) => {
  const categoryColors = {
    // Car categories
    'engine': '#F44336', // Red
    'suspension': '#E91E63', // Pink
    'wheels': '#9C27B0', // Purple
    'interior': '#673AB7', // Deep Purple
    'exterior': '#3F51B5', // Indigo
    'electrical': '#2196F3', // Blue
    'performance': '#00BCD4', // Cyan
    'maintenance': '#009688', // Teal
    'restoration': '#4CAF50', // Green
    'modification': '#8BC34A', // Light Green
    'tuning': '#CDDC39', // Lime
    'racing': '#FFEB3B', // Yellow
    'drift': '#FF9800', // Orange
    'street': '#FF5722', // Deep Orange
    'track': '#795548', // Brown
    'show': '#9E9E9E', // Grey
    'daily': '#607D8B', // Blue Grey
    'vintage': '#5D4037', // Dark Brown
    'jdm': '#E53935', // Red variant
    'euro': '#1976D2', // Blue variant
    'american': '#F57C00', // Orange variant
    'default': colors.LIGHT_GRAY, // Default light color
  };
  return categoryColors[category?.toLowerCase()] || categoryColors.default;
};

// Function to determine if a color is light or dark and return appropriate text color
export const getContrastTextColor = (backgroundColor) => {
  // Remove # if present
  const hex = backgroundColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance using relative luminance formula
  // https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white text for dark backgrounds, black text for light backgrounds
  return luminance > 0.5 ? colors.BLACK : colors.WHITE;
};

export default colors;